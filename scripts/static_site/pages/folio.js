// Folio pages: one page per transcribed folio side, containing the facsimile
// pane definition and all three pre-rendered transcription versions. Without
// JS the versions render stacked (fully crawlable); js/panes.js turns the page
// into the two-pane viewer with a facsimile deep-zoom pane.

const fs = require('fs');
const layout = require('../layout');
const transcription = require('../transcription');
const scholarly = require('../scholarly');

const VERSIONS = [ 'tc', 'tcn', 'tl' ];

const arrowLeft = `<svg class="icon" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.79 5.79L9.59 11H17v2H9.59l3.2 3.21-1.41 1.41L5.76 12l5.62-5.62 1.41 1.41z"/></svg>`;
const arrowRight = `<svg class="icon" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.79 5.79l1.41-1.41L18.24 12l-5.62 5.62-1.41-1.41L14.41 13H7v-2h7.41l-3.2-3.21z"/></svg>`;

// escape closing tags so the payload can live inside <script type="application/json">
function embedJSON( data ) {
    return JSON.stringify(data).replace(/<\//g, '<\\/');
}

function renderVersionSection( ctx, folio, type, rendered ) {
    const label = ctx.transcriptionTypeLabels[type];
    const xmlLink = `<a class="xml-link" href="${ctx.dataURL(`folio/${folio.pID}/${type}/original.txt`)}" target="_blank" rel="noopener noreferrer">XML</a>`;
    const body = rendered.empty
        ? `<div class="watermark"><div class="watermark_contents"></div></div>`
        : rendered.html;
    return `<section class="folio-version" data-type="${type}" data-label="${ctx.escapeHTML(label)}">
        <div class="version-heading"><h2>${ctx.escapeHTML(label)}</h2>${xmlLink}</div>
        <div class="transcriptionViewComponent"><div class="transcriptContent">${body}</div></div>
    </section>`;
}

function generate( ctx ) {
    const pages = [];
    const folios = ctx.folios.filter( folio => folio.pID && folio.hasTranscription );

    for( let i = 0; i < folios.length; i++ ) {
        const folio = folios[i];
        const previous = i > 0 ? folios[i-1] : null;
        const next = i < folios.length-1 ? folios[i+1] : null;
        const commentIDs = new Set();

        const sections = [];
        for( const type of VERSIONS ) {
            const rawHTML = fs.readFileSync( `${ctx.targetDir}/folio/${folio.pID}/${type}/index.html`, 'utf8' );
            const rendered = transcription.renderTranscription( ctx, rawHTML, commentIDs );
            sections.push( renderVersionSection( ctx, folio, type, rendered ) );
        }

        // editorial comments referenced on this page, keyed by rid
        const comments = {};
        for( const commentID of commentIDs ) {
            const comment = ctx.comments[commentID];
            if( comment ) comments[commentID] = comment.comment;
        }

        const folioData = {
            name: folio.name,
            infoURL: folio.service ? `${folio.service}/info.json` : null,
            prevURL: previous ? ctx.urlFor(`/folios/${previous.name}/`) : null,
            nextURL: next ? ctx.urlFor(`/folios/${next.name}/`) : null,
            folioBaseURL: ctx.urlFor('/folios/'),
            osdPrefixURL: ctx.assetURL('img/openseadragon/'),
            folioNames: folios.map( f => f.name ),
            comments
        };

        const path = `/folios/${folio.name}/`;
        const prevLink = previous
            ? `<a class="folio-nav-arrow" href="${ctx.urlFor(`/folios/${previous.name}/`)}" title="Folio ${previous.name}" rel="prev">${arrowLeft}</a>`
            : `<span class="folio-nav-arrow disabled">${arrowLeft}</span>`;
        const nextLink = next
            ? `<a class="folio-nav-arrow" href="${ctx.urlFor(`/folios/${next.name}/`)}" title="Folio ${next.name}" rel="next">${arrowRight}</a>`
            : `<span class="folio-nav-arrow disabled">${arrowRight}</span>`;

        const content = `
<div id="document-view" class="static-folio-view">
    <div class="folio-page-header paper">
        <div class="folio-pagination">
            ${prevLink}
            <h1 class="folio-name">BnF Ms. Fr. 640 &mdash; Folio ${folio.name}</h1>
            ${nextLink}
        </div>
        <div class="folio-tools">
            <a class="grid-link" href="${ctx.urlFor('/folios/')}">All Folios</a>
            <a class="grid-link" href="${ctx.urlFor('/glossary/')}">Glossary</a>
            <form class="jump-to-folio" hidden>
                <label for="jump-input">Go to folio</label>
                <input id="jump-input" type="text" size="6" placeholder="e.g. 12v">
                <button type="submit">Go</button>
            </form>
        </div>
    </div>
    <div class="split-pane-view" id="split-pane" hidden>
        <div class="pane" id="pane-left" data-side="left"></div>
        <div class="divider" id="pane-divider"></div>
        <div class="pane" id="pane-right" data-side="right"></div>
    </div>
    <div id="folio-content" class="folio-stacked">
        <section class="folio-version" data-type="f" data-label="Facsimile">
            <div class="version-heading"><h2>Facsimile</h2></div>
            <div class="facsimile-placeholder">
                <p><a href="https://gallica.bnf.fr/ark:/12148/btv1b10500001g" target="_blank" rel="noopener noreferrer">View the facsimile on Gallica (BnF)</a>. The zoomable facsimile requires JavaScript.</p>
            </div>
        </section>
        ${sections.join('\n')}
    </div>
    <script type="application/json" id="folio-data">${embedJSON(folioData)}</script>
</div>`;

        pages.push({
            path,
            html: layout.renderPage( ctx, {
                title: `Folio ${folio.name}`,
                path,
                spaPath: `/folios/${folio.name}`,
                bodyClass: 'folio',
                description: `Facsimile, French transcriptions, and English translation of folio ${folio.name} of BnF Ms. Fr. 640.`,
                content,
                scripts: [ 'js/panes.js', 'js/facsimile.js', 'js/comments.js' ],
                extraHead: `<script src="${ctx.assetURL('vendor/openseadragon/openseadragon.min.js')}" defer></script>` +
                    '\n    ' + scholarly.folioJsonLD( ctx, folio, `${ctx.siteURL}${ctx.basePath}${path}` )
            })
        });
    }

    return pages;
}

module.exports.generate = generate;
