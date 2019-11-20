#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const csv = require('csvtojson');
const winston = require('winston');

const searchIndex = require('./search_index');
const configLoader = require('./config_loader');

const rCloneServiceName = 'gdrive-bnf'
const rCloneSharedDrive = false
const googleShareName="Annotations";

// path config vars
let annotationMetaDataCSV;
let authorsCSV;
let baseDir;
let targetImageDir;
let targetSearchIndexDir;
let targetAnnotationDir;
let tempCaptionDir;
let tempAbstractDir;
let tempBiblioDir;
let cachedAnnotationDriveScan;
let convertAnnotationLog;
let annotationRootURL;
let imageRootURL;

let logger = null;
const maxDriveTreeDepth = 20;
const docxMimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const jpegMimeType = "image/jpeg";
const googleLinkRegX = /https:\/\/drive\.google\.com\/open\?id=/;
const googleLinkRegX2 = /https:\/\/drive.google.com\/file\/d\//;
const wikischolarRegX = /wikischolars/;
const figureCitation = /[F|f]ig(\.|ure[\.]*)[\s]*[0-9]+/;
const figureNumber = /[0-9]+/;
const invalidFigureNumber = "XX";

async function loadAnnotationMetadata() {
    const csvData = fs.readFileSync(annotationMetaDataCSV).toString();
    let annotationMetadata = {};
    const tableObj = await csv().fromString(csvData)        
    tableObj.forEach( entry => {
        let metaData = {
            id: entry['annotation-ID'],
            driveID: entry['UUID'],
            name: entry['thumbnail-title'],
            semester: entry['semester'],
            year: entry['year'],
            theme: entry['theme'],
            entryIDs: entry['entry-id'],
            status: entry['status-DCE'],
            refresh: (entry['refresh-DCE'] === 'yes')
        }
        annotationMetadata[metaData.driveID] = metaData;
    });    
    return annotationMetadata
}

async function loadAuthors() {
    const csvData = fs.readFileSync(authorsCSV).toString();
    let authors = {};
    const tableObj = await csv().fromString(csvData)        
    tableObj.forEach( entry => {
        let author = {
            id: entry['Author-ID'],
            annotations: entry['Annotation-ID'].split('|'),
            fullName: entry['Full-name'],
            firstName: entry['First-name'],
            lastName: entry['Last-name'],
            year: entry['Year'],
            semester: entry['Semester'],
            authorType: entry['Author-type'],
            degree: entry['Degree'],
            yearAtTime: entry['Year-at-time-of-class'],
            department: entry['Department'],
            subField: entry['Subfield-optional']
        }
        authors[author.id] = author;
    });    
    return authors
}

function findLocalAssets() {

    function findDocinDir( dir ) {
        // expect to find a single docx file in this dir
        const dirContents = fs.readdirSync(dir);
        for( let i=0; i < dirContents.length; i++ ) {
            const filename = dirContents[i];
            if( filename.endsWith('.docx') ) return `${dir}/${filename}`;
        }
        return null;
    };

    let annotationAssets = [];
    // go through annotation asset dir and create a source manifest
    const annotationDirs = fs.readdirSync(baseDir);
    annotationDirs.forEach( annotationDir => {
        // ignore hidden directories
        if( annotationDir.startsWith('.') ) return;

        // record text file
        const textFile = findDocinDir(`${baseDir}/${annotationDir}`);
        if( textFile === null ) return;

        // record caption file
        const captionFile = findDocinDir(`${baseDir}/${annotationDir}/captions`)

        // record abstract file
        const abstractFile = findDocinDir(`${baseDir}/${annotationDir}/abstract`)

        // record bibliography file
        const biblioFile = findDocinDir(`${baseDir}/${annotationDir}/bibliography`)

        // record illustrations
        const illustrationDir = `${baseDir}/${annotationDir}/illustrations`;
        let illustrations = [];
        if( fs.existsSync(illustrationDir) ) {
            const illustrationFiles = fs.readdirSync(illustrationDir);
            illustrationFiles.forEach( illustrationFile => {
                if( illustrationFile.startsWith('.') ) return;                
                illustrations.push(illustrationFile);
            });
        }

        annotationAssets.push({
            id: annotationDir,
            textFile,
            captionFile,
            abstractFile,
            biblioFile,
            illustrations
        });
    });

    return annotationAssets;
}

