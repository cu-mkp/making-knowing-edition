const fs = require('fs');

// normal dev config
const devConfiguration = {
  iiifDomain: "http://localhost:4000",
  transcriptionDomain: "http://localhost:4000",
  folioPath: "/bnf-ms-fr-640/folio",
  listPath: "/list-dev",
  manifestFilename: 'manifest-dev.json',
  annotationListPath: "/bnf-ms-fr-640/list-dev"
};

// const devConfiguration = {
//   iiifDomain: "http://localhost:4000",
//   transcriptionDomain: "http://142.93.204.224",
//   folioPath: "/folio",
//   listPath: "/list-dev",
//   manifestFilename: 'manifest-dev.json',
//   annotationListPath: "/bnf-ms-fr-640/list-dev"
// };

const prodConfiguration = {
  iiifDomain: "http://edition.makingandknowing.org",
  transcriptionDomain: "http://edition.makingandknowing.org",
  folioPath: "/bnf-ms-fr-640/folio",
  listPath: "/list",
  manifestFilename: 'manifest.json',
  annotationListPath: "/bnf-ms-fr-640/list"
};

const stagingConfiguration = {
  iiifDomain: "http://edition-staging.makingandknowing.org",
  transcriptionDomain: "http://142.93.204.224",
  folioPath: "/folio",
  listPath: "/list-staging",
  manifestFilename: 'manifest-staging.json',
  annotationListPath: "/bnf-ms-fr-640/list-staging"
};

// const prodConfiguration2 = {
//   iiifDomain: "http://localhost:4000",
//   transcriptionDomain: "http://209.97.145.244",
//   folioPath: "/folio",
//   listPath: "/list-dev",
//   manifestFilename: 'manifest-dev.json',
//   annotationListPath: "/bnf-ms-fr-640/list-dev"
// };

const outputDir = "TEMP";

function generate_iiif_files(config) {
  let manifestJSON = fs.readFileSync(`${__dirname}/bnf_manifest.json`, "utf8");
  let manifest = JSON.parse(manifestJSON);
  let canvases = manifest["sequences"][0]["canvases"];

  let annotationListJSON = fs.readFileSync(`${__dirname}/annotation_list.json`, "utf8");
  let blankAnnotationList = JSON.parse(annotationListJSON);

  // make dirs for output, if necessary
  let listDir = `${__dirname}/${outputDir}/${config.listPath}`;
  if( !fs.existsSync(outputDir) ) fs.mkdirSync(outputDir);
  if( !fs.existsSync(listDir) ) fs.mkdirSync(listDir);

  for( let canvas of canvases ) {
    let folioID = generateFolioID(canvas["label"]);

    if( folioID ) {
      let fileName = `${folioID}.json`;
      let annotationListURL =  `${config.iiifDomain}${config.annotationListPath}/${fileName}`;
      let folioURL = `${config.transcriptionDomain}${config.folioPath}/${folioID}`;

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
  fs.writeFile(`${__dirname}/${outputDir}/${config.manifestFilename}`, JSON.stringify(manifest, null, 3), (err) => {
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
  generate_iiif_files(devConfiguration);
  generate_iiif_files(stagingConfiguration);
  generate_iiif_files(prodConfiguration);
  // generate_iiif_files(prodConfiguration2);

  console.log('IIIF Manifests created.');
}

///// RUN THE SCRIPT
main();
