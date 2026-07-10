// OpenSeadragon facsimile pane for the static folio viewer.
// Exposes window.initFacsimile(element, folioData); called by panes.js
// whenever a pane switches to the facsimile view.

(function() {
    var viewers = {};

    window.initFacsimile = function(element, folioData) {
        if (typeof OpenSeadragon === 'undefined') return;

        // a previous viewer in this pane slot was destroyed with its DOM node
        if (viewers[element.id]) {
            try { viewers[element.id].destroy(); } catch (e) { /* already gone */ }
        }

        viewers[element.id] = OpenSeadragon({
            element: element,
            prefixUrl: folioData.osdPrefixURL,
            tileSources: [folioData.infoURL],
            showNavigationControl: true,
            navigationControlAnchor: OpenSeadragon.ControlAnchor.TOP_LEFT
        });
    };
})();
