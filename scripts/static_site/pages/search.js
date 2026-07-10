// Search page: form + results container. All searching happens client-side in
// js/search.js (lunr over the prebuilt indexes); this page embeds the essay
// metadata needed to render essay results.

const layout = require('../layout');

function embedJSON( data ) {
    return JSON.stringify(data).replace(/<\//g, '<\\/');
}

function generate( ctx ) {
    // minimal essay metadata for rendering annotation search results
    const annotationMeta = {};
    for( const annotation of ctx.annotations ) {
        annotationMeta[annotation.id] = {
            name: annotation.name,
            theme: annotation.theme,
            semester: annotation.semester,
            year: annotation.year,
            url: ctx.essayIsReadable(annotation) ? ctx.urlFor(`/essays/${annotation.id}/`) : null
        };
    }

    const searchData = {
        indexBaseURL: ctx.dataURL('search-idx'),
        folioBaseURL: ctx.urlFor('/folios/'),
        annotations: annotationMeta
    };

    const content = `
<div id="search-page" class="searchResultsComponent static-search">
    <h1>Search the Edition</h1>
    <p class="search-tips">Use quotes for exact phrases (e.g. &quot;bronze powder&quot;) and * as a wildcard (e.g. varnish*). Search covers the French transcriptions, the English translation, and the research essays.</p>
    <noscript><p><b>Search requires JavaScript.</b> You can also browse the <a href="${ctx.urlFor('/entries/')}">List of Entries</a>, the <a href="${ctx.urlFor('/glossary/')}">Glossary</a>, or the <a href="${ctx.urlFor('/folios/')}">folios</a>.</p></noscript>
    <form id="search-form">
        <div class="searchBox">
            <div class="searchField flex-parent">
                <input name="q" id="search-input" class="textField" type="search" aria-label="Search term">
                <button type="submit" class="cta-button">Search</button>
            </div>
        </div>
    </form>
    <div id="search-status" role="status"></div>
    <div class="searchResultControls" id="search-controls" hidden>
        <label><input type="radio" name="sort" value="folio" checked> Sort by Folio</label>
        <label><input type="radio" name="sort" value="relevance"> Sort by Relevance</label>
        <span class="filter-checks">
            <label><input type="checkbox" data-type="tl" checked> Translation (EN) (<span data-count="tl">0</span>)</label>
            <label><input type="checkbox" data-type="tc" checked> Diplomatic (FR) (<span data-count="tc">0</span>)</label>
            <label><input type="checkbox" data-type="tcn" checked> Normalized (FR) (<span data-count="tcn">0</span>)</label>
            <label><input type="checkbox" data-type="anno" checked> Research Essays (<span data-count="anno">0</span>)</label>
        </span>
    </div>
    <div class="searchResults" id="search-results"></div>
    <script type="application/json" id="search-data">${embedJSON(searchData)}</script>
</div>`;

    const html = layout.renderPage( ctx, {
        title: 'Search',
        path: '/search/',
        spaPath: '/search',
        bodyClass: 'search',
        description: 'Search the transcriptions, translation, and research essays of BnF Ms. Fr. 640.',
        content,
        scripts: [ 'js/search.js' ],
        extraHead: `<script src="${ctx.assetURL('vendor/lunr/lunr.min.js')}" defer></script>`
    });

    return [ { path: '/search/', html } ];
}

module.exports.generate = generate;
