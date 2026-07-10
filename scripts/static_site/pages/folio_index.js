// Folio grid: thumbnail index of every transcribed folio (static port of
// ImageGridView.js, without infinite scroll - images lazy-load natively).

const layout = require('../layout');

function generate( ctx ) {
    const folios = ctx.folios.filter( folio => folio.pID && folio.hasTranscription );

    const items = folios.map( folio => {
        const thumbnailURL = folio.thumbnail ? `${folio.thumbnail}/full/native.jpg` : '';
        return `<li>
            <a href="${ctx.urlFor(`/folios/${folio.name}/`)}">
                <figure><img loading="lazy" width="120" alt="Folio ${folio.name}" src="${thumbnailURL}"></figure>
                <div class="thumbnail-caption">${folio.name}</div>
            </a>
        </li>`;
    }).join('\n');

    const content = `
<div class="imageGridComponent static-folio-grid">
    <div class="imageGridToolbar">
        <h1>Read Fr. 640 &mdash; Folios</h1>
        <p>Select a folio to open it in the manuscript viewer, with facsimile, French transcriptions, and English translation. See also the <a href="${ctx.urlFor('/entries/')}">List of Entries</a>.</p>
    </div>
    <ul>
${items}
    </ul>
</div>`;

    const html = layout.renderPage( ctx, {
        title: 'Folios',
        path: '/folios/',
        spaPath: '/folios',
        bodyClass: 'folio-grid',
        description: 'Browse the 340 folio pages of BnF Ms. Fr. 640 as facsimile thumbnails.',
        content
    });

    return [ { path: '/folios/', html } ];
}

module.exports.generate = generate;
