const fs = require('fs');
const path = require('path');
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

    // TODO copy the menu structure file to the targetPath 
    const menuStructureFile = `${sourcePath}/menu-structure.json`

    // for all md file found in sourcePath, process them into HTML at target path
    convertToHTML(`${sourcePath}/docs/how-to-use.md`,`${targetPath}/how-to-use.html`)

}

// EXPORTS /////////////
module.exports.process = process;
