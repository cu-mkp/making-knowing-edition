// Post-build verification of the static mirror.

const fs = require('fs');
const { JSDOM } = require('jsdom');

// custom transcription tags that must not survive into emitted HTML
const residualTagPattern = /<(folio|comment|lb|gap|ill|corr|exp|unc|ups|emph|man|rub|superscript|underline|al|bp|cn|df|env|mu|md|ms|pa|pl|pn|pro|sn|tmp|wp)[\s>/]|className=/;

function pageFilePath( ctx, pagePath ) {
    return `${ctx.staticDir}${pagePath}index.html`;
}

function checkPageCounts( ctx, pages, problems ) {
    const expect = ( label, actual, expected ) => {
        if( actual !== expected ) {
            problems.push(`expected ${expected} ${label}, generated ${actual}`);
        }
    };

    const count = ( prefix ) => pages.filter( p => p.path.startsWith(prefix) && p.path !== prefix ).length;

    const readableEssays = ctx.annotations.filter( a => ctx.essayIsReadable(a) ).length;
    if( pages.find( p => p.path.startsWith('/essays/') ) ) {
        expect( 'essay pages', count('/essays/'), readableEssays );
    }
    if( pages.find( p => p.path.startsWith('/folios/') ) ) {
        const foliosWithPages = ctx.folios.filter( f => f.pID ).length;
        expect( 'folio pages', count('/folios/'), foliosWithPages );
    }

    for( const required of ['/'] ) {
        if( !pages.find( p => p.path === required ) ) {
            problems.push(`required page ${required} was not generated`);
        }
    }
}

function checkResidualTags( ctx, pages, problems ) {
    for( const page of pages ) {
        const filePath = pageFilePath( ctx, page.path );
        const html = fs.readFileSync( filePath, 'utf8' );
        const match = html.match( residualTagPattern );
        if( match ) {
            problems.push(`${page.path}: unconverted markup "${match[0].trim()}"`);
        }
    }
}

// Verify that every internal link/asset reference resolves to a generated page,
// a copied asset, or a file in the edition data tree.
function checkInternalLinks( ctx, pages, problems ) {
    const brokenLinks = new Set();

    const resolves = ( url ) => {
        // strip query/hash
        const cleaned = url.split('#')[0].split('?')[0];
        if( cleaned.length === 0 ) return true;

        let filePath;
        if( ctx.basePath !== '' && cleaned.startsWith(`${ctx.basePath}/`) ) {
            filePath = `${ctx.staticDir}${cleaned.substring(ctx.basePath.length)}`;
        } else if( cleaned.startsWith(`${ctx.dataWebRoot}/`) ) {
            filePath = `public${cleaned}`;
        } else if( ctx.basePath === '' && cleaned.startsWith('/') ) {
            filePath = `${ctx.staticDir}${cleaned}`;
            if( cleaned.startsWith('/bnf-ms-fr-640/') ) filePath = `public${cleaned}`;
        } else {
            return true; // external
        }
        if( filePath.endsWith('/') ) filePath = `${filePath}index.html`;
        return fs.existsSync( filePath );
    };

    for( const page of pages ) {
        const html = fs.readFileSync( pageFilePath(ctx, page.path), 'utf8' );
        const document = new JSDOM( html ).window.document;
        const references = [];
        for( const el of document.querySelectorAll('a[href]') ) references.push( el.getAttribute('href') );
        for( const el of document.querySelectorAll('[src]') ) references.push( el.getAttribute('src') );
        for( const el of document.querySelectorAll('link[href]') ) references.push( el.getAttribute('href') );
        for( const ref of references ) {
            if( ref.match(/^(https?:|mailto:|data:|#)/) ) continue;
            if( !resolves(ref) && !brokenLinks.has(ref) ) {
                brokenLinks.add( ref );
                problems.push(`${page.path}: broken internal link ${ref}`);
            }
        }
    }
}

function checkSitemapParity( ctx, pages, problems ) {
    const sitemapPath = `${ctx.staticDir}/sitemap.xml`;
    if( !fs.existsSync(sitemapPath) ) {
        problems.push('sitemap.xml was not generated');
        return;
    }
    const xml = fs.readFileSync( sitemapPath, 'utf8' );
    for( const page of pages ) {
        if( !xml.includes(`<loc>${ctx.siteURL}${ctx.basePath}${page.path}</loc>`) ) {
            problems.push(`sitemap.xml missing ${page.path}`);
        }
    }
}

function run( ctx, pages ) {
    const problems = [];
    checkPageCounts( ctx, pages, problems );
    checkResidualTags( ctx, pages, problems );
    checkInternalLinks( ctx, pages, problems );
    checkSitemapParity( ctx, pages, problems );

    if( problems.length > 0 ) {
        console.log(`\nStatic mirror check found ${problems.length} problem(s):`);
        for( const problem of problems.slice(0,50) ) console.log(`  - ${problem}`);
        if( problems.length > 50 ) console.log(`  ... and ${problems.length-50} more`);
    } else {
        console.log('Static mirror check passed.');
    }
    return problems;
}

module.exports.run = run;
