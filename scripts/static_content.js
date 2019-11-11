const fs = require('fs');
const { execSync } = require('child_process');

function convertToHTML( source, target ) {
    const escSource = source.replace(/"/g, '\\"')  
    execSync(`pandoc -f commonmark -t html "${escSource}" > "${target}"`, (error, stdout, stderr) => {
        console.log(`${stdout}`);
        console.log(`${stderr}`);
        if (error !== null) {
            throw `ERROR: Unable to process file with pandoc: ${source}`;
        }
    }); 
}

async function process(sourcePath, targetPath) {

    // copy the latest menu structure file to the targetPath 
    fs.copyFileSync( `${sourcePath}/menu-structure.json`, `${targetPath}/menu-structure.json` );

    const sourceDocsPath = `${sourcePath}/docs`

    // For all md file found in sourcePath, process them into HTML at target path
    const dirContents = fs.readdirSync(sourceDocsPath);
    for( let i=0; i < dirContents.length; i++ ) {
        const filename = dirContents[i];
        const mdExtensionIndex = filename.indexOf('.md')
        if( mdExtensionIndex != -1 ) {
            const contentID = filename.substring(0,mdExtensionIndex)
            convertToHTML(`${sourceDocsPath}/${contentID}.md`,`${targetPath}/${contentID}.html`)
        }
    }

}

// EXPORTS /////////////
module.exports.process = process;
