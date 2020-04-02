#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

const searchIndex = require('./search_index');
const convert = require('./convert');
const convertEntries = require('./convert_entries');
const glossary = require('./glossary');
const comments = require('./comments');
const staticContent = require('./static_content')
const configLoader = require('./config_loader');

const waitTimeLengthMins = 1;

const transcriptionTypes = [
  'tc', 'tcn', 'tl'
];

function downloadFiles(inputDir) {
  execSync(`git -C ${inputDir} pull`, (error, stdout, stderr) => {
    console.log(`${stdout}`);
    console.log(`${stderr}`);
    if (error !== null) {
        console.log(`exec error: ${error}`);
    }
  });
}

function reorganizeFiles(pullDir, orderedDir) {
  const inputDir = `${pullDir}/ms-xml`;

  const listDir = fs.readdirSync(`${pullDir}/ms-xml/tc`);

  listDir.forEach( page => {
    // extract folio ID
    const matches = page.match(/p[0-9]{3}[vr]/);
    // make sure there are no other files that aren't pages
    const folioID = matches ? matches[0] : null;

    if(folioID) {
      const targetDir = `${orderedDir}/${folioID}`;

      if( dirExists(targetDir) ) {
        transcriptionTypes.forEach( transcriptionType => {
          const sourceFile = `${inputDir}/${transcriptionType}/${transcriptionType}_${folioID}_preTEI.xml`;
          if(fs.existsSync(sourceFile)) {
            const targetFile = `${targetDir}/${transcriptionType}_${folioID}.txt`;
            fs.copyFileSync(sourceFile, targetFile);
          }
        });
      }
    }
  });
}

function clearLogFile() {
  const logFile = "nginx/webroot/logfile.txt";
  if( fs.existsSync(logFile) )
  execSync(`rm ${logFile}`, (error, stdout, stderr) => {
    console.log(`${stdout}`);
    console.log(`${stderr}`);
    if (error !== null) {
        console.log(`exec error: ${error}`);
    }
  });
}

function copyFolioXMLs( sourcePath, folioPath ) {
  const inputDir = fs.readdirSync(sourcePath);
  inputDir.forEach( folioFolder => {
    // ignore hidden directories
    if( folioFolder.startsWith('.') ) return;

    // extract the folio ID from the folder name
    const matches = folioFolder.match(/p[0-9]{3}[vr]/);
    const folioID = matches ? matches[0] : null;

    if( folioID ) {
      const targetDir = `${folioPath}/${folioID}`;

      // create a dir for folio if necessary
      if( dirExists(targetDir) ) {
        transcriptionTypes.forEach( transcriptionType => {
          const sourceFile = `${sourcePath}/${folioFolder}/${transcriptionType}_${folioID}.txt`;
          const ttDir = `${targetDir}/${transcriptionType}`;
          // always create the dir even if source file not found.
          if( dirExists(ttDir) ) {
            if( fs.existsSync(sourceFile) ) {
              const targetFile = `${ttDir}/original.txt`;
              fs.copyFileSync(sourceFile, targetFile);
            }
          }
        });
      }
    }
  });
}

function dirExists( dir ) {
  if( !fs.existsSync(dir) ) {
    fs.mkdirSync(dir);
    if( !fs.existsSync(dir) ) {
      console.log(`${dir} not found and unable to create it.`);
      return false;
    }
  }
  return true;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function nextInterval() {
    const now = new Date();
    const nextIntervalMins = waitTimeLengthMins - (now.getMinutes() % waitTimeLengthMins);
    const nextIntervalMs = (nextIntervalMins * 60) * 1000;
    return nextIntervalMs;
}

async function main() {

  let mode;
  if (process.argv.length <= 2) {
      mode = 'pull'
  } else {
      mode = process.argv[2];
  }

  if( mode === 'help' ) {
    console.log(`Usage: asset_server.js <command>` );
    console.log("The asset server responds to the following commands:")
    console.log("\tlocal: Don't pull from github and only run once.");
    console.log("\thelp: Display this help.");
    process.exit(-1);
  }  

  // load the config
  const configData = configLoader.load();
  if( !configData ) {
    console.log("Unable to load configuration file. Expected it in edition_data/config.json");
    process.exit(-1);   
  }

  // make sure the necessary dirs exist
  const inputDir = configData.sourceDir;
  const correctFormatDir = `${configData.workingDir}/sorted-input`;
  const folioPath = `${configData.targetDir}/folio`;
  const searchIndexPath = `${configData.targetDir}/search-idx`;
  const contentTargetPath = `${configData.targetDir}/content`;
  const figureBaseURL = `${configData.editionDataURL}/figures`
  if( !dirExists(configData.workingDir) ||
      !dirExists(configData.targetDir) ||
      !dirExists(folioPath) || 
      !dirExists(searchIndexPath) || 
      !dirExists(correctFormatDir) || 
      !dirExists(inputDir) ||
      !dirExists(contentTargetPath)    ) {
    console.log('Unable to start asset server.');
    return;
  }

  const commentsCSV = `${configData.sourceDir}/metadata/DCE_comment-tracking-Tracking.csv`;
  const glossaryCSV = `${configData.sourceDir}/glossary/DCE-glossary-table.csv`;
  const entriesCSV = `${configData.sourceDir}/metadata/entry_metadata.tsv`;
  const targetCommentsFile = `${configData.targetDir}/comments.json`;
  const targetGlossaryFile = `${configData.targetDir}/glossary.json`;
  const targetEntriesFile = `${configData.targetDir}/entries.json`;

  const now = new Date();
  console.log( `Asset Pipeline started at: ${now.toString()}`);

  if( mode !== 'local' ) {
    console.log('Download files from Github...');
    downloadFiles(inputDir);  
    downloadFiles(configData.contentDir);
  }

  console.log('Reorganize files...');
  reorganizeFiles(inputDir, correctFormatDir);

  console.log('Copy all the folios to the web directory...');
  copyFolioXMLs( correctFormatDir, folioPath );

  console.log('Convert folios to HTML...');
  convert.convertFolios(folioPath,figureBaseURL);

  console.log('Convert entries to JSON...');
  await convertEntries.convert(entriesCSV, targetEntriesFile);

  console.log('Generate Search Index...');
  searchIndex.generate(folioPath, searchIndexPath);

  console.log('Generate Glossary...');
  await glossary.generate(glossaryCSV, targetGlossaryFile);

  console.log('Process Static Content...');
  await staticContent.process(configData.contentDir, contentTargetPath);

  console.log('Generate Comments...');
  await comments.generate(commentsCSV, targetCommentsFile);

  if( mode === 'local' ) {
    console.log('Done.');
    return
  }
  console.log('sleeping');
  sleep(nextInterval());

}

main();