function createDriveTree(driveMap) {

    // recursively explore the tree looking for parent that matches path
    function findParent( entry, ancestor, path ) {
        if( path.length === 1 ) {
            return ancestor;
        } else {
            let nextAncestor = path[0]
            for( let i=0; i < ancestor.children.length; i++ ) {
                let child = ancestor.children[i];
                if( child.name === nextAncestor ) {
                    path.shift();
                    return findParent( entry, child, path );
                }
            }
            return null;
        }
    };

    const rootNode = {
        id: '0',
        name: "",
        mimeType: "inode/directory",
        parent: null,
        children: []
    };

    // scan the drive map until all the entries have been added to the tree. 
    // give up after maxDriveTreeDepth iterations 
    let stillLooking = true;
    let attempts = 0;
    while( stillLooking && attempts < maxDriveTreeDepth ) {
        attempts = attempts + 1;
        stillLooking = false;
        driveMap.forEach( entry => {
            if( !entry.added ) {
                const path = entry["Path"].split('/');
                let parent = findParent( entry, rootNode, path );        
                if( parent ) {
                    let node = {
                        id: entry["ID"],
                        name: entry["Name"],
                        mimeType: entry["MimeType"],
                        parent: parent
                    }
                    node.children = entry["IsDir"] ? [] : null; 
                    parent.children.push( node );
                    entry.added = true;
                } else {
                    // parent isn't in the tree yet, keep looking!
                    stillLooking = true;
                }                    
            }    
        });    
    }

    if( stillLooking ) {
        throw `ERROR: Google Drive tree exceeds max depth of ${maxDriveTreeDepth}!`;         
    }

    return rootNode;
}

function locateAnnotationAssets(useCache) {

    // Use rclone to create a map of the manuscript folder in google drive
    let annotationDriveJSON;
    if( useCache )  {
        annotationDriveJSON = fs.readFileSync(cachedAnnotationDriveScan, "utf8");
    } else {
        const shared = rCloneSharedDrive ? "--drive-shared-with-me" : ""
        const buffer = execSync(`rclone lsjson ${shared} -R ${rCloneServiceName}:"${googleShareName}"`, (error, stdout, stderr) => {
            if (error !== null) {
                throw `ERROR: Unable to list Google Drive: ${googleShareName}`;
            } 
        });      
        annotationDriveJSON = buffer.toString();
        fs.writeFileSync(cachedAnnotationDriveScan, annotationDriveJSON );
    }
    const annotationDriveMap = JSON.parse(annotationDriveJSON);
    const driveTreeRoot = createDriveTree(annotationDriveMap);

    let annotationAssets = [];

    driveTreeRoot.children.forEach( semester => {
        if( semester.children ) {
            semester.children.forEach( annotationRoot => {
                let textFileNode = null;
                let captionFile = null;
                let abstractFile = null;
                let biblioFile = null;
                let illustrations = [];
                if( annotationRoot.children ) {
                    annotationRoot.children.forEach( assetFile => {
    
                        if( assetFile.mimeType === docxMimeType ) {
                            if( assetFile.name.includes('Text_') ) {
                                textFileNode = assetFile;
                            } else if( assetFile.name.includes('Captions_') ) {
                                captionFile = assetFile;
                            } else if( assetFile.name.includes('Abstract_') ) {
                                abstractFile = assetFile;
                            } else if( assetFile.name.includes('Bibliography_') ) {
                                biblioFile = assetFile;
                            }       
                        }
    
                        if( assetFile.children ) {
                            // locate the illustrations, if any
                            if( assetFile.children.length > 0 && assetFile.name.includes('Illustrations_') ) {
                                assetFile.children.forEach( illustrationFile => {
                                    if( illustrationFile.mimeType === jpegMimeType ) {
                                        illustrations.push( illustrationFile );
                                    }
                                });
                            }                        
                        } 
                    });  
                } else {
                    const path = nodeToPath(annotationRoot)
                    logger.info(`Annotation folder contains no subfolders: ${path}`);
                }
    
                if( textFileNode ) {
                    annotationAssets.push({
                        id: textFileNode.id,
                        textFile: textFileNode,
                        captionFile: captionFile,
                        abstractFile: abstractFile,
                        biblioFile: biblioFile,
                        illustrations: illustrations
                    });
                    const path = nodeToPath(textFileNode);
                    logger.info(`Found annotation: ${textFileNode.id} in ${googleShareName}${path}`);
                } else {
                    const path = nodeToPath(annotationRoot);
                    logger.info(`Annotation not found. Must contain docx file with Text_* in the filename: ${path}`);
                }
            });
        }
    });

    return annotationAssets;
}

