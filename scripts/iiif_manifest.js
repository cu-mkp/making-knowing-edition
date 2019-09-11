#!/usr/bin/env node

const fs = require('fs');
const configLoader = require('./config_loader');

function generate_iiif_files(config) {
  let manifestJSON = fs.readFileSync(`edition_data/bnf_manifest.json`, "utf8");
  let manifest = JSON.parse(manifestJSON);
  let canvases = manifest["sequences"][0]["canvases"];

  let annotationListJSON = fs.readFileSync(`scripts/annotation_list.json`, "utf8");
  let blankAnnotationList = JSON.parse(annotationListJSON);

  // make dirs for output, if necessary
  let listDir = `${config.targetDir}/list`;
  if( !fs.existsSync(listDir) ) fs.mkdirSync(listDir);

  for( let canvas of canvases ) {
    let folioID = generateFolioID(canvas["label"]);

    if( folioID ) {
      let fileName = `${folioID}.json`;
      let annotationListURL =  `${config.editionDataURL}/list/${fileName}`;
      let folioURL = `${config.editionDataURL}/folio/${folioID}`;

      // Add this to the manifest canvas entries:
      // "otherContent" : [ {
      //   "@id": "http://localhost:4000/bnf-ms-fr-640/list/p003r.json",
      //   "@type": "sc:AnnotationList"
      // }],
      canvas["otherContent"] = [ {
        "@id": annotationListURL,
        "@type": "sc:AnnotationList"
      } ];

      // Now create the corresponding annotation file, that points to the transcriptions
      let annoList = copyObject( blankAnnotationList );
      annoList["@id"] = annotationListURL;
      let transcriptionURLs = [
        folioURL + '/tc',
        folioURL + '/tcn',
        folioURL + '/tl'
      ];

      let resources = annoList["resources"];
      for( let i=0; i < 3; i++ ) {
        resources[i]["resource"]["@id"] = transcriptionURLs[i];
        resources[i]["on"] = annotationListURL;
      }

      for( let i=0; i < 3; i++ ) {
        // TODO: for now, need to use txt extension because the original xml is not actually valid xml
        resources[i+3]["resource"]["@id"] = `${transcriptionURLs[i]}/original.txt`;
        resources[i+3]["on"] = annotationListURL;
      }

      fs.writeFile(`${listDir}/${fileName}`, JSON.stringify(annoList, null, 3), (err) => {
        if (err) throw err;
      });
    }
  }

  // Write out the manifest that was created.
  fs.writeFile(`${config.targetDir}/manifest.json`, JSON.stringify(manifest, null, 3), (err) => {
      if (err) {
        console.log(err);
      } 
  });
}


function copyObject(a) {
  return JSON.parse(JSON.stringify(a));
}

function generateFolioID( bnfLabel ) {
  // grab r or v off the end
  let rectoOrVerso = bnfLabel.slice( bnfLabel.length-1 );
  let id = parseInt(bnfLabel.slice(0,bnfLabel.length-1));

  // the beginning and end pages do not have a numeric label
  if( isNaN(id) ) return null;

  // figure out how much padding we need
  let zeros = "";

  if( id < 10 ) {
    zeros = zeros + "0"
  }

  if( id < 100 ) {
    zeros = zeros + "0"
  }

  return `p${zeros.concat(id)}${rectoOrVerso}`;
}

function main() {

  // load the config
  const config = configLoader.load();
  if( !config ) {
    console.log("Unable to load configuration file. Expected it in edition_data/config.json");
    process.exit(-1);   
  }

  generate_iiif_files(config);
  console.log('IIIF Manifest created.');
}

///// RUN THE SCRIPT
main();
