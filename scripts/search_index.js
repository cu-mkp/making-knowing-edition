const fs = require('fs');

// load lunr with fr support
var lunr = require('lunr');
require("lunr-languages/lunr.stemmer.support")(lunr)
require('lunr-languages/lunr.multi')(lunr)
require("lunr-languages/lunr.fr")(lunr)

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function htmlToText(html) {
  return html ? html.replace(/<\/?[^>]+>/ig, " ") : ""
}

function parseFolio(html) {
  let dom = new JSDOM(html);
  let htmlDoc = dom.window.document;
  let folio = htmlDoc.querySelector('folio');
  if( folio === null ) return [];

  let recipeDivs = folio.children;
  let passages = [];
  for (let i = 0; i < recipeDivs.length; i++) {
    let recipeDiv = recipeDivs[i];
    let recipeID = recipeDiv.id;
    if( recipeID ) {
      let headerElement = recipeDiv.querySelector("h2")
      let name = ( headerElement ) ? htmlToText(headerElement.innerHTML) : null;
      let content = htmlToText(recipeDiv.innerHTML);
      passages.push({
        recipeID: recipeID,
        name: name,
        content: content
      });
    }
  }

  return passages;
}

function createSearchIndex( folioPath, indexPath, transcriptionType ) {
      var recipeBook = {};
      var searchIndex = lunr(function () {
            this.use(lunr.multiLanguage('en', 'fr'))
            // this.pipeline.remove(lunr.stemmer)
            // this.pipeline.remove(lunr.stopWordFilter)
            this.ref('id')
            this.field('content')
            this.metadataWhitelist = ['position',];
            let folios = fs.readdirSync(folioPath);
            let ordinalId=1;
            folios.forEach( folioID => {
                  // ignore hidden directories
                  if( folioID.startsWith('.') ) 
                        return;
                  // ignore the manifest file
                  if( folioID.startsWith('manifest') ) 
                        return;
                  let folioHTMLFile = `${folioPath}/${folioID}/${transcriptionType}/index.html`;
                  if( fs.existsSync(folioHTMLFile) ) {
                  const html = fs.readFileSync( folioHTMLFile, "utf8");
                  const passages = parseFolio(html);
                  for( let passage of passages ) {
                  // create a search index document
                        const passageRecord = { 
                              id: `${passage.recipeID}-${folioID}`,
                              content: passage.content,
                        };
                        // add record to lunr index
                        this.add( passageRecord );
                        ordinalId++;
                        
                        let recipe = recipeBook[passage.recipeID];
                        if( !recipe ) {
                              // create a new recipe entry
                              recipe = {
                              id: passage.recipeID,
                              numericIndex: ordinalId,
                              name: 'ERROR: Unable to parse name.',
                              passages: {} 
                              };
                              recipeBook[passage.recipeID] = recipe;
                        } 
                        if( passage.name ) 
                              recipe.name = passage.name;

                        recipe.passages[folioID] = passageRecord.content;
                        }
                  }

            }, this);
  });

  let searchIndexFile = `${indexPath}/${transcriptionType}_search_index.js`;
  let recipeBookFile = `${indexPath}/${transcriptionType}_recipe_book.js`;

  // write index to file
  fs.writeFileSync(searchIndexFile, JSON.stringify(searchIndex), (err) => {
    if (err) throw err;
  });


  // write the recipe file
  fs.writeFileSync(recipeBookFile, JSON.stringify(recipeBook), (err) => {
    if (err) throw err;
  });
}

function parseAnnotation( html ) {
  let htmlDOM = new JSDOM(html);
  let doc = htmlDOM.window.document;
  var div = doc.createElement("div");
  div.innerHTML = html;
  var text = div.textContent || div.innerText || "";
  return text;
}

var generateAnnotationIndex = function generateAnnotationIndex( annotationPath, indexPath ) {

  // open an index for writing, output to searchIndexDir dir
  var searchIndex = lunr(function () {
    this.ref('id')
    this.field('content')
    this.metadataWhitelist = ['position'];

    let annotations = fs.readdirSync(annotationPath);
    annotations.forEach( annotationHTMLFile => {
      // ignore hidden directories
      if( annotationHTMLFile.startsWith('.') ) return;
      // ignore manifest
      if( annotationHTMLFile === 'annotations.json' ) return;
      const html = fs.readFileSync( `${annotationPath}/${annotationHTMLFile}`, "utf8");
      const content = parseAnnotation(html);
      const annotationID = annotationHTMLFile.split('.')[0];
      // create a search index document
      const annotationRecord = { 
        id: annotationID,
        ordianlId:ordinalId,
        content: content
      };
      ordinalId++;
      // add record to lunr index
      this.add( annotationRecord );
    }, this);
  });

  let searchIndexFile = `${indexPath}/annotation_search_index.js`;

  // write index to file
  fs.writeFileSync(searchIndexFile, JSON.stringify(searchIndex), (err) => {
    if (err) throw err;
  });
}

var generate = function generate(folioPath,indexPath) {  
  createSearchIndex(folioPath, indexPath, 'tl');
  createSearchIndex(folioPath, indexPath, 'tc');
  createSearchIndex(folioPath, indexPath, 'tcn');
}

// EXPORTS /////////////
module.exports.generate = generate;
module.exports.generateAnnotationIndex = generateAnnotationIndex;