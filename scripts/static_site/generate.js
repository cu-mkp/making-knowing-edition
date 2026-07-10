// Static HTML mirror generator. Reads the generated edition data tree
// (public/bnf-ms-fr-640/<buildID>) and emits a fully static site to staticDir.
// Invoked as: node scripts/lizard.js static <target>

const fs = require('fs');
const path = require('path');

const context = require('./context');
const assets = require('./assets');
const sitemap = require('./sitemap');
const check = require('./check');

const homePage = require('./pages/home');
const contentPages = require('./pages/content');
const essayIndexPage = require('./pages/essay_index');
const essayPages = require('./pages/essay');
const entriesPage = require('./pages/entries');
const folioIndexPage = require('./pages/folio_index');
const folioPages = require('./pages/folio');
const glossaryPage = require('./pages/glossary');
const searchPage = require('./pages/search');

function writePage( staticDir, page ) {
    const dir = path.join( staticDir, page.path );
    fs.mkdirSync( dir, { recursive: true } );
    fs.writeFileSync( path.join(dir, 'index.html'), page.html );
}

async function generate( configData ) {
    const startTime = Date.now();
    const ctx = context.load( configData );

    // clean output dir (rmdirSync recursive: Node 12+; does not follow symlinks)
    if( fs.existsSync(ctx.staticDir) ) {
        fs.rmdirSync( ctx.staticDir, { recursive: true } );
    }
    fs.mkdirSync( ctx.staticDir, { recursive: true } );

    const pages = [];
    pages.push( ...homePage.generate(ctx) );
    pages.push( ...contentPages.generate(ctx) );
    pages.push( ...essayIndexPage.generate(ctx) );
    pages.push( ...essayPages.generate(ctx) );
    pages.push( ...entriesPage.generate(ctx) );
    pages.push( ...folioIndexPage.generate(ctx) );
    pages.push( ...folioPages.generate(ctx) );
    pages.push( ...glossaryPage.generate(ctx) );
    pages.push( ...searchPage.generate(ctx) );

    for( const page of pages ) {
        writePage( ctx.staticDir, page );
    }

    assets.copy( ctx );
    sitemap.write( ctx, pages );
    check.run( ctx, pages );

    const seconds = ((Date.now()-startTime)/1000).toFixed(1);
    console.log(`Static mirror: ${pages.length} pages written to ${ctx.staticDir}/ in ${seconds}s (buildID ${ctx.buildID}, basePath '${ctx.basePath}').`);
}

module.exports.generate = generate;
