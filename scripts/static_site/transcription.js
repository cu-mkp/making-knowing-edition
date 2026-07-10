// Build-time port of the transcription rendering pipeline:
//   Folio.parseTranscription  -> extract <folio layout="..."> content
//   folioLayout.layoutMargin* -> margin blocks into a CSS grid
//   TranscriptionView.htmlToReactParserOptions -> custom TEI-ish tags to HTML

const { JSDOM } = require('jsdom');
const { layoutMargin3, layoutMargin4, layoutGrid } = require('./folio_layout');

// tags rendered as plain semantic spans in the runtime viewer
const SEM_TAGS = [ 'al','bp','cn','df','env','m','mark','md','ms','mu','pa','pl','pn','pro','sn','tl','tmp','wp' ];
const LANG_TAGS = [ 'de','el','es','fr','it','la' ];
const BOLD_TAGS = [ 'emph','man','rub' ];
const VOID_TAGS = [ 'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr' ];

function escapeText( str ) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escapeAttr( str ) {
    return escapeText(str).replace(/"/g,'&quot;');
}

// port of Folio.parseTranscription / Folio.errorMessage
function errorMessage( message ) {
    return {
        layout: "margin",
        html: `<div id="error"><div data-layout="middle">${message}</div></div>`
    };
}

function parseTranscription( html ) {
    const folioTag = "<folio";
    const openDivIndex = html.indexOf(folioTag);
    if (openDivIndex === -1) return errorMessage('Folio element not found.');
    const start = html.indexOf(">", openDivIndex) + 1;
    const end = html.lastIndexOf("</folio>");
    if (end === -1) return errorMessage('Folio element closing tag not found.');
    if (start > end) return errorMessage('Unable to parse folio element.');

    const folioAttribs = html.slice(openDivIndex + folioTag.length, start - 1);
    const layoutAttr = "layout=";
    const layoutAttrIndex = folioAttribs.indexOf(layoutAttr);
    if (layoutAttrIndex === -1) return errorMessage('Unable to parse layout attribute in folio element.');
    const layoutAttrStart = layoutAttrIndex + layoutAttr.length + 1;
    const layoutType = folioAttribs.slice(layoutAttrStart, folioAttribs.indexOf('"', layoutAttrStart));
    const transcription = html.slice(start, end);
    return {
        layout: layoutType,
        html: transcription
    };
}

// port of TranscriptionView.getTranscriptionData
function getTranscriptionData( transcription ) {
    if( transcription.layout === 'grid' ) {
        return layoutGrid(transcription.html);
    } else if( transcription.layout === 'three-column' ) {
        return layoutMargin3(transcription.html);
    } else if( transcription.layout === 'four-column' ) {
        return layoutMargin4(transcription.html);
    } else {
        return {
            content: transcription.html,
            layout: ""
        };
    }
}

function serializeAttributes( node, overrides ) {
    let attrs = '';
    for( let i = 0; i < node.attributes.length; i++ ) {
        const attribute = node.attributes[i];
        if( overrides && overrides[attribute.name] !== undefined ) continue;
        attrs += ` ${attribute.name}="${escapeAttr(attribute.value)}"`;
    }
    return attrs;
}

// walk the parsed transcription DOM emitting final HTML, mirroring the tag
// mapping in TranscriptionView.htmlToReactParserOptions
function serializeNode( node, env ) {
    const { document } = env;

    if( node.nodeType === 3 ) return escapeText(node.nodeValue);          // text
    if( node.nodeType !== 1 ) return '';                                  // drop comments etc.

    const tag = node.tagName.toLowerCase();
    const children = () => {
        let html = '';
        for( const child of node.childNodes ) html += serializeNode(child, env);
        return html;
    };

    switch( tag ) {
        case 'add':
            return `<span class="add">${children()}</span>`;
        case 'del':
            return `<s class="del">${children()}</s>`;
        case 'comment': {
            const commentID = node.getAttribute('rid');
            if( commentID ) env.commentIDs.add(commentID);
            return `<button class="editor-comment" data-comment-id="${escapeAttr(commentID || '')}" aria-expanded="false" title="Editorial comment">*</button>`;
        }
        case 'corr':
            return `<span class="corr">[${children()}]</span>`;
        case 'superscript':
            return `<sup>${children()}</sup>`;
        case 'exp':
            return `<span class="exp">{${children()}}</span>`;
        case 'underline':
            return `<u>${children()}</u>`;
        case 'unc':
            return `<span>[${children()}?]</span>`;
        case 'sup':
            return `<span></span>`;
        case 'lb':
            return `<br>`;
        case 'gap':
            return `<i>[gap]</i>`;
        case 'ill':
            return `<i>[illegible]</i>`;
        case 'ups':
            return `<span class="ups">${children()}</span>`;
        case 'h2': {
            // entry headings link to their research essays (replaces the
            // toggleable <Annotation> banner in the runtime viewer)
            const entryID = node.getAttribute('data-entry-id');
            const annotations = entryID ? env.ctx.annotationsByEntry[entryID] : null;
            const heading = `<h2${serializeAttributes(node)}>${children()}</h2>`;
            if( annotations && annotations.length > 0 ) {
                const links = annotations.map( annotation =>
                    annotation.status
                        ? `<a href="${env.ctx.urlFor(`/essays/${annotation.id}/`)}">${annotation.name}</a>`
                        : `<span>${annotation.name}</span>` );
                const plural = links.length > 1 ? 's' : '';
                return `${heading}<div class="entry-essays">Related essay${plural}: ${links.join(', ')}</div>`;
            }
            return heading;
        }
        case 'img': {
            // figure images carry absolute URLs baked for another host/build
            const src = env.ctx.rewriteDataAsset( node.getAttribute('src') || '' );
            return `<img${serializeAttributes(node,{src:true})} src="${escapeAttr(src)}">`;
        }
        case 'a': {
            const href = env.ctx.rewriteHref( node.getAttribute('href') || '' );
            return `<a${serializeAttributes(node,{href:true})} href="${escapeAttr(href)}">${children()}</a>`;
        }
        default:
            if( LANG_TAGS.includes(tag) ) return `<i>${children()}</i>`;
            if( SEM_TAGS.includes(tag) ) return `<span class="sem-${tag}">${children()}</span>`;
            if( BOLD_TAGS.includes(tag) ) return `<b>${children()}</b>`;
            if( VOID_TAGS.includes(tag) ) return `<${tag}${serializeAttributes(node)}>`;
            return `<${tag}${serializeAttributes(node)}>${children()}</${tag}>`;
    }
}

function transformTags( ctx, html, commentIDs ) {
    const dom = new JSDOM(`<body><div id="__x__">${html}</div></body>`);
    const document = dom.window.document;
    const root = document.getElementById('__x__');
    const env = { ctx, document, commentIDs };
    let out = '';
    for( const child of root.childNodes ) out += serializeNode(child, env);
    return out;
}

// Render one transcription version to its final <div class="surface"> HTML.
// Returns { html, empty } and adds any referenced editorial comment ids
// to the commentIDs set.
function renderTranscription( ctx, rawHTML, commentIDs ) {
    const transcription = parseTranscription( rawHTML );
    const transcriptionData = getTranscriptionData( transcription );

    if( !transcriptionData.content || transcriptionData.content.length === 0 ) {
        return { html: '', empty: true };
    }

    const content = transformTags( ctx, transcriptionData.content, commentIDs );
    const layoutStyle = transcriptionData.layout
        ? ` style="grid-template-areas:${escapeAttr(transcriptionData.layout)}"` : '';
    return {
        html: `<div class="surface grid-mode"${layoutStyle}>${content}</div>`,
        empty: false
    };
}

module.exports = { renderTranscription, parseTranscription };
