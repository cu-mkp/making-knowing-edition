// Static port of ContentView/ContentPage: wraps the pre-baked content/*.html
// fragments in the page-header + side-nav chrome.

const fs = require('fs');
const { JSDOM } = require('jsdom');
const layout = require('../layout');

// find every content fragment, e.g. 'about', 'about/credits', 'resources/bibliography'
function findContentIDs( contentDir, prefix ) {
    const contentIDs = [];
    for( const name of fs.readdirSync(contentDir) ) {
        if( name === 'images' ) continue;
        const path = `${contentDir}/${name}`;
        if( fs.statSync(path).isDirectory() ) {
            contentIDs.push( ...findContentIDs( path, `${prefix}${name}/` ) );
        } else if( name.endsWith('.html') ) {
            contentIDs.push( `${prefix}${name.slice(0,-'.html'.length)}` );
        }
    }
    return contentIDs;
}

// rewrite SPA links and wrap iframes, mirroring ContentView.htmlToReactParserOptions()
function processFragment( ctx, fragmentHTML ) {
    const dom = new JSDOM( fragmentHTML );
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

    return document.body.innerHTML;
}

function renderSideNav( sections ) {
    if( !sections ) return '';
    const links = sections.map( section => {
        const subLinks = ( section.sub_sections || [] ).map( sub =>
            `<a href="#${sub.id}"><p class="sub-section-link">${sub.title}</p></a>` ).join('\n');
        return `<div class="sections-container">
            <a href="#${section.id}"><p class="section-link">${section.title}</p></a>
            <div class="flex-parent column sub-section-container">${subLinks}</div>
        </div>`;
    }).join('\n');
    return `<div id="navbar">
${links}
    </div>`;
}

function renderContentPage( ctx, menuNode, bodyHTML ) {
    const { page_heading, sub_heading_link, header_graphic_filename, sections } = menuNode;
    const subHeading = sub_heading_link
        ? `<a class="sub-heading-link" href="${ctx.rewriteHref(sub_heading_link.url)}">${ctx.escapeHTML(sub_heading_link.text)}</a>`
        : '';
    const headerGraphic = header_graphic_filename
        ? `<div class="image-container"><img alt="" src="${ctx.assetURL(`img/${header_graphic_filename}`)}"></div>`
        : '';

    return `
<div id="content-view">
    <div id="content-page">
        <div class="bg-maroon-gradient accent-bar"></div>
        <div class="paper flex-parent jc-space-btw page-header text-bg-gradient-light-tb">
            <div class="heading-text flex-parent wrap column jc-center">
                <h1 class="page-heading">${ctx.escapeHTML(page_heading)}</h1>
                ${subHeading}
            </div>
            ${headerGraphic}
        </div>
        <div class="flex-parent content-page-body">
            <div class="bg-dark-gradient-bt nav-bg"></div>
            <div>${renderSideNav(sections)}</div>
            <div id="content" class="content-page-content">
${bodyHTML}
            </div>
        </div>
    </div>
</div>`;
}

function generate( ctx ) {
    const contentDir = `${ctx.targetDir}/content`;
    const pages = [];

    for( const contentID of findContentIDs( contentDir, '' ) ) {
        const menuNode = ctx.menuStructure.find( node => node.content_id === contentID );
        if( !menuNode ) {
            console.log(`WARNING: no menu-structure.json node for content/${contentID}, skipping.`);
            continue;
        }
        const fragmentHTML = fs.readFileSync( `${contentDir}/${contentID}.html`, 'utf8' );
        const bodyHTML = processFragment( ctx, fragmentHTML );
        const path = `/content/${contentID}/`;
        const html = layout.renderPage( ctx, {
            title: menuNode.page_heading,
            path,
            spaPath: `/content/${contentID}`,
            bodyClass: 'content',
            content: renderContentPage( ctx, menuNode, bodyHTML )
        });
        pages.push( { path, html } );
    }

    return pages;
}

module.exports.generate = generate;
module.exports.renderContentPage = renderContentPage;
module.exports.processFragment = processFragment;