function refreshFilter(annotationMetadata, annotationAssets) {
    // filter out assets that aren't marked to be refreshed
    const selectedAssets = []
    for( const annotationAsset of annotationAssets ) {
        const metadata = annotationMetadata[annotationAsset.id]
        if( metadata ) {
            const {status,refresh} = metadata
            if( refresh && (status === 'published' || status === 'staging') ) {
                selectedAssets.push(annotationAsset)
            }    
        }
    }
    return selectedAssets
}

function nodeToPath( fileNode, path=[] ) {
    path.push(fileNode.name);
    if( fileNode.parent !== null ) {
        return nodeToPath( fileNode.parent, path );
    }
    return path.reverse().join('/');
}    

function syncDriveAssets( driveAssets ) {

    // create local directory to store assets
    dirExists(baseDir);

    // iterate through drive assets, downloading each one and placing them in correct spot in baseDir
    localAssets = [];
    driveAssets.forEach( driveAsset => {

        // make the annotation dir 
        const annotationDir = `${baseDir}/${driveAsset.id}`;
        dirExists(annotationDir);

        const textFileSrc = `${googleShareName}${nodeToPath(driveAsset.textFile)}`;
        const textFileDest = `${annotationDir}/${driveAsset.textFile.name}`;
        syncDriveFile(textFileSrc, annotationDir);

        // create captions dir
        const captionsDir = `${annotationDir}/captions`;
        dirExists(captionsDir);

        // create abstract dir
        const abstractDir = `${annotationDir}/abstract`;
        dirExists(abstractDir);
        
        // create bibliography dir
        const biblioDir = `${annotationDir}/bibliography`;
        dirExists(biblioDir);

        // this file is optional
        let captionFileDest = null;
        if( driveAsset.captionFile ) {
            const captionFileSrc = `${googleShareName}${nodeToPath(driveAsset.captionFile)}`;
            captionFileDest = `${captionsDir}/${driveAsset.captionFile.name}`; 
            syncDriveFile(captionFileSrc, captionsDir);
        }

        // abstract is optional
        let abstractFileDest = null;
        if( driveAsset.abstractFile ) {
            const abstractFileSrc = `${googleShareName}${nodeToPath(driveAsset.abstractFile)}`;
            abstractFileDest = `${abstractDir}/${driveAsset.abstractFile.name}`; 
            syncDriveFile(abstractFileSrc, abstractDir);
        }
        
        // bibliography is optional
        let biblioFileDest = null;
        if( driveAsset.biblioFile ) {
            const biblioFileSrc = `${googleShareName}${nodeToPath(driveAsset.biblioFile)}`;
            biblioFileDest = `${biblioDir}/${driveAsset.biblioFile.name}`; 
            syncDriveFile(biblioFileSrc, biblioDir);
        }

        // make the illustrations dir 
        const illustrationsDir = `${annotationDir}/illustrations`;
        dirExists(illustrationsDir);

        // download all the illustrations
        let illustrations = [];
        driveAsset.illustrations.forEach( illustration => {
            const illustrationSrc = `${googleShareName}${nodeToPath(illustration)}`;
            const illustrationTmp = `${illustrationsDir}/${illustration.name}`;
            const illustrationDest = `${illustrationsDir}/${illustration.id}.jpg`;   
            syncDriveFile(illustrationSrc, illustrationsDir);
            fs.renameSync(illustrationTmp,illustrationDest);
            illustrations.push(illustrationDest);
        });

        localAssets.push({
            id: driveAsset.id,
            textFile: textFileDest,
            captionFile: captionFileDest,
            abstractFile: abstractFileDest,
            biblioFile: biblioFileDest,
            illustrations: illustrations
        })
    });

    return localAssets;
}

function dirExists( dir ) {
    if( !fs.existsSync(dir) ) {
      fs.mkdirSync(dir);
      if( !fs.existsSync(dir) ) {
        throw `ERROR: ${dir} not found and unable to create it.`;
      }
    }  
}

