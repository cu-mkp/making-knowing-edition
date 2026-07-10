// Client-side search for the static mirror: a vanilla port of
// src/model/SearchIndex.js. Loads the prebuilt lunr indexes (~30 MB) lazily
// on the first search, then searches the three transcription versions and the
// research essays entirely in the browser.

(function() {
    var TYPES = ['tl', 'tc', 'tcn', 'anno'];
    var TYPE_LABELS = {
        tl: 'Translation (EN)',
        tc: 'Diplomatic (FR)',
        tcn: 'Normalized (FR)',
        anno: 'Research Essays'
    };

    var searchData;             // embedded page payload
    var searchIndex = {};       // lunr indexes by type
    var recipeBook = {};        // passages by type
    var loaded = false;
    var loading = null;
    var lastResults = null;

    function fetchJSON(url) {
        return fetch(url).then(function(response) {
            if (!response.ok) throw new Error('Failed to load ' + url);
            return response.json();
        });
    }

    // port of SearchIndex.load (lazy)
    function loadIndexes() {
        if (loaded) return Promise.resolve();
        if (loading) return loading;
        var base = searchData.indexBaseURL;
        loading = Promise.all([
            fetchJSON(base + '/annotation_search_index.js'),
            fetchJSON(base + '/tl_search_index.js'),
            fetchJSON(base + '/tl_recipe_book.js'),
            fetchJSON(base + '/tc_search_index.js'),
            fetchJSON(base + '/tc_recipe_book.js'),
            fetchJSON(base + '/tcn_search_index.js'),
            fetchJSON(base + '/tcn_recipe_book.js')
        ]).then(function(data) {
            searchIndex['anno'] = lunr.Index.load(data[0]);
            ['tl', 'tc', 'tcn'].forEach(function(type, i) {
                searchIndex[type] = lunr.Index.load(data[1 + i*2]);
                searchIndex[type].pipeline.remove(lunr.stemmer);
                searchIndex[type].pipeline.remove(lunr.stopWordFilter);
                recipeBook[type] = data[2 + i*2];
            });
            loaded = true;
        });
        return loading;
    }

    function parseIDs(docID) {
        var parts = docID.split('-');
        return { recipeID: parts[0], folioID: parts[1] };
    }

    // port of SearchIndex.parseSearchInput
    function parseSearchInput(searchInput) {
        var filteredInput = searchInput.replace(/[^\w\s*"']/g, '').replace(/[\s]+/, ' ');
        if (!filteredInput.match(/\w/)) return null;

        var phrases = [], terms = [];
        var fragments = filteredInput.split('"');
        for (var i = 0; i < fragments.length; i++) {
            var fragment = fragments[i];
            if (fragment.length > 0) {
                var fragTerms = fragment.split(' ').filter(function(t) { return t.length > 0; });
                if (i % 2) phrases.push(fragTerms);
                terms = terms.concat(fragTerms);
            }
        }

        if (phrases.length > 0) {
            phrases = phrases.map(function(phrase) {
                return phrase.map(function(term) { return term.replace(/[*]/g, ''); });
            });
            terms = terms.map(function(term) { return term.replace(/[*]/g, ''); });
        }

        return { phrases: phrases, terms: terms };
    }

    // port of SearchIndex.phraseMatchFilter
    function phraseMatchFilter(terms, transcriptionType, results) {
        var nextWordRegex = /^[\s]*[\n]*[\w]+/;
        var phraseMatches = [];
        for (var r = 0; r < results.length; r++) {
            var result = results[r];
            var ids = parseIDs(result.ref);
            var recipe = recipeBook[transcriptionType][ids.recipeID];
            if (!recipe) continue;

            var passage = recipe.passages[ids.folioID];
            var foundTerms = result.matchData.metadata;
            var firstTerm = terms[0];
            if (!foundTerms[firstTerm] || !foundTerms[firstTerm].content) continue;

            var possiblePhrases = foundTerms[firstTerm].content.position.map(function(position) {
                return { offset: position[0], range: position[1] };
            });

            for (var i = 1; i < terms.length && possiblePhrases.length > 0; i++) {
                var term = terms[i];
                var nextPhrases = [];
                for (var j = 0; j < possiblePhrases.length; j++) {
                    var possiblePhrase = possiblePhrases[j];
                    var remainingRange = passage.substring(possiblePhrase.offset + possiblePhrase.range, passage.length);
                    var matches = remainingRange.match(nextWordRegex);
                    var nextWord = matches ? matches[0] : null;
                    if (nextWord && nextWord.match(term)) {
                        possiblePhrase.range = nextWord.length + possiblePhrase.range;
                        nextPhrases.push(possiblePhrase);
                    }
                }
                possiblePhrases = nextPhrases;
            }

            if (possiblePhrases.length > 0) {
                var phrases = {};
                phrases[firstTerm] = possiblePhrases.map(function(p) { return [p.offset, p.range]; });
                result.matchData.metadata = phrases;
                phraseMatches.push(result);
            }
        }
        return phraseMatches;
    }

    // port of SearchIndex.searchEdition
    function searchEdition(searchInput, transcriptionType) {
        var searchTerms = parseSearchInput(searchInput);
        if (!searchTerms) return [];
        var lunrIndex = searchIndex[transcriptionType];

        var searchString = searchTerms.terms.map(function(t) { return '+' + t; }).join(' ');
        var results;
        try {
            results = lunrIndex.search(searchString);
        } catch (e) {
            return [];
        }

        if (results && searchTerms.phrases.length > 0) {
            results = phraseMatchFilter(searchTerms.phrases[0], transcriptionType, results);
        }

        var displayResults = [];
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var ids = parseIDs(result.ref);
            var recipe = recipeBook[transcriptionType][ids.recipeID];
            var friendlyFolioName = ids.folioID.slice(1).replace(/^[0|\D]*/, '');
            if (recipe) {
                displayResults.push({
                    name: recipe.name,
                    folio: ids.folioID,
                    friendlyFolioName: friendlyFolioName,
                    index: recipe.numericIndex,
                    matchedTerms: Object.keys(result.matchData.metadata),
                    contextFragment: recipe.passages[ids.folioID]
                });
            }
        }
        return displayResults;
    }

    // port of SearchIndex.searchAnnotations
    function searchAnnotations(searchInput) {
        var searchTerms = parseSearchInput(searchInput);
        if (!searchTerms) return [];
        var searchString = searchTerms.terms.map(function(t) { return '+' + t; }).join(' ');
        var results;
        try {
            results = searchIndex['anno'].search(searchString);
        } catch (e) {
            return [];
        }
        return results.map(function(result) {
            return { id: result.ref, matchedTerms: Object.keys(result.matchData.metadata) };
        });
    }

    function escapeHTML(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // highlight matched terms in a plain-text passage
    function highlight(passage, matchedTerms) {
        var html = escapeHTML(passage);
        matchedTerms.forEach(function(term) {
            if (!term || !term.match(/\w/)) return;
            html = html.replace(new RegExp('(' + escapeRegExp(escapeHTML(term)) + ')', 'gi'),
                '<span class="highlight">$1</span>');
        });
        return html;
    }

    function renderResult(type, result) {
        if (type !== 'anno') {
            var folioURL = searchData.folioBaseURL + result.friendlyFolioName + '/#f/' + type;
            return '<a class="searchResult" href="' + folioURL + '">' +
                '<div class="title"><span class="name">' + result.name + '</span> ' +
                '(<span class="folio">' + escapeHTML(result.friendlyFolioName) + '</span>)</div>' +
                '<div class="contextFragments">' + highlight(result.contextFragment, result.matchedTerms) + '</div>' +
                '</a>';
        }
        var annotation = searchData.annotations[result.id];
        if (!annotation) return '';
        var inner = '<div class="title"><span class="name">' + annotation.name + '</span></div>' +
            '<div class="contextFragments">' + escapeHTML(annotation.theme + ', ' + annotation.semester + ' ' + annotation.year) + '</div>';
        return annotation.url
            ? '<a class="searchResult" href="' + annotation.url + '">' + inner + '</a>'
            : '<div class="searchResult">' + inner + '</div>';
    }

    function renderResults() {
        if (!lastResults) return;
        var resultsContainer = document.getElementById('search-results');
        var controls = document.getElementById('search-controls');
        controls.hidden = false;

        var sortByFolio = document.querySelector('input[name="sort"][value="folio"]').checked;
        var html = '';
        var total = 0;

        TYPES.forEach(function(type) {
            var results = lastResults[type] || [];
            var countElement = document.querySelector('[data-count="' + type + '"]');
            if (countElement) countElement.textContent = results.length;
            total += results.length;

            var checkbox = document.querySelector('input[data-type="' + type + '"]');
            if (!checkbox.checked || results.length === 0) return;

            if (type !== 'anno' && sortByFolio) {
                results = results.slice().sort(function(a, b) { return a.index - b.index; });
            }

            html += '<div class="resultSection"><div class="resultSectionHeader">' +
                TYPE_LABELS[type] + ' (' + results.length + (results.length === 1 ? ' match' : ' matches') + ')</div>' +
                results.map(function(result) { return renderResult(type, result); }).join('') +
                '</div>';
        });

        if (total === 0) {
            html = '<div class="noResultsFound">No results found for ‘' + escapeHTML(lastResults.searchQuery) + '’</div>';
        }
        resultsContainer.innerHTML = html;
    }

    function runSearch(query) {
        var status = document.getElementById('search-status');
        status.textContent = loaded ? 'Searching…' : 'Loading search indexes (this can take a moment on first use)…';

        loadIndexes().then(function() {
            lastResults = {
                searchQuery: query,
                tl: searchEdition(query, 'tl'),
                tc: searchEdition(query, 'tc'),
                tcn: searchEdition(query, 'tcn'),
                anno: searchAnnotations(query)
            };
            status.textContent = '';
            renderResults();
        }).catch(function(error) {
            status.textContent = 'Search is unavailable: ' + error.message;
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        var dataElement = document.getElementById('search-data');
        if (!dataElement) return;
        searchData = JSON.parse(dataElement.textContent);

        var form = document.getElementById('search-form');
        var input = document.getElementById('search-input');

        form.addEventListener('submit', function(event) {
            event.preventDefault();
            var query = input.value.trim();
            if (!query) return;
            history.replaceState(null, '', '?q=' + encodeURIComponent(query));
            runSearch(query);
        });

        document.getElementById('search-controls').addEventListener('change', renderResults);

        // support /search/?q=... deep links (and the React app's search URLs)
        var match = window.location.search.match(/[?&]q=([^&]*)/);
        if (match) {
            var query = decodeURIComponent(match[1].replace(/\+/g, ' '));
            input.value = query;
            runSearch(query);
        }
    });
})();
