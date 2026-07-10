// Static port of EntryListView.js: one long, crawlable list of all entries,
// sorted by folio (the MUI filter/sort chrome is intentionally omitted).

const layout = require('../layout');

function folioLinkName( ctx, entry ) {
    // same normalization as EntryListView: strip leading zeros/non-digits
    return entry.folio.replace(/^[0|\D]*/, '');
}

function renderEssayLinks( ctx, entry ) {
    const entryAnnotations = ctx.annotationsByEntry[entry.div_id];
    if( !entryAnnotations || entryAnnotations.length === 0 ) return '';
    const links = entryAnnotations.map( annotation =>
        annotation.status
            ? `<a href="${ctx.urlFor(`/essays/${annotation.id}/`)}">${annotation.name}</a>`
            : `<span>${annotation.name}</span>` );
    const plural = links.length > 1 ? 's' : '';
    return `<p class="entry-essays">Essay${plural}: ${links.join(', ')}</p>`;
}

function renderEntry( ctx, entry ) {
    const displayHeading = `${entry.heading_tl} / ${entry.heading_tcn}`.replace(/[@+]/g,'');
    const folioURL = ctx.urlFor(`/folios/${folioLinkName(ctx, entry)}/`);
    const categories = ( entry.categories && entry.categories.length > 0 )
        ? `<p class="entry-categories">Categories: ${entry.categories.map( c => ctx.escapeHTML(c) ).join(', ')}</p>`
        : '';
    return `<div class="entry paper">
        <div class="detail-container">
            <a href="${folioURL}"><h2 class="entry-heading">${ctx.escapeHTML(displayHeading)} - ${ctx.escapeHTML(entry.folio_display)}</h2></a>
            ${categories}
            ${renderEssayLinks(ctx, entry)}
        </div>
    </div>`;
}

function generate( ctx ) {
    const entries = [...ctx.entries].sort( (a,b) =>
        a.folio > b.folio ? 1 : a.folio < b.folio ? -1 : 0 );

    const content = `
<div id="entry-list-view">
    <div id="list-header">
        <h1 id="entry-header">Entries (${entries.length})</h1>
        <p>Ms. Fr. 640 consists almost entirely of distinct &ldquo;entries,&rdquo; i.e., units of text with titles. They have been grouped into <a href="${ctx.urlFor('/content/resources/')}">categories</a> to help browse the manuscript. Within entries, meaningful terms have been <a href="${ctx.urlFor('/content/resources/principles/')}">tagged</a>.</p>
        <p>Entries are listed below in folio order. Follow an entry&rsquo;s link to read it in the manuscript viewer.</p>
    </div>
    <div class="entries">
        <div class="entry-list">
${entries.map( entry => renderEntry(ctx, entry) ).join('\n')}
        </div>
    </div>
</div>`;

    const html = layout.renderPage( ctx, {
        title: 'List of Entries',
        path: '/entries/',
        spaPath: '/entries',
        bodyClass: 'entries',
        description: 'The 928 entries of BnF Ms. Fr. 640, listed in folio order with categories and related research essays.',
        content
    });

    return [ { path: '/entries/', html } ];
}

module.exports.generate = generate;
