// Static port of AnnotationView.js: one page per research essay.

const fs = require('fs');
const { JSDOM } = require('jsdom');
const layout = require('../layout');
const scholarly = require('../scholarly');

// port of AnnotationView.renderByLine
function renderByLine( ctx, annotation ) {
    const authorIDs = annotation.authors || annotation.authorIDs || [];
    const authorEntries = [];
    for( const authorID of authorIDs ) {
        const author = ctx.authors[authorID];
        if( !author ) continue;
        const { fullName, semester, year, authorType, degree, yearAtTime, department } = author;
        const byline = [ semester, year, authorType, degree, yearAtTime, department ]
            .filter( a => a && a.length > 0 ).join(', ');
        authorEntries.push(`<div><p><b>${ctx.escapeHTML(fullName)}</b><br>${ctx.escapeHTML(byline)}</p></div>`);
    }
    const doi = annotation.doi
        ? `<p>DOI: <a href="${annotation.doi}">${annotation.doi}</a></p>` : '';
    return `<div class="anno-byline">${authorEntries.join('\n')}${doi}</div>`;
}

// mirror AnnotationView.htmlToReactParserOptions: html/head/body -> anno-* divs,
// iframes wrapped, links rewritten (footnote anchors already work natively)
function processEssayHTML( ctx, essayHTML ) {
    const dom = new JSDOM( essayHTML );
    const document = dom.window.document;

    for( const anchor of document.querySelectorAll('a[href]') ) {
        anchor.setAttribute( 'href', ctx.rewriteHref(anchor.getAttribute('href')) );
    }
    for( const iframe of document.querySelectorAll('iframe') ) {
        if( iframe.parentNode.classList && iframe.parentNode.classList.contains('video-iframe-wrapper') ) continue;
        const wrapper = document.createElement('div');
        wrapper.className = 'video-iframe-wrapper';
        iframe.parentNode.insertBefore( wrapper, iframe );
        wrapper.appendChild( iframe );
    }
    // essay images may use relative figure paths or URLs baked for another
    // host/build; point them at the current data tree
    for( const img of document.querySelectorAll('img[src]') ) {
        const src = img.getAttribute('src');
        if( !src.match(/^(https?:|data:|\/)/) ) {
            img.setAttribute( 'src', ctx.dataURL(`annotations/${src}`) );
        } else {
            img.setAttribute( 'src', ctx.rewriteDataAsset(src) );
        }
    }

    return `<div class="anno-html">
        <div class="anno-head"></div>
        <div class="anno-body">${document.body.innerHTML}</div>
    </div>`;
}

const backArrow = `<svg class="icon" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.79-12.21L9.59 11H17v2H9.59l3.21 3.21-1.42 1.41L5.76 12l5.62-5.62 1.41 1.41z"/></svg>`;

function generate( ctx ) {
    const pages = [];

    for( const annotation of ctx.annotations ) {
        if( !ctx.essayIsReadable(annotation) ) continue;
        const essayFile = `${ctx.targetDir}/annotations/${annotation.id}.html`;
        if( !fs.existsSync(essayFile) ) {
            console.log(`WARNING: missing essay HTML for ${annotation.id}, skipping.`);
            continue;
        }
        const essayHTML = fs.readFileSync( essayFile, 'utf8' );
        const path = `/essays/${annotation.id}/`;

        const content = `
<div id="annotation-view" class="view-mode">
    <div class="annotation-nav">
        <a href="${ctx.urlFor('/essays/')}" aria-label="Back to essays">${backArrow}</a>
    </div>
    <div class="title-byline-container">
        <h1>${annotation.fullTitle}</h1>
        ${renderByLine(ctx, annotation)}
    </div>
    ${processEssayHTML(ctx, essayHTML)}
</div>`;

        const canonicalURL = `${ctx.siteURL}${ctx.basePath}${path}`;
        pages.push({
            path,
            html: layout.renderPage( ctx, {
                title: annotation.fullTitle,
                path,
                spaPath: `/essays/${annotation.id}`,
                bodyClass: 'essay',
                description: ctx.removeTags(annotation.abstract).substring(0,300),
                extraHead: scholarly.essayCitationMeta( ctx, annotation, canonicalURL ) +
                    '\n    ' + scholarly.essayJsonLD( ctx, annotation, canonicalURL ),
                content
            })
        });
    }

    return pages;
}

module.exports.generate = generate;
