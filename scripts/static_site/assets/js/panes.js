// Two-pane folio viewer for the static mirror.
//
// The page ships with the three transcription versions stacked in
// #folio-content (crawlable, works without JS). This module hides the stack
// and builds the split-pane viewer: each pane shows the facsimile (via
// facsimile.js/OpenSeadragon) or one transcription version, selected with a
// per-pane menu. Pane state is kept in the URL hash as #<left>/<right>
// (e.g. #f/tl), matching the transcription-type codes of the React app.

(function() {
    var VALID_TYPES = ['f', 'tc', 'tcn', 'tl'];
    var DEFAULT_STATE = { left: 'f', right: 'tc' };
    var MIN_PANE_WIDTH = 200;
    var DIVIDER_WIDTH = 16;

    var folioData, versionNodes, paneState, splitFraction;

    function readHash() {
        var hash = window.location.hash.replace(/^#/, '');
        var parts = hash.split('/');
        var state = { left: DEFAULT_STATE.left, right: DEFAULT_STATE.right };
        if (VALID_TYPES.indexOf(parts[0]) !== -1) state.left = parts[0];
        if (VALID_TYPES.indexOf(parts[1]) !== -1) state.right = parts[1];
        // a lone type (e.g. #tl) sets the right pane, facsimile on the left
        if (parts.length === 1 && VALID_TYPES.indexOf(parts[0]) !== -1 && parts[0] !== 'f') {
            state.left = 'f';
            state.right = parts[0];
        }
        return state;
    }

    function writeHash() {
        var hash = '#' + paneState.left + '/' + paneState.right;
        if (window.location.hash !== hash) {
            history.replaceState(null, '', hash);
        }
    }

    function typeLabel(type) {
        if (type === 'f') return 'Facsimile';
        var node = versionNodes[type];
        return node ? node.getAttribute('data-label') : type;
    }

    function buildToolbar(side) {
        var toolbar = document.createElement('div');
        toolbar.className = 'pane-toolbar';

        var select = document.createElement('select');
        select.setAttribute('aria-label', 'Pane content');
        VALID_TYPES.forEach(function(type) {
            var option = document.createElement('option');
            option.value = type;
            option.textContent = typeLabel(type);
            select.appendChild(option);
        });
        select.value = paneState[side];
        select.addEventListener('change', function() {
            paneState[side] = select.value;
            writeHash();
            renderPane(side);
        });
        toolbar.appendChild(select);
        return toolbar;
    }

    function renderPane(side) {
        var pane = document.getElementById('pane-' + side);
        pane.innerHTML = '';
        pane.appendChild(buildToolbar(side));

        var body = document.createElement('div');
        body.className = 'pane-body';
        var type = paneState[side];

        if (type === 'f') {
            body.classList.add('facsimile-pane');
            var osdElement = document.createElement('div');
            osdElement.className = 'facsimile-viewer';
            osdElement.id = 'osd-' + side;
            body.appendChild(osdElement);
            pane.appendChild(body);
            if (window.initFacsimile && folioData.infoURL) {
                window.initFacsimile(osdElement, folioData);
            }
        } else {
            var version = versionNodes[type];
            if (version) {
                var transcript = version.querySelector('.transcriptionViewComponent');
                var clone = transcript ? transcript.cloneNode(true) : null;
                var heading = version.querySelector('.version-heading .xml-link');
                if (heading) {
                    var xmlLink = heading.cloneNode(true);
                    var toolbar = pane.querySelector('.pane-toolbar');
                    toolbar.appendChild(xmlLink);
                }
                if (clone) body.appendChild(clone);
            }
            pane.appendChild(body);
        }
    }

    function applySplit() {
        var splitPane = document.getElementById('split-pane');
        var left = splitFraction;
        var right = 1.0 - left;
        splitPane.style.gridTemplateColumns = left + 'fr ' + DIVIDER_WIDTH + 'px ' + right + 'fr';
    }

    function initDividerDrag() {
        var divider = document.getElementById('pane-divider');
        var dragging = false;

        divider.addEventListener('pointerdown', function(event) {
            dragging = true;
            divider.setPointerCapture(event.pointerId);
            event.preventDefault();
        });
        divider.addEventListener('pointermove', function(event) {
            if (!dragging) return;
            var whole = window.innerWidth - DIVIDER_WIDTH;
            var leftWidth = event.clientX - DIVIDER_WIDTH / 2;
            var rightWidth = whole - leftWidth;
            if (leftWidth > MIN_PANE_WIDTH && rightWidth > MIN_PANE_WIDTH && whole > 0) {
                splitFraction = leftWidth / whole;
                applySplit();
            }
        });
        divider.addEventListener('pointerup', function() { dragging = false; });
    }

    function initJumpForm() {
        var form = document.querySelector('.jump-to-folio');
        if (!form) return;
        form.hidden = false;
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            var input = document.getElementById('jump-input');
            var name = (input.value || '').trim().toLowerCase();
            if (!name) return;
            if (!name.match(/^\d{1,3}[rv]$/)) {
                var numeric = parseInt(name, 10);
                if (isNaN(numeric)) { input.select(); return; }
                name = numeric + 'r';
            }
            if (folioData.folioNames && folioData.folioNames.indexOf(name) === -1) {
                input.setCustomValidity('No folio ' + name + ' in the manuscript');
                input.reportValidity();
                setTimeout(function() { input.setCustomValidity(''); }, 2000);
                return;
            }
            window.location.href = folioData.folioBaseURL + name + '/' +
                '#' + paneState.left + '/' + paneState.right;
        });
    }

    // carry the pane state through the prev/next links so paging keeps the view
    function propagateStateToNav() {
        var hash = '#' + paneState.left + '/' + paneState.right;
        ['prev', 'next'].forEach(function(rel) {
            var link = document.querySelector('a[rel="' + rel + '"]');
            if (link) link.href = link.href.split('#')[0] + hash;
        });
    }

    function init() {
        var dataElement = document.getElementById('folio-data');
        var splitPane = document.getElementById('split-pane');
        var stack = document.getElementById('folio-content');
        if (!dataElement || !splitPane || !stack) return;

        folioData = JSON.parse(dataElement.textContent);
        versionNodes = {};
        stack.querySelectorAll('.folio-version').forEach(function(section) {
            versionNodes[section.getAttribute('data-type')] = section;
        });

        paneState = readHash();
        splitFraction = 0.5;

        stack.hidden = true;
        splitPane.hidden = false;
        document.getElementById('document-view').classList.add('js-viewer');

        applySplit();
        renderPane('left');
        renderPane('right');
        writeHash();
        propagateStateToNav();
        initDividerDrag();
        initJumpForm();

        window.addEventListener('hashchange', function() {
            var state = readHash();
            var changed = state.left !== paneState.left || state.right !== paneState.right;
            paneState = state;
            if (changed) {
                renderPane('left');
                renderPane('right');
            }
            propagateStateToNav();
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
