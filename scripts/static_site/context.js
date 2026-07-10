const fs = require('fs');

const folioNameRegex = /^\d{1,3}[rv]$/;

const transcriptionTypeLabels = {
    tc: 'Diplomatic (FR)',
    tcn: 'Normalized (FR)',
    tl: 'Translation (EN)',
    f: 'Facsimile',
    glossary: 'Glossary'
};

function loadJSON( path ) {
    return JSON.parse( fs.readFileSync( path, 'utf8') );
}

// "3r" -> "p003r" (same as DocumentHelper.generateFolioID)
function generateFolioID( bnfLabel ) {
    const rectoOrVerso = bnfLabel.slice( bnfLabel.length-1 );
    const id = parseInt(bnfLabel.slice(0,bnfLabel.length-1),10);
    if( isNaN(id) ) return null;
    let zeros = "";
    if( id < 10 ) zeros = zeros + "0";
    if( id < 100 ) zeros = zeros + "0";
    return `p${zeros.concat(id)}${rectoOrVerso}`;
}

function escapeHTML( str ) {
    if( str === null || str === undefined ) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function removeTags( str ) {
    if( str === null || str === undefined ) return '';
    return str.toString().replace( /(<([^>]+)>)/ig, '');
}

function load( configData ) {
    const { buildID, editionDataURL, releaseMode } = configData;
    const targetDir = configData.targetDir;      // public/bnf-ms-fr-640/<buildID>
    const staticDir = configData.staticDir || 'static-build';
    const basePath = configData.staticBasePath || '';

    // origin of the deployed site, e.g. https://edition640.makingandknowing.org
    const siteURL = editionDataURL.replace(/\/bnf-ms-fr-640.*$/, '');
    // root-relative web path of the edition data tree (same origin in production)
    const dataWebRoot = `/bnf-ms-fr-640/${buildID}`;

    const menuStructure = loadJSON(`${targetDir}/content/menu-structure.json`);
    const annotationManifest = loadJSON(`${targetDir}/annotations/annotations.json`);
    const annotations = annotationManifest.content;
    const authors = loadJSON(`${targetDir}/annotations/authors.json`);
    const entries = loadJSON(`${targetDir}/entries.json`);
    const glossary = loadJSON(`${targetDir}/glossary.json`);
    const comments = loadJSON(`${targetDir}/comments.json`);
    const manifest = loadJSON(`${targetDir}/manifest.json`);

    const annotationsByID = {};
    for( const annotation of annotations ) {
        annotationsByID[annotation.id] = annotation;
    }

    // entryID (e.g. "p100r_1") -> [annotation,...]
    const annotationsByEntry = {};
    for( const annotation of annotations ) {
        if( !annotation.entryIDs ) continue;
        for( const rawEntryID of annotation.entryIDs.split(';') ) {
            const entryID = rawEntryID.trim();
            if( entryID.length === 0 ) continue;
            if( !annotationsByEntry[entryID] ) annotationsByEntry[entryID] = [];
            annotationsByEntry[entryID].push(annotation);
        }
    }

    // ordered folio list from the IIIF manifest canvases
    const canvases = manifest.sequences[0].canvases;
    const folios = [];
    for( const canvas of canvases ) {
        const name = canvas.label;                                 // e.g. "3r", "170v"
        const pID = generateFolioID(name);                         // e.g. "p003r", null for covers
        const imageResource = canvas.images[0].resource;
        const service = imageResource.service ? imageResource.service['@id'] : null;
        const annotationListURL = ( canvas.otherContent && canvas.otherContent[0] )
            ? canvas.otherContent[0]['@id'] : null;
        const hasTranscription = !!( pID && annotationListURL
            && fs.existsSync(`${targetDir}/folio/${pID}`) );
        folios.push({
            name,
            pID,
            canvasID: canvas['@id'],
            thumbnail: canvas.thumbnail ? canvas.thumbnail['@id'] : null,
            service,
            hasTranscription
        });
    }
    const foliosByName = {};
    for( const folio of folios ) foliosByName[folio.name] = folio;

    // mirror URL for a page path like '/essays/ann_001_fa_14/' (always dir-style, trailing slash)
    function urlFor( pagePath ) {
        if( !pagePath.startsWith('/') ) pagePath = `/${pagePath}`;
        return `${basePath}${pagePath}`;
    }

    // mirror URL for a copied asset like 'img/mk-banner-logo.png'
    function assetURL( path ) {
        return `${basePath}/${path}`;
    }

    // root-relative URL into the existing edition data tree
    function dataURL( path ) {
        return `${dataWebRoot}/${path}`;
    }

    // absolute URL of the equivalent page in the SPA
    function spaURL( spaPath ) {
        return `${siteURL}${spaPath}`;
    }

    // essay thumbnail resolution (same rules as AnnotationCard.js)
    function annotationThumbURL( annotation ) {
        if( annotation.dataSource === 'gh' && annotation.s3ThumbUrl ) return annotation.s3ThumbUrl;
        if( annotation.thumbnail ) return dataURL(`annotations-thumbnails/${annotation.thumbnail}`);
        return assetURL('img/watermark.png');
    }

    // same visibility rule as AnnotationCard.essayIsReadable
    function essayIsReadable( annotation ) {
        return !!( annotation.contentURL && ( releaseMode !== 'production'
            || annotation.status === 'published' || annotation.status === 'done' ) );
    }

    // Rewrite a reference into the edition data tree (figure images, transcription
    // files) that was baked with another host or build id to the current tree.
    function rewriteDataAsset( url ) {
        if( !url ) return url;
        const match = url.match(/^https?:\/\/(?:edition640|edition-staging|edition-dev)\.makingandknowing\.org\/bnf-ms-fr-640\/[^/]+\/(.*)$/)
            || url.match(/^\/bnf-ms-fr-640\/[^/]+\/(.*)$/);
        if( match ) return dataURL(match[1]);
        return url;
    }

    // Rewrite an SPA link (as found in content fragments, essays, citeAs blocks, and
    // menu-structure.json) to its static mirror equivalent. External links pass through.
    function rewriteHref( href ) {
        if( !href ) return href;
        let path = href.trim();

        // direct links into the edition data tree (figures, XML files, ...)
        if( path.match(/^(https?:\/\/[^/]*makingandknowing\.org)?\/bnf-ms-fr-640\//) ) {
            return rewriteDataAsset( path );
        }

        // absolute links to the edition itself -> strip the origin
        const originMatch = path.match(/^https?:\/\/(edition640|edition-staging|edition-dev)\.makingandknowing\.org/);
        if( originMatch ) {
            path = path.substring(originMatch[0].length);
            if( path.length === 0 ) path = '/';
        } else if( path.match(/^https?:\/\//) || path.startsWith('mailto:') ) {
            return href;
        }

        // legacy hash-router forms: "/#/folios/3r", "#/essays/x", "/#content/how-to-use-fr"
        if( path.startsWith('/#') ) path = path.substring(2);
        else if( path.startsWith('#/') ) path = path.substring(1);
        if( path.startsWith('content/') ) path = `/${path}`;

        // in-page anchor
        if( path.startsWith('#') ) return path;
        if( !path.startsWith('/') ) return href;

        // split off any anchor within the target page
        const hashIndex = path.indexOf('#');
        let anchor = '';
        if( hashIndex !== -1 ) {
            anchor = path.substring(hashIndex);
            path = path.substring(0,hashIndex);
        }
        const segments = path.split('/').filter( s => s.length > 0 );

        if( segments.length === 0 ) return urlFor('/') + anchor;

        switch( segments[0] ) {
            case 'content':
                return urlFor(`/${segments.join('/')}/`) + anchor;
            case 'essays':
                return segments[1]
                    ? urlFor(`/essays/${segments[1]}/`) + anchor
                    : urlFor('/essays/') + anchor;
            case 'entries':
                return urlFor('/entries/') + anchor;
            case 'search':
                return urlFor('/search/');
            case 'folios':
                return rewriteFolioHref( segments, anchor );
            default:
                return urlFor(`/${segments.join('/')}/`) + anchor;
        }
    }

    // /folios[/:folioID[/:type[/:folioID2/:type2]]] -> mirror folio page (+ pane state hash)
    function rewriteFolioHref( segments, anchor ) {
        if( segments.length < 2 ) return urlFor('/folios/');
        const name = validFolioName(segments[1]);
        if( !name ) return urlFor('/folios/');
        const type = segments[2];
        const type2 = segments[4];

        // glossary rendered as a pane in the SPA is a standalone page in the mirror
        if( type === 'glossary' || type2 === 'glossary' ) return urlFor('/glossary/') + anchor;
        if( !type || type === 'g' ) return urlFor(`/folios/${name}/`) + anchor;
        if( !type2 ) {
            // SPA route /folios/:id/:type means left=facsimile, right=type
            return urlFor(`/folios/${name}/`) + `#f/${type}`;
        }
        return urlFor(`/folios/${name}/`) + `#${type}/${type2}`;
    }

    function validFolioName( folioName ) {
        if( !folioName || folioName.length === 0 ) return null;
        if( folioName.match(folioNameRegex) ) return folioName;
        const numericID = parseInt( folioName, 10 );
        if( !isNaN(numericID) ) return `${numericID}r`;
        return null;
    }

    return {
        configData,
        buildID,
        releaseMode,
        targetDir,
        staticDir,
        basePath,
        siteURL,
        dataWebRoot,
        menuStructure,
        annotationTitle: annotationManifest.title,
        annotations,
        annotationsByID,
        annotationsByEntry,
        authors,
        entries,
        glossary,
        comments,
        manifest,
        folios,
        foliosByName,
        transcriptionTypeLabels,
        urlFor,
        assetURL,
        dataURL,
        spaURL,
        rewriteDataAsset,
        annotationThumbURL,
        essayIsReadable,
        rewriteHref,
        validFolioName,
        generateFolioID,
        escapeHTML,
        removeTags
    };
}

module.exports.load = load;
module.exports.escapeHTML = escapeHTML;
