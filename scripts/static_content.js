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


function mirrorDirs(sourcePath, targetPath) {
    const dirContents = fs.readdirSync(sourcePath, {withFileTypes: true});
    for( let i=0; i < dirContents.length; i++ ) {
        const sourceDirEnt = dirContents[i];
        const sourceFile = `${sourcePath}/${sourceDirEnt.name}`
        const targetFile = `${targetPath}/${sourceDirEnt.name}`
        if( sourceDirEnt.isDirectory() ) {
            if( !fs.existsSync(targetFile)) fs.mkdirSync(targetFile)
            mirrorDirs(sourceFile, targetFile)
        } else {
            if( fs.existsSync(targetFile)) fs.unlinkSync(targetFile)
        } 
    }
}

function locateContent(sourcePath,contentPath) {
    let contentFileIDs = []
    const targetDir = contentPath ? `${sourcePath}/${contentPath}` : sourcePath
    const dirContents = fs.readdirSync(targetDir, {withFileTypes: true});
    for( let i=0; i < dirContents.length; i++ ) {
        const dirent = dirContents[i];
        const filename = dirent.name
        if( dirent.isDirectory() ) {
            const nextContentPath = contentPath ? `${contentPath}/${filename}` : filename
            contentFileIDs = contentFileIDs.concat( locateContent(sourcePath,nextContentPath) )
        } else {
            const mdExtensionIndex = filename.indexOf('.md')
            if( mdExtensionIndex != -1 ) {
                const contentID = filename.substring(0,mdExtensionIndex)
                const contentFileID = contentPath ? `${contentPath}/${contentID}` : contentID
                contentFileIDs.push(contentFileID)
            }    
        }
    }
    return contentFileIDs
}


async function process(sourcePath, targetPath) {
    const sourceDocsPath = `${sourcePath}/docs`

    // clear out target and match directory structure with source
    mirrorDirs(sourceDocsPath, targetPath)

    // copy the latest menu structure file to the targetPath 
    fs.copyFileSync( `${sourcePath}/menu-structure.json`, `${targetPath}/menu-structure.json` );
    
    // For all md file found in sourcePath, process them into HTML at target path
    const contentFileIDs = locateContent(sourceDocsPath)
    for( const contentFileID of contentFileIDs ) {
        convertToHTML(`${sourceDocsPath}/${contentFileID}.md`,`${targetPath}/${contentFileID}.html`)
    }
}

// EXPORTS /////////////
module.exports.process = process;
