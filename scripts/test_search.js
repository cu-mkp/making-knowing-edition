const fs = require('fs');

// load lunr with fr support
var lunr = require('lunr');
require("lunr-languages/lunr.stemmer.support")(lunr)
require('lunr-languages/lunr.multi')(lunr)
require("lunr-languages/lunr.fr")(lunr)

const jsdom = require("jsdom");
const { JSDOM } = jsdom;


var documents = [{
      "name": "Lunr",
      "text": "Like Solr, but much smaller, and not as bright."
    }, {
      "name": "React",
      "text": "A JavaScript library for building user interfaces."
    }, {
      "name": "Lodash",
      "text": "A modern JavaScript utility library delivering modularity, performance & extras."
    }]


    var idx = lunr(function () {
      this.ref('name')
      this.field('text')
      this.field('index')
    let value=9;
      documents.forEach(function (doc) {
            doc.index=value;
            value++;
        this.add(doc)
      }, this)
    })


/* USING QUERY METHOD****/

//   let results =   idx.query(function(){
//       const searchTerm = 'JavaScript library';   //'library'
//       console.log(`search term is ${searchTerm}`)
//       this.term([searchTerm])
//   });

      let results = idx.search('library')
      console.log(`results length is ${results.length}`)

      const resultText = [];
      let docWithTheTerm;
      results.forEach( result =>{
            docWithTheTerm = documents.find( d =>{ return d.name === result.ref})
                  if(docWithTheTerm !== undefined)
                  {
                        console.log(`text ${docWithTheTerm.text}, index: ${docWithTheTerm.index}`)
                        resultText.push(docWithTheTerm);
                  }
            }
            );