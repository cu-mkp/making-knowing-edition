const fs = require('fs');
const path = require('path');

function ensureDir( dir ) {
    fs.mkdirSync( dir, { recursive: true } );
}

function copyRecursive( source, target ) {
    if( fs.statSync(source).isDirectory() ) {
        ensureDir( target );
        for( const name of fs.readdirSync(source) ) {
            copyRecursive( `${source}/${name}`, `${target}/${name}` );
        }
    } else {
        fs.copyFileSync( source, target );
    }
}

function copy( ctx ) {
    const { staticDir } = ctx;

    // compiled SCSS from the main app build
    if( !fs.existsSync('public/css/index.css') ) {
        throw new Error("public/css/index.css not found — run 'yarn build-css' first.");
    }
    ensureDir( `${staticDir}/css` );
    fs.copyFileSync( 'public/css/index.css', `${staticDir}/css/index.css` );

    // hand-written chrome CSS + vanilla JS modules shipped with the generator
    const shippedAssets = path.join( __dirname, 'assets' );
    copyRecursive( path.join(shippedAssets,'css'), `${staticDir}/css` );
    copyRecursive( path.join(shippedAssets,'js'), `${staticDir}/js` );

    // site imagery (logos, banners, openseadragon button images)
    copyRecursive( 'public/img', `${staticDir}/img` );

    // vendored browser libraries
    ensureDir( `${staticDir}/vendor/openseadragon` );
    fs.copyFileSync( 'node_modules/openseadragon/build/openseadragon/openseadragon.min.js',
        `${staticDir}/vendor/openseadragon/openseadragon.min.js` );
    ensureDir( `${staticDir}/vendor/lunr` );
    fs.copyFileSync( 'scripts/node_modules/lunr/lunr.min.js', `${staticDir}/vendor/lunr/lunr.min.js` );
    const lunrStemmer = 'scripts/node_modules/lunr-languages/lunr.stemmer.support.js';
    const lunrFr = 'scripts/node_modules/lunr-languages/lunr.fr.js';
    if( fs.existsSync(lunrStemmer) ) fs.copyFileSync( lunrStemmer, `${staticDir}/vendor/lunr/lunr.stemmer.support.js` );
    if( fs.existsSync(lunrFr) ) fs.copyFileSync( lunrFr, `${staticDir}/vendor/lunr/lunr.fr.js` );

    // For local preview the data tree must be reachable at /bnf-ms-fr-640/<buildID>;
    // a symlink makes 'http-server static-build' self-sufficient. In production the
    // data tree is already deployed at the origin root.
    if( ctx.basePath === '' ) {
        const linkPath = `${staticDir}/bnf-ms-fr-640`;
        if( !fs.existsSync(linkPath) ) {
            fs.symlinkSync( path.resolve('public/bnf-ms-fr-640'), linkPath, 'dir' );
        }
    }
}

module.exports.copy = copy;
module.exports.ensureDir = ensureDir;