function syncDriveFile( source, dest ) {
    // escape all quotes in source path
    const escSource = source.replace(/"/g, '\\"')  
    const shared = rCloneSharedDrive ? "--drive-shared-with-me" : ""
    const cmd = `rclone ${shared} sync ${rCloneServiceName}:"${escSource}" "${dest}"`;
    logger.info(cmd);
    execSync(cmd, (error, stdout, stderr) => {
        console.log(`${stdout}`);
        console.log(`${stderr}`);
        if (error !== null) {
            throw `ERROR: Unable to download file from Google Drive: ${source}`;
        }
    });  
}


function processAnnotations(annotationAssets, annotationMetadata, authors ) {

    logger.info("Processing Annotations")
    logSeperator()

    dirExists( targetAnnotationDir )
    dirExists( targetImageDir )
    dirExists( tempCaptionDir )
    dirExists( tempAbstractDir )

    let annotationContent = []
    annotationAssets.forEach( asset => {
        const metadata = annotationMetadata[asset.id]
        if( metadata ) {
            let annotationAuthors = []
            Object.values(authors).forEach( author => {
                if( author.annotations.includes(metadata.id) ) {
                    annotationAuthors.push( author.id )
                }
            })
            let annotation = processAnnotation(asset,metadata,annotationAuthors)
            annotationContent.push(annotation)
        } else {
            logger.info(`Unable to process annotation, metadata not found: ${asset.id}`)
        }
    })

    let annotationManifest = {
        title: "Annotations of BnF MS Fr. 640",
        content: annotationContent
    }

    // write out annotation manifest
    const annotationManifestFile = `${targetAnnotationDir}/annotations.json`
    fs.writeFile(annotationManifestFile, JSON.stringify(annotationManifest, null, 3), (err) => {
        if (err) {
          console.log(err)
          logger.info(err)
        } 
    });

    // write out author list
    const authorsFile = `${targetAnnotationDir}/authors.json`
    fs.writeFile(authorsFile, JSON.stringify(authors, null, 3), (err) => {
        if (err) {
          console.log(err)
          logger.info(err)
        } 
    });
}

function processAnnotation( annotationAsset, metadata, authors ) {

    function convertToHTML( source, target ) {
        const escSource = source.replace(/"/g, '\\"')  
        execSync(`pandoc -f docx -t html "${escSource}" > "${target}"`, (error, stdout, stderr) => {
            console.log(`${stdout}`);
            console.log(`${stderr}`);
            if (error !== null) {
                throw `ERROR: Unable to process file with pandoc: ${source}`;
            }
        }); 
    }

    const annotationID = metadata.id;
    const annotationHTMLFile = `${targetAnnotationDir}/${annotationID}.html`;    

    // Convert docx file to html
    convertToHTML( annotationAsset.textFile, annotationHTMLFile );  

    // Convert the captions file if it exists and extract the captions
    let captions = {};
    if( annotationAsset.captionFile ) {
        const captionHTMLFile = `${tempCaptionDir}/${annotationID}.html`;  
        convertToHTML( annotationAsset.captionFile, captionHTMLFile );  
        captions = processCaptions(captionHTMLFile);
    }

    // Extract the abstract, if it exists
    let abstract = "";
    if( annotationAsset.abstractFile ) {
        const abstractHTMLFile = `${tempAbstractDir}/${annotationID}.html`;  
        convertToHTML( annotationAsset.abstractFile, abstractHTMLFile );  
        abstract = fs.readFileSync( abstractHTMLFile, "utf8");
    }

    // Extract the bibliography
    let biblio = null;
    if( annotationAsset.biblioFile ) {
        const biblioHTMLFile = `${tempBiblioDir}/${annotationID}.html`;  
        convertToHTML( annotationAsset.biblioFile, biblioHTMLFile );  
        biblio = fs.readFileSync( biblioHTMLFile, "utf8");
    }
    
    // Make a directory for the illustrations and copy them to there
    const illustrationsDir = `${targetImageDir}/${annotationID}`;
    dirExists( illustrationsDir );
    annotationAsset.illustrations.forEach( illustration => {
        const sourceFile = `${baseDir}/${annotationAsset.id}/illustrations/${illustration}`
        const targetFile = `${illustrationsDir}/${illustration}`
        fs.copyFileSync( sourceFile, targetFile );
    })

    // Take the pandoc output and transform it into final annotation html
    processAnnotationHTML(annotationHTMLFile, annotationID, captions, biblio);

    return {
        ...metadata,
        authors,
        abstract,
        contentURL: `${annotationRootURL}/${annotationID}.html`
    };    
}

// returns a hash of the captions keyed to figure number
function processCaptions( captionHTMLFile ) {
    let html = fs.readFileSync( captionHTMLFile, "utf8");
    let htmlDOM = new JSDOM(html);
    let doc = htmlDOM.window.document;
    let captions = {};

    // find all of the paragraphs that contain a figure number
    // index the paragraph innerHTML to the figure number
    let paragraphTags = doc.getElementsByTagName('P');
    for( let i=0; i< paragraphTags.length; i++ ) {
        const captionText = paragraphTags[i].innerHTML;
        const figureNumber = extractFigureNumber(captionText); 
        if( figureNumber !== invalidFigureNumber ) {
            captions[figureNumber] = captionText;
        }  
    }

    return captions;
}

function processAnnotationHTML( annotationHTMLFile, annotationID, captions, biblio ) {

    logger.info(`Processing annotation ${annotationID}`);
    // load document 
    let html = fs.readFileSync( annotationHTMLFile, "utf8");
    let htmlDOM = new JSDOM(html);
    let doc = htmlDOM.window.document;

    let anchorTags = doc.getElementsByTagName('A');

    function findImageID( url ) {
        if( url.match(googleLinkRegX) ) {
            return url.split('=')[1];
        } 
        if( url.match(googleLinkRegX2) ) {
            // https://drive.google.com/file/d/0BwJi-u8sfkVDeVozNmxHN3dab0E/view?usp=sharing
            return url.split('/')[5];
        }
        return null;
    }

    let replacements = [];
    for( let i=0; i< anchorTags.length; i++ ) {
        let anchorTag = anchorTags[i];
        const imageID = findImageID( anchorTag.href );
        if( imageID ) {
            const paragraphElement = findParentParagraph(anchorTag);     
            if( paragraphElement ) {
                const figureRefEl = doc.createElement('i');
                figureRefEl.innerHTML = anchorTag.innerHTML; 
                replacements.push([anchorTag,figureRefEl]);
                let figureNumber = extractFigureNumber(anchorTag.innerHTML);
                if( figureNumber !== invalidFigureNumber ) {
                    let figureEl = doc.createElement('figure'); 
                    const imageURL = `${imageRootURL}/${annotationID}/${imageID}.jpg`
                    const caption = captions[figureNumber];
                    if( !caption ) logger.info(`Caption not found for Fig. ${figureNumber}`);
                    const figCaption = (caption) ? `<figcaption>${caption}</figcaption>` : '';
                    figureEl.innerHTML = `<img src="${imageURL}" alt="Figure" />${figCaption}`;  
                    // figure should be placed after this paragraph and the other figures
                    paragraphElement.parentNode.insertBefore(figureEl, paragraphElement.nextSibling);           
                } else {
                    logger.info(`No figure number found in: ${anchorTag.innerHTML}`)
                }
            }
        } else {
            if( anchorTag.href.match( wikischolarRegX ) ) {
                logger.info(`Wikischolars link detected: ${anchorTag.href}`)
            }
        }
    }

    // replacements done after we walk the list to avoid confusing DOM
    replacements.forEach( replacement => {
        let [oldEl, newEl] = replacement;
        oldEl.replaceWith(newEl);
    });

    // Now append the bibliography
    if( biblio ) {
        let biblioEl = doc.createElement('div'); 
        biblioEl.innerHTML = biblio;
        let body = doc.getElementsByTagName('body')[0];
        body.append(biblioEl);
    }

    // TODO Tables
    // - change first row of the table to be a th instead of tr

    // TODO Links
    // - Links to field notes should go to field notes
    // - Links to other annotations should go to those annotations
    // - Mentions of folios should be turned into links to those folios
    // - The annotation should have a link to its folio entry

    // write tranformed DOM
    fs.writeFileSync( annotationHTMLFile, htmlDOM.serialize() );
}

function findParentParagraph( node ) {
    if( !node.parentNode ) return null;
    if( node.parentNode.nodeName === 'P' ) return node.parentNode;
    return findParentParagraph( node.parentNode );
}

function extractFigureNumber( figureText ) {
    const figureMatch = figureText.match(figureCitation)
    if( figureMatch ) {
        let figureNum = figureMatch[0].match(figureNumber)[0];
        while( figureNum && figureNum[0] === '0') {
            figureNum = figureNum.substr(1);
        }
        if(figureNum && figureNum.length > 0) return figureNum;
    }
    return invalidFigureNumber;
}

function logSeperator() {
    logger.info('==============================');
}

function setupLogging() {
    if( fs.existsSync(convertAnnotationLog)) {
        fs.unlinkSync(convertAnnotationLog)
    }
    logger = winston.createLogger({
        format: winston.format.printf(info => { return `${info.message}` }),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ filename: convertAnnotationLog })
        ]
    });

    process.on('uncaughtException', function(err) {
        logger.log('error', `Fatal exception killed lizard:\n${err}`, err, function(err, level, msg, meta) {
            process.exit(1);
        });
    });
}

