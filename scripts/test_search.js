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
    
      documents.forEach(function (doc) {
        this.add(doc)
      }, this)
    })


/* USING QUERY METHOD****/

  let results =   idx.query(function(){
      const searchTerm = 'A JavaScript library for building user interfaces.';   //'library'
      console.log(`search term is ${searchTerm}`)
      this.term(['A JavaScript library for building user interfaces.'])
  });
  console.log(`results length is ${results.length}`)

      const resultText = [];
      let docWithTheTerm;
      results.forEach( result =>{
      docWithTheTerm = documents.find( d =>{ return d.name === result.ref})
            if(docWithTheTerm !== undefined)
            {
                  console.log(docWithTheTerm.text)
                  resultText.push(docWithTheTerm);
            }
      })