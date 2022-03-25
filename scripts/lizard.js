#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const csv = require('csvtojson');
const winston = require('winston');
const beautify = require('js-beautify').html;

const searchIndex = require('./search_index');
const configLoader = require('./config_loader');
const iiifManifest = require('./iiif_manifest');
const assetServer = require('./asset_server');

// config data
let configData;

// rclone configuration
let rCloneServiceName;
let rCloneSharedDrive;
let googleShareName;

// path config vars
let annotationMetaDataCSV;
let authorsCSV;
let baseDir;
let targetImageDir;
let targetSearchIndexDir;
let targetAnnotationThumbnailDir;
let targetAnnotationDir;
let ghAnnotationDir = 'edition_data/m-k-annotation-data/html';
let s3ImageDir = 'edition_data/s3-images';
let targetFigureDir;
let tempCaptionDir;
let tempAbstractDir;
let tempBiblioDir;
let tempThumbnailDir;
let thumbnailListFile;
let convertAnnotationLog;
let annotationRootURL;
let imageRootURL;
let annotationAssetRootURL;

let logger = null;
const maxDriveTreeDepth = 20;
const docxMimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const spreadsheetMimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const rCloneExportFormats = "docx,csv";
const jpegMimeType = "image/jpeg";
const pngMimeType = "image/png";
const googleLinkRegX = /https:\/\/drive\.google\.com\/open\?id=/;
const googleLinkRegX2 = /https:\/\/drive.google.com\/file\/d\//;
const videoEmbedRegX = /^https:\/\/academiccommons\.columbia\.edu/;
const videoEmbedRegX2 = /^https:\/\/player\.vimeo\.com/;
const videoWidth = 560;
const videoHeight = 315;
const wikischolarRegX = /wikischolars/;
const figureCitation = /[F|f]ig(\.|ure[\.]*)[\s]*[0-9]+/;
const videoCitation = /[V|v]id(\.|eo[\.]*)[\s]*[0-9]+/;
const figureNumber = /[0-9]+/;
const invalidFigureNumber = "XX";
const thumbnailFolderName = "DCE Annotation Thumbnails";
const figureSourceDir = `./edition_data_example/figures`


async function loadAnnotationMetadata() {
    const csvData = fs.readFileSync(annotationMetaDataCSV).toString();
    let annotationMetadata = {};
    const tableObj = await csv().fromString(csvData)        
    tableObj.forEach( entry => {
        const authorIDs = entry['author-id'] && entry['author-id'].length > 0 ? entry['author-id'].split(';') : []

        let metaData = {
            id: entry['annotation-ID'],
            doi: entry['doi'],
            academicCommonsURL: entry['academic-commons-URL'],
            authorIDs,
            displayOrder: entry['display-order'],
            driveID: entry['UUID'],
            thumbnailURL: entry['thumbnail_url'],
            fullTitle: entry['full-title'],
            name: entry['thumbnail-title'],
            semester: entry['semester'],
            year: entry['year'],
            theme: entry['theme'],
            entryIDs: entry['entry-id'],
            status: entry['status-DCE'],
            citeAs: entry['cite-as'],
            refresh: (entry['refresh-DCE'] === 'refresh'),
            dataSource: entry['data_source'],
            s3ThumbUrl: entry['s3_thumbnail_url']
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

async function loadAltText(altTextFile) {
    const csvData = fs.readFileSync(altTextFile).toString();
    let altTexts = {};
    const tableObj = await csv().fromString(csvData)        
    tableObj.forEach( entry => {
        let altText = {
            id: entry['UUID'],
            text: entry['alt-text']
        }
        altTexts[altText.id] = altText;
    });    
    return altTexts
}

function findLocalAssets() {

    function findDocinDir( dir, ext ) {
        // expect to find a single docx file in this dir
        if( fs.existsSync(dir) ) {
            const dirContents = fs.readdirSync(dir);
            const extension = ext ? `.${ext}` : '.docx' 
            for( let i=0; i < dirContents.length; i++ ) {
                const filename = dirContents[i];
                if( filename.endsWith(extension) ) return `${dir}/${filename}`;
            }    
        }
        return null;
    };

    let annotationAssets = {};
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

        // record alt text file
        const altTextFile = findDocinDir(`${baseDir}/${annotationDir}/alttext`,'csv')

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

        annotationAssets[annotationDir] = {
            id: annotationDir,
            textFile,
            captionFile,
            abstractFile,
            biblioFile,
            altTextFile,
            illustrations
        };
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

function locateThumbnails() {        

    // scan for thumbnails
    const shared = rCloneSharedDrive ? "--drive-shared-with-me" : ""
    const target = `${googleShareName}/${thumbnailFolderName}`
    const buffer = execSync(`rclone lsjson ${shared} -R ${rCloneServiceName}:"${target}"`, (error, stdout, stderr) => {
        if (error !== null) {
            throw `ERROR: Unable to list Google Drive: ${googleShareName}`;
        } 
    });      
    let thumbnailDriveJSON = buffer.toString();
    const thumbnailDriveMap = JSON.parse(thumbnailDriveJSON);
    const driveTreeRoot = createDriveTree(thumbnailDriveMap);
    
    let thumbnailAssets = {};

    driveTreeRoot.children.forEach( thumbnail => {
        if( thumbnail.mimeType === jpegMimeType ) {
            thumbnailAssets[thumbnail.id] = thumbnail
        }
    });

    return thumbnailAssets;
}

function syncThumbnails(thumbnailAssets, annotationMetadata ) {

    const thumbnails = {}
    // find files already processed and in GitHub
    const ghProcessedAnnotations = fs.readdirSync(ghAnnotationDir);

    for( const metadata of Object.values(annotationMetadata) ) {
        const {refresh, thumbnailURL} = metadata

        // parse out the ID from the thumbnail URL and see if we have it
        const thumbnailID = findImageID(thumbnailURL)
        const thumbnailNode = thumbnailAssets[thumbnailID]
        
        if( thumbnailNode ) {
            const thumbnailSource = `${googleShareName}/${thumbnailFolderName}${nodeToPath(thumbnailNode)}`
            const thumbnailTarget = `${tempThumbnailDir}/${thumbnailNode.name}`
            
            const alreadyInGh = ghProcessedAnnotations.includes(`${metadata.id}.html`);
            if (refresh || (!fs.existsSync(thumbnailTarget) && !alreadyInGh)) {
                syncDriveFile(thumbnailSource, tempThumbnailDir);
            }
            thumbnails[thumbnailID] = thumbnailNode.name
        }
    }

    // save an index of the thumbnail dir
    fs.writeFileSync( thumbnailListFile, JSON.stringify(thumbnails) )
}

function loadThumbnails() {
    const buffer = fs.readFileSync(thumbnailListFile, "utf8")
    return JSON.parse(buffer)
}

function locateAnnotationAssets() {

    // Use rclone to create a map of the manuscript folder in google drive
    let annotationDriveJSON;
    
    const shared = rCloneSharedDrive ? "--drive-shared-with-me" : ""
    const buffer = execSync(`rclone lsjson ${shared} -R ${rCloneServiceName}:"${googleShareName}"`, { maxBuffer: 1024 * 1024 * 2 })
    annotationDriveJSON = buffer.toString();
    const annotationDriveMap = JSON.parse(annotationDriveJSON);
    const driveTreeRoot = createDriveTree(annotationDriveMap);

    let annotationAssets = [];

    driveTreeRoot.children.forEach( semester => {
        if( semester.children && semester.name !== thumbnailFolderName ) {
            semester.children.forEach( annotationRoot => {
                let textFileNode = null;
                let captionFile = null;
                let abstractFile = null;
                let biblioFile = null;
                let altTextFile = null;
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

                        if( assetFile.mimeType === spreadsheetMimeType ) {
                            if( assetFile.name.includes('Alttext_') ) {
                                altTextFile = assetFile;
                            }    
                        }
    
                        if( assetFile.children ) {
                            // locate the illustrations, if any
                            if( assetFile.children.length > 0 && assetFile.name.includes('Illustrations_') ) {
                                assetFile.children.forEach( illustrationFile => {
                                    if( illustrationFile.mimeType === jpegMimeType || illustrationFile.mimeType === pngMimeType ) {
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
                        altTextFile: altTextFile,
                        illustrations: illustrations
                    });
                    const path = nodeToPath(textFileNode);
                    // logger.info(`Found annotation: ${textFileNode.id} in ${googleShareName}${path}`);
                } else {
                    const path = nodeToPath(annotationRoot);
                    logger.info(`Annotation not found. Must contain docx file with Text_* in the filename: ${path}`);
                }
            });
        }
    });

    return annotationAssets;
}

function filterForDownload(annotationMetadata, annotationAssets) {

    // filter out assets that aren't marked to be refreshed
    const selectedAssets = []
    const filesAlreadyInWorkingDir = fs.readdirSync(baseDir);

    // find files already processed and in GitHub
    const ghProcessedAnnotations = fs.readdirSync(ghAnnotationDir);

    for (const annotationAsset of annotationAssets) {
        const metadata = annotationMetadata[annotationAsset.id]
        if (metadata) {
            const { status, refresh } = metadata
            const downloaded = filesAlreadyInWorkingDir.includes(metadata.driveID);
            const alreadyInGh = ghProcessedAnnotations.includes(`${metadata.id}.html`);

            if (
                // ignore items with no status
                ["staging", "published", "done"].includes(status)
                // download anything misisng from github or marked for refresh
                && (!alreadyInGh || refresh)
                // don't download things twice
                && !downloaded) {
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

        // create the alttext dir
        const altTextDir = `${annotationDir}/alttext`;
        dirExists(altTextDir);
        
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

        // alt text is optional
        let altTextFileDest = null;
        if( driveAsset.altTextFile ) {
            const excelRegex = /.xlsx$/;
            let altTextFileSrc = `${googleShareName}${nodeToPath(driveAsset.altTextFile)}`;
            altTextFileSrc = altTextFileSrc.replace(excelRegex,'.csv')
            altTextFileDest = `${altTextDir}/${driveAsset.altTextFile.name}`; 
            altTextFileDest = altTextFileDest.replace(excelRegex,'.csv')
            syncDriveFile(altTextFileSrc, altTextDir);
        }
        
        // make the illustrations dir 
        const illustrationsDir = `${annotationDir}/illustrations`;
        dirExists(illustrationsDir);

        // download all the illustrations
        let illustrations = [];
        driveAsset.illustrations.forEach( illustration => {
            const illustrationSrc = `${googleShareName}${nodeToPath(illustration)}`;
            const illustrationTmp = `${illustrationsDir}/${illustration.name}`;
            const ext = illustration.mimeType === jpegMimeType ? 'jpg' : 'png';
            const illustrationDest = `${illustrationsDir}/${illustration.id}.${ext}`;  
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
            altTextFile: altTextFileDest,
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
    const cmd = `rclone --drive-export-formats ${rCloneExportFormats} ${shared} sync ${rCloneServiceName}:"${escSource}" "${dest}"`;
    logger.info(cmd);
    execSync(cmd, (error, stdout, stderr) => {
        console.log(`${stdout}`);
        console.log(`${stderr}`);
        if (error !== null) {
            throw `ERROR: Unable to download file from Google Drive: ${source}`;
        }
    });  
}

function getAbstract(id) {
    // Extract the abstract from the GitHub-processed HTML file
    const html = fs.readFileSync(`${ghAnnotationDir}/${id}.html`, "utf8");
    const htmlDOM = new JSDOM(html);
    const doc = htmlDOM.window.document;
    const headerSection = doc.getElementsByClassName('header-section')[0];
    let abstract = null;
    // make sure there is a header section and an abstract
    if (headerSection &&
        headerSection.getElementsByTagName("h2")[0].textContent.includes("Abstract") &&
        headerSection.getElementsByTagName("div")[0]) {
            // use the innerHTML of the abstract as abstract to save into json
            abstract = headerSection.getElementsByTagName("div")[0].innerHTML;
    }
    return abstract;
}

async function processAnnotations(annotationAssets, annotationMetadata, authors, thumbnails ) {

    logger.info("Processing Annotations")
    logSeperator()

    dirExists( targetAnnotationDir )
    dirExists( targetImageDir )
    dirExists( tempCaptionDir )
    dirExists( tempAbstractDir )

    let ghProcessedAnnotations =  fs.readdirSync(ghAnnotationDir);

    let annotationContent = []
    for( const metadata of Object.values(annotationMetadata)) {        
        // record the authors
        let authors = metadata.authorIDs

        const asset = annotationAssets[metadata.driveID]
        let annotation;
        let inGithub = ghProcessedAnnotations.includes(`${metadata.id}.html`);
        if( asset ) {
            // if we have the asset, but it isn't marked for publication, just publish metadata
            if( metadata.status === 'staging' || metadata.status === 'published' || metadata.status === 'done') {
                annotation = await processAnnotation(asset,metadata,authors)
            } else {
                annotation = {
                    ...metadata,
                    authors,
                    // include abstract and content URL if in github
                    abstract: inGithub ? getAbstract(metadata.id) : null,
                    contentURL: inGithub ? `${annotationRootURL}/${metadata.id}.html` : null,
                };  
            }
        } else {
            // if we don't have the asset, just publish metadata
            annotation = {
                ...metadata,
                authors,
                // include abstract and content URL if in github
                abstract: inGithub ? getAbstract(metadata.id) : null,
                contentURL: inGithub ? `${annotationRootURL}/${metadata.id}.html` : null,
            };  
        }

        // process the thumbnail for this entry
        const thumbnailID = findImageID(metadata.thumbnailURL)
        const thumbnailFile = thumbnails[thumbnailID]
        const thumbnailSource = `${tempThumbnailDir}/${thumbnailFile}`
        const thumbnailTarget = `${targetAnnotationThumbnailDir}/${thumbnailFile}`
        if( thumbnailFile && fs.existsSync(thumbnailSource) ) {
            fs.copyFileSync( thumbnailSource, thumbnailTarget )    
            annotation.thumbnail = thumbnailFile
        } 
        
        annotationContent.push(annotation)
    }

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

async function processAnnotation( annotationAsset, metadata, authors ) {

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

    // Load alternate text for illustrations
    let altTexts = {};
    if( annotationAsset.altTextFile ) {
        altTexts = await loadAltText( annotationAsset.altTextFile );
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
    const illustrations = {};
    const illustrationsDir = `${targetImageDir}/${annotationID}`;
    dirExists( illustrationsDir );
    annotationAsset.illustrations.forEach( illustration => {
        const sourceFile = `${baseDir}/${annotationAsset.id}/illustrations/${illustration}`
        const targetFile = `${illustrationsDir}/${illustration}`
        const imageID = illustration.replace(/.\w+$/,'')
        illustrations[imageID] = illustration
        fs.copyFileSync( sourceFile, targetFile );
    })

    // Take the pandoc output and transform it into final annotation html
    processAnnotationHTML(annotationHTMLFile, annotationID, captions, biblio, illustrations, altTexts);

    return {
        ...metadata,
        authors,
        abstract,
        contentURL: `${annotationRootURL}/${annotationID}.html`
    };    
}

function recursiveRemoveDir(path){
    if(fs.existsSync(path)){
        fs.rmdirSync(path, { recursive: true });
        console.log(`Removed ${path} dir`);
    }
}

function migrateAnnotations(annotationMetadata) {
    logger.info("Migrating Annotations...")
    logSeperator()
    dirExists( targetAnnotationDir )
    dirExists( targetImageDir )
    const existingFiles = fs.readdirSync(ghAnnotationDir);
    
    fs.readdirSync(targetAnnotationDir).forEach(file => {
        const annoId = file.substr(0, file.indexOf('.'));
        const metaData = Object.values(annotationMetadata).find(data => data.id === annoId);
        const fileOnGithub = existingFiles.find(f => f === file);
        const annoImageDir = `${targetImageDir}/${annoId}`

        if(!!fileOnGithub){
            // Replaces auto-generated html with existing html file from m-k-annotation-data repo
            fs.copyFileSync(`${ghAnnotationDir}/${file}`, `${targetAnnotationDir}/${file}`)
            console.log(`${file} already exists in m-k-annotation-data repo so copied it to public dir.`);

            // Removes annotation image dir if it exists (so it doesn't end up in build)
            recursiveRemoveDir(annoImageDir)

        } else if(!!metaData){
            if(metaData.dataSource === 'gh'){

                migrateAnnotation(file, annoId)
                console.log(`Migrated ${file} to m-k-annotation-data repo and copied to public dir`);


                migrateImages(annoId)

                // Removes annotation image dir if it exists (so it doesn't end up in build)
                recursiveRemoveDir(annoImageDir)

            }
        } else if(!file.toString().includes(".json")) {
            console.log(`No metadata found for ${file}`);
        }
    });

    existingFiles.forEach(file => {
        const annoId = file.substr(0, file.indexOf('.'));
        const annoImageDir = `${targetImageDir}/${annoId}`
        // Replaces auto-generated html with existing html file from m-k-annotation-data repo
        fs.copyFileSync(`${ghAnnotationDir}/${file}`, `${targetAnnotationDir}/${file}`)
        // Removes annotation image dir if it exists (so it doesn't end up in build)
        recursiveRemoveDir(annoImageDir)
    })
}

function migrateImages(annoId) {
    fs.readdirSync(`${targetImageDir}/${annoId}`).forEach(file => {
        const destinationDir = `${s3ImageDir}/${annoId}`;
        const sourcePath = `${targetImageDir}/${annoId}/${file}`;
        
        // Copies images to be uploaded to s3
        if (!fs.existsSync(destinationDir)){
            fs.mkdirSync(destinationDir);
        }
        fs.copyFileSync(sourcePath, `${destinationDir}/${file}`);
        console.log(`Migrated ${file} to ${s3ImageDir} for uploading to aws`);

    })
}

function migrateAnnotation(file, annoId) {
    console.log(`Processing / prettifying ${file} for m-k-annotation-data repo...`);
    const defaultAnnoPath = `${targetAnnotationDir}/${file}`;
    const ghAnnoPath = `${ghAnnotationDir}/${file}`;
    let html = fs.readFileSync( defaultAnnoPath, "utf8");

    // replaces all src attribute url w/ asset server URL
    html = html.replace(
        /(src=")https?(:\/\/)([a-zA-Z0-9\.\-\_\:\/]+)\/+images\//gm,
        `$1${annotationAssetRootURL}/`
    )
        
    let htmlDOM = new JSDOM(html);
    let doc = htmlDOM.window.document;

    const annoArray = JSON.parse(fs.readFileSync(`${targetAnnotationDir}/annotations.json`)).content
    const anno = annoArray.find(a => a.id === annoId);
    const headerSection = doc.getElementsByClassName('header-section')[0];
    let body = doc.getElementsByTagName('body')[0];

    // Removes h1 && h4 generated via the google drive process
    let h1 = doc.getElementsByTagName('h1')[0];
    let h4 = doc.getElementsByTagName('h4')[0];
    if (h1) body.removeChild(h1);
    if (h4) body.removeChild(h4);

    // Adds abstract / cite as elements if not already present
    if( (anno.abstract || anno.citeAs) && !headerSection ) {

        let container = doc.createElement('div'); 

        container.className = "header-section";

        container.innerHTML = `
            <h2>Abstract</h2><div>
            ${anno.abstract ? anno.abstract : ''}
            </div><br/><h2>Cite As</h2><div>
            ${anno.citeAs ? anno.citeAs : ''}
            </div>
        `;

        body.prepend(container);
    }

    // beautify html
    const prettyHtml = beautify( htmlDOM.serialize(), { 
        wrap_line_length: 80, 
        wrap_attributes:'force-aligned', 
        inline: ['span', 'a', 'sup', 'u', 'em', 'i']
    });

    // regex to strip leading/trailing whitespace from within parentheses
    // seemingly not needed, but provided in case of future use
    // replaceAll(/\(\s?(<\w>)?\s?(<\w>)?\s?([\w<>\/\., ]+)\s?(<\/\w>)?\s?(<\/\w>)?\s?\))/g, "($1$2$3$4$5)");

    // writes processed html to m-k-annotation-data repo
    fs.writeFileSync(ghAnnoPath, prettyHtml)

    // Replaces auto-generated html with newly created html file from m-k-annotation-data repo
    fs.copyFileSync(ghAnnoPath, defaultAnnoPath)
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

function processAnnotationHTML( annotationHTMLFile, annotationID, captions, biblio, illustrations, altTexts ) {

    logger.info(`Processing annotation ${annotationID}`);
    // load document 
    let html = fs.readFileSync( annotationHTMLFile, "utf8");

    // hack to pull paragraphs continuing through blockquotes together
    html = html.replace(/⇐/g,'<span class="pull-left"></span>')

    let htmlDOM = new JSDOM(html);
    let doc = htmlDOM.window.document;

    let anchorTags = doc.getElementsByTagName('A');

    let replacements = [];
    for( let i=0; i< anchorTags.length; i++ ) {
        let anchorTag = anchorTags[i];
        let {href} = anchorTag;
        const imageID = findImageID( href );
        let videoURL = !imageID && href.match(videoEmbedRegX) ? href : null;
        if(!videoURL && !imageID) videoURL = href.match(videoEmbedRegX2) ? href : null;
        if( imageID || videoURL ) {
            if( imageID && !illustrations[imageID] ) {
                logger.info(`Illustration not found: ${href}`)
            }
            const paragraphElement = findParentParagraph(anchorTag);     
            if( paragraphElement ) {
                const figureRefEl = doc.createElement('i');
                figureRefEl.innerHTML = anchorTag.innerHTML; 
                replacements.push([anchorTag,figureRefEl]);
                const expectedType = (imageID) ? 'fig' : 'vid'
                let figureNumber = extractFigureNumber(anchorTag.text,expectedType);
                if( figureNumber !== invalidFigureNumber ) {
                    let figureEl = doc.createElement('figure'); 
                    const caption = captions[figureNumber];
                    if( !caption ) logger.info(`Caption not found for ${figureNumber}`);
                    const figCaption = (caption) ? `<figcaption>${caption}</figcaption>` : '';
                    if( imageID ) {
                        const imageURL = `${imageRootURL}/${annotationID}/${illustrations[imageID]}`
                        const altText = altTexts[imageID] ? altTexts[imageID].text : figureNumber
                        figureEl.innerHTML = `<img src="${imageURL}" alt="${altText}" />${figCaption}`;      
                    } else {
                        figureEl.innerHTML = `<iframe width="${videoWidth}" height="${videoHeight}" src="${videoURL}" frameborder="0" allowfullscreen></iframe>${figCaption}`
                    }
                    const { nextSibling } = paragraphElement;
                    if( nextSibling && nextSibling.className === 'figure-container' ) {
                        // figure container found, add the figure
                        nextSibling.appendChild(figureEl);
                    } else {
                        // create the figure container and append the figure to it
                        const figureContainer = doc.createElement('div');
                        figureContainer.className = 'figure-container';
                        figureContainer.appendChild(figureEl);
                        paragraphElement.parentNode.insertBefore(figureContainer, nextSibling); 
                    }
                } else {
                    logger.info(`Invalid figure or video reference: ${anchorTag.innerHTML}`)
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
        biblioEl.className = "bibliography";
        biblioEl.innerHTML = biblio;
        let body = doc.getElementsByTagName('body')[0];
        body.append(biblioEl);
    }

    // set first row of table to header, then set even and odd rows appropriately
    const moveRowToBody = function(row, body, className) {
        const newRow = doc.createElement('tr');
        newRow.className = className;
        for (let i = 0; i < row.children.length; i++) {
            const td = doc.createElement('td');
            const child = row.children[i];
            td.innerHTML = child.innerHTML;
            td.colSpan = child.colSpan;
            newRow.appendChild(td);
        }
        body.appendChild(newRow);
    }
    const tables = doc.getElementsByTagName('table');
    for(let table of tables){
        const header = table.tHead;
        const body = table.tBodies[0];
        body.innerHtml = '';
        const rows = header.children;
        let rowsToRemove = [];
        for(let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (i === 0) {
                row.className = 'header';
            } else if (i % 2 === 0) {
                rowsToRemove.push(row);
                moveRowToBody(row, body, 'even');
            } else {
                rowsToRemove.push(row);
                moveRowToBody(row, body, 'odd');
            }
        }
        for(let j = 0; j < rowsToRemove.length; j++) {
            header.removeChild(rowsToRemove[j]);
        }
    };

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

function extractFigureNumber( figureText, expectedType ) {
    if( !figureText ) return invalidFigureNumber

    const figureMatch = figureText.match(figureCitation)
    const videoMatch = figureText.match(videoCitation)

    if( figureMatch || videoMatch ) {
        let matched
        if( figureMatch && videoMatch ) {
            matched = ( figureMatch.index > videoMatch.index ) ? videoMatch : figureMatch
        } else {
            matched = figureMatch ? figureMatch : videoMatch
        }

        let figureNum = matched[0].match(figureNumber)[0];
        while( figureNum && figureNum[0] === '0') {
            figureNum = figureNum.substr(1);
        }
        if(figureNum && figureNum.length > 0) {
            const figType = (matched === figureMatch) ? 'fig' : 'vid'
            // if we know what type it should be, it has to match
            if( !expectedType || figType === expectedType ) {
                return `${figType}. ${figureNum}`;
            }
        }
    }
    return invalidFigureNumber;
}

function copyFigures() {
    dirExists(targetFigureDir)
    execSync(`cp -r ${figureSourceDir} ${targetFigureDir}`, (error, stdout, stderr) => {
        console.log(`${stdout}`);
        console.log(`${stderr}`);
        if (error !== null) {
            throw `ERROR: Unable to copy figures from targetDir: ${targetFigureDir}`;
        }
    }); 
}

function writeEnvFile() {
    const { buildID, editionDataURL, googleTrackingID, releaseMode } = configData

    let date = new Date();
    const timestamp = `# Generated by Lizard at ${date.toLocaleTimeString()} on ${date.toDateString()}.`

    const envData = `### DO NOT EDIT THIS FILE DIRECTLY ##
REACT_APP_FOLIO_URL_PREFIX=https://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/
REACT_APP_BUILD_ID=${buildID}
REACT_APP_EDITION_DATA_URL=${editionDataURL}
REACT_APP_GOOGLE_ANALYTICS_TRACKING_ID=${googleTrackingID ? googleTrackingID : ''}
REACT_APP_RELEASE_MODE=${releaseMode}`

    const devEnv = `${envData}
PORT=4000
${timestamp}`

    const prodEnv = `${envData}
${timestamp}`

    fs.writeFileSync('.env.development',devEnv,"utf8")
    fs.writeFileSync('.env.production',prodEnv,"utf8")
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

async function run(mode) {
    switch( mode ) {
        case 'download': {
            const annotationDriveAssets = locateAnnotationAssets();
            const annotationMetadata = await loadAnnotationMetadata()
            const selectedAssets = filterForDownload(annotationMetadata,annotationDriveAssets)
            syncDriveAssets( selectedAssets );
            }
            break;
        case 'download-thumbs': {
            const thumbnailAssets = locateThumbnails();
            const annotationMetadata = await loadAnnotationMetadata()
            syncThumbnails( thumbnailAssets, annotationMetadata )
            }
            break;
        case 'process': {
            const annotationAssets = findLocalAssets();
            const annotationMetadata = await loadAnnotationMetadata()
            const authors = await loadAuthors()
            const thumbnails = loadThumbnails()
            await processAnnotations(annotationAssets,annotationMetadata,authors,thumbnails)
            }
            break;
        case 'index':
            // TODO only index the annotations published at this stage
            searchIndex.generateAnnotationIndex(targetAnnotationDir, targetSearchIndexDir);
            break;
        case 'sync':
            await run('download')
            await run('download-thumbs')
            await run('run')
            await run('migrate')
            break;
        case 'manifest':
            iiifManifest.generate(configData)
            break;
        case 'assets':
            await assetServer.generate(configData)
            break;
        case 'figures':
            copyFigures()
            break;
        case 'env':
            writeEnvFile()
            break;
        case 'migrate':
            const annotationMetadata = await loadAnnotationMetadata()
            migrateAnnotations(annotationMetadata)
            await run('index')
            break;
        case 'run': 
            await run('manifest')
            await run('assets')
            await run('process')
            await run('index')
            await run('figures')
            await run('env')
            break;
    }    
}

function loadConfig(targetName) {
    // load the config
    configData = configLoader.load(targetName);
    if( !configData ) {
        console.log("Unable to load configuration file. Expected it in edition_data/config.json");
        process.exit(-1);   
    }

    // track build id
    configData.editionDataURL = `${configData.editionDataURL}/${configData.buildID}`
    configData.targetDir = `${configData.targetDir}/${configData.buildID}`

    const { sourceDir, targetDir, workingDir, editionDataURL, assetServerURL, rclone } = configData

    // source dir
    annotationMetaDataCSV = `${sourceDir}/metadata/annotation-metadata.csv`;
    authorsCSV = `${sourceDir}/metadata/authors.csv`;

    // target dir
    targetImageDir = `${targetDir}/images`;
    targetSearchIndexDir = `${targetDir}/search-idx`;
    targetAnnotationDir = `${targetDir}/annotations`;
    targetAnnotationThumbnailDir = `${targetDir}/annotations-thumbnails`;
    targetFigureDir = targetDir

    dirExists(targetDir)
    dirExists(targetImageDir)
    dirExists(targetSearchIndexDir)
    dirExists(targetAnnotationDir) 
    dirExists(targetAnnotationThumbnailDir)

    // working dir
    baseDir = `${workingDir}/annotations`;
    tempCaptionDir = `${workingDir}/captions`;
    tempAbstractDir = `${workingDir}/abstract`;
    tempBiblioDir = `${workingDir}/biblio`;
    tempThumbnailDir = `${workingDir}/thumbnails`;
    thumbnailListFile = `${tempThumbnailDir}/thumbnails.json`;
    cachedAnnotationDriveScan = `${workingDir}/cachedScanFile.json`;
    convertAnnotationLog = `${workingDir}/lizard.log`;

    dirExists(workingDir)
    dirExists(baseDir)
    dirExists(tempCaptionDir)
    dirExists(tempAbstractDir)
    dirExists(tempBiblioDir)
    dirExists(tempThumbnailDir)
    dirExists(s3ImageDir);

    // edition URL
    annotationRootURL = `${editionDataURL}/annotations`;
    imageRootURL = `${editionDataURL}/images`;

    // asset URL
    annotationAssetRootURL = assetServerURL;

    // rclone configuration
    rCloneServiceName = rclone.serviceName;
    rCloneSharedDrive = rclone.sharedDrive;
    googleShareName = rclone.folderName;
}

function main() {
    let mode;
    if (process.argv.length <= 2) {
        mode = 'help'
    } else {
        mode = process.argv[2];
    }

    let target;
    if (process.argv.length <= 3) {
        target = 'local'
    } else {
        target = process.argv[3];
    }
     
    if( mode === 'help' ) {
        console.log(`Usage: lizard.js <command> <target>` );
        console.log("A helpful lizard that responds to the following <command>s:")
        console.log("\tdownload-thumbs: Download essay thumbnails from Google Drive via rclone.");
        console.log("\tdownload: Download only essays marked with 'refresh'.");
        console.log("\tprocess: Process the downloaded files and place them on the asset server.");
        console.log("\tmanifest: Create the IIIF Manifest and associated files.");
        console.log("\tassets: Process the manuscript data and edition webpages and index them.");
        console.log("\tfigures: Copy the manuscript figures into the target directory.");
        console.log("\tenv: Create the environment files for development and production.");
        console.log("\tindex: Create a search index of the essays.");
        console.log("\trun: Download, process, manifest, assets, figures, env, and index.")
        console.log("\tmigrate: Migrates annotations to/from github and preps images for upload to s3 (see README).")
        console.log("\tsync: Download all, download thumbs, run, and migrate.")
        console.log("\thelp: Displays this help. ");
        console.log("<target> is the target key from the edition_data/config.json file. Defaults to 'local'.");
        process.exit(-1);
    }

    loadConfig(target);
    setupLogging();

    let date = new Date();
    logger.info(`Lizard running in ${mode} mode at ${date.toLocaleTimeString()} on ${date.toDateString()}.`);
    logSeperator();    

    run(mode).then(() => {
        logger.info(`Lizard finished at ${date.toLocaleTimeString()}.`)
    }, (err) => {
        logger.info(`Lizard stopped at ${date.toLocaleTimeString()}.`)
        logger.error(`${err}: ${err.stack}`)  
    });
}

///// RUN THE SCRIPT
main()