function quickFix( driveAssets ) {
    driveAssets.forEach( driveAsset => {
        const annotationDir = `${baseDir}/${driveAsset.id}`;
        const biblioDir = `${annotationDir}/bibliography`;
        dirExists(biblioDir);
    });
}

async function run(mode) {
    switch( mode ) {
        case 'download': {
            const annotationDriveAssets = locateAnnotationAssets();
            const annotationMetadata = await loadAnnotationMetadata()
            const selectedAssets = refreshFilter(annotationMetadata,annotationDriveAssets)
            syncDriveAssets( selectedAssets );
            }
            break;
        case 'process': {
            const annotationAssets = findLocalAssets();
            const annotationMetadata = await loadAnnotationMetadata()
            const authors = await loadAuthors()
            const selectedAssets = refreshFilter(annotationMetadata,annotationAssets)
            processAnnotations(selectedAssets,annotationMetadata,authors)
            }
            break;
        case 'index':
            searchIndex.generateAnnotationIndex(targetAnnotationDir, targetSearchIndexDir);
            break;
        case 'run': {
            const annotationDriveAssets = locateAnnotationAssets();
            const annotationAssets = syncDriveAssets( annotationDriveAssets );
            const annotationMetadata = await loadAnnotationMetadata()
            const authors = await loadAuthors()
            const selectedAssets = refreshFilter(annotationMetadata,annotationAssets)
            processAnnotations(selectedAssets,annotationMetadata,authors)
            searchIndex.generateAnnotationIndex(targetAnnotationDir, targetSearchIndexDir);
            }
            break;
    }    
}

function loadConfig() {
    // load the config
    const configData = configLoader.load();
    if( !configData ) {
        console.log("Unable to load configuration file. Expected it in edition_data/config.json");
        process.exit(-1);   
    }
    const { sourceDir, targetDir, workingDir, editionDataURL } = configData

    // source dir
    annotationMetaDataCSV = `${sourceDir}/metadata/annotation-metadata.csv`;
    authorsCSV = `${sourceDir}/metadata/authors.csv`;

    // target dir
    targetImageDir = `${targetDir}/images`;
    targetSearchIndexDir = `${targetDir}/search-idx`;
    targetAnnotationDir = `${targetDir}/annotations`;

    dirExists(targetImageDir)
    dirExists(targetSearchIndexDir)
    dirExists(targetAnnotationDir) 

    // working dir
    baseDir = `${workingDir}/annotations`;
    tempCaptionDir = `${workingDir}/captions`;
    tempAbstractDir = `${workingDir}/abstract`;
    tempBiblioDir = `${workingDir}/biblio`;
    cachedAnnotationDriveScan = `${workingDir}/cachedScanFile.json`;
    convertAnnotationLog = `${workingDir}/lizard.log`;

    dirExists(baseDir)
    dirExists(tempCaptionDir)
    dirExists(tempAbstractDir)
    dirExists(tempBiblioDir)

    // edition URL
    annotationRootURL = `${editionDataURL}/annotations`;
    imageRootURL = `${editionDataURL}/images`;
}

function main() {
    loadConfig();
    setupLogging();

    let mode;
    if (process.argv.length <= 2) {
        mode = 'help'
    } else {
        mode = process.argv[2];
    }
     
    if( mode === 'help' ) {
        console.log(`Usage: lizard.js <command>` );
        console.log("A helpful lizard that responds to the following commands:")
        console.log("\tdownload: Download the annotations from Google Drive via rclone.");
        console.log("\tprocess: Process the downloaded files and place them on the asset server.");
        console.log("\tindex: Create a search index of the annotations.");
        console.log("\trun: Do all of the above.")
        console.log("\thelp: Displays this help. ");
        process.exit(-1);
    }

    let date = new Date();
    logger.info(`Lizard running in ${mode} mode at ${date.toLocaleTimeString()} on ${date.toDateString()}.`);
    logSeperator();    

    run(mode).then(() => {
        logger.info(`Lizard finised at ${date.toLocaleTimeString()}.`)
    }, (err) => {
        logger.info(`Lizard stopped at ${date.toLocaleTimeString()}.`)
        logger.error(`${err}: ${err.stack}`)  
    });
}

///// RUN THE SCRIPT
main()
