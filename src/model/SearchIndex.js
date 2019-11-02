import axios from 'axios';
import lunr from 'lunr';
// import stemmer from 'lunr-languages/lunr.stemmer.support'
// import fr from 'lunr-languages/lunr.fr'

class SearchIndex {

	constructor() {
            this.searchIndexURL = `${process.env.REACT_APP_EDITION_DATA_URL}/search-idx`;
            this.searchIndex = {};
            this.recipeBook = {};
                        this.loaded = false;
                        //stemmer(lunr);
                        //fr(lunr)
            }

	load() {
		if (this.loaded) {
			// promise to resolve this immediately
			return new Promise(function(resolve, reject) {
				resolve(this);
			}.bind(this));
		} else {
			// promise to load the search index
			return new Promise(function(resolve, reject) {
				axios.all([
            axios.get(`${this.searchIndexURL}/annotation_search_index.js`),
						axios.get(`${this.searchIndexURL}/tl_search_index.js`),
						axios.get(`${this.searchIndexURL}/tl_recipe_book.js`),
						axios.get(`${this.searchIndexURL}/tc_search_index.js`),
						axios.get(`${this.searchIndexURL}/tc_recipe_book.js`),
						axios.get(`${this.searchIndexURL}/tcn_search_index.js`),
						axios.get(`${this.searchIndexURL}/tcn_recipe_book.js`)
					])
					.then(axios.spread(function(anno, searchTl, recipeTl, searchTc, recipeTc, searchTcn, recipeTcn) {
                                    this.searchIndex['anno'] = lunr.Index.load(anno.data);
                                    this.searchIndex['tl'] = lunr.Index.load(searchTl.data);
                                    this.searchIndex['tl'].pipeline.remove(lunr.stemmer)
                                    this.searchIndex['tl'].pipeline.remove(lunr.stopWordFilter)
                                    this.recipeBook['tl'] = recipeTl.data;
                                    this.searchIndex['tc'] = lunr.Index.load(searchTc.data);
                                    this.searchIndex['tc'].pipeline.remove(lunr.stemmer)
                                    this.searchIndex['tc'].pipeline.remove(lunr.stopWordFilter)
                                    this.recipeBook['tc'] = recipeTc.data;
                                    this.searchIndex['tcn'] = lunr.Index.load(searchTcn.data);
                                    this.searchIndex['tcn'].pipeline.remove(lunr.stemmer)
                                    this.searchIndex['tcn'].pipeline.remove(lunr.stopWordFilter)
                                    this.recipeBook['tcn'] = recipeTcn.data;
                                    this.loaded = true;
                                    resolve(this);
                                                      }.bind(this)))
                                                      .catch((error) => {
                                                            reject(error);
                                                      });
			}.bind(this));
		}
	}

      parseIDs( docID ) {
      const parts = docID.split('-');
      return { recipeID: parts[0], folioID: parts[1] };
      }

      searchAnnotations( searchTerm ) {
      let results = this.searchIndex['anno'].search(searchTerm);

      let displayResults = [];
      for( let result of results ) {
            let searchResult = {
            id: result.ref,
            matchedTerms: Object.keys(result.matchData.metadata)
            };
            displayResults.push( searchResult );
      }

      return displayResults;
      }

	// transcription type can be tc, tcn, or tl.
  searchEdition( searchTerm, transcriptionType) {
    // TODO deal with blank search query (whitespace only)
    const terms = searchTerm.split(' ');
     let strippedTerms 
     let andTerms ='';
     if(terms.length > 1){
           strippedTerms = terms.map( t =>{
                 return t.replace( /\+/g, '').replace(/-/g,'');
           });
           strippedTerms.forEach(t=>{
                 andTerms += `+${t} `
           })
     }
      searchTerm = andTerms !=='' ?andTerms:searchTerm;

      let results;
      results= this.searchIndex[transcriptionType].search(searchTerm);  

      // TODO build UI 
      // if( strippedTerms && results ) {
      //       results = this.phraseMatchFilter(strippedTerms,transcriptionType,results);
      // }

      let displayResults = [];
      for( let result of results ) {
            const { recipeID, folioID } = this.parseIDs( result.ref );
            let recipe = this.recipeBook[transcriptionType][ recipeID ];
            let friendlyFolioName = folioID.slice(1);
            friendlyFolioName = friendlyFolioName.replace(/^[0|\D]*/,'');

            if( recipe ) {
                  displayResults.push({ 
                        name: recipe.name, 
                        folio: folioID,
                        friendlyFolioName,
                        index:recipe.numericIndex,
                        matchedTerms: Object.keys(result.matchData.metadata),
                        contextFragment: recipe.passages[folioID]
                  });  
            }
      }

      for( let displayResult of displayResults ) {
            const folioID = displayResult.folio;
            displayResult.contextFragment = this.markMatchedTerms( [displayResult], 'folio', folioID, displayResult.contextFragment );
            // TODO shorten fragment 
      }

      return displayResults;
  }

  markMatchedTerms( searchResults, recordType, recordID, content ) {
    // recordID could be for a folio or an annotation
    let idKey = (recordType === 'folio') ? 'folio' : 'id';
    // find the matched terms that related to this folio
    let matchedTerms = [];
    for( let searchResult of searchResults ) {
      if( searchResult[idKey] === recordID ) {
        matchedTerms = matchedTerms.concat( searchResult.matchedTerms );
      }
    }
    // distill a set of unique terms
    matchedTerms = matchedTerms.filter( (value, index, self) => {return self.indexOf(value) === index} );

    // Inject <mark> around searchterms
    let termList = content.replace(/\n/g, ' ').split(' ');
    for( let matchedTerm of matchedTerms ) {
      for( let i=0; i < termList.length; i++ ) {
        let term = termList[i].replace(/[^a-zA-Z ]/g, "").trim();
        if( term === matchedTerm ) {
          termList[i] = HIGHLIGHT_START + termList[i] + HIGHLIGHT_END;
        }
      }
    }

    // turn back into a string
    const markedText = termList.join(' ');
    return markedText;
  }

  phraseMatchFilter(terms,transcriptionType,results) {
      const nextWordRegex = /^[\s]*[\n]*[\w]+/

      // for a given result
      let phraseMatches = []
      for( let result of results ) {
            const { recipeID, folioID } = this.parseIDs( result.ref );
            const recipe = this.recipeBook[transcriptionType][ recipeID ];

            if( recipe ) {
                  const passage = recipe.passages[folioID]
                  const foundTerms = result.matchData.metadata
                  const firstTerm = terms[0]
                  let possiblePhrases = []

                  // first term in possible phrase ranges
                  for( const position of foundTerms[firstTerm].content.position) {
                        const offset = position[0]
                        const range = position[1]
                        const phrase = { offset, range }
                        possiblePhrases.push(phrase)
                  }

                  for( let i=1; i < terms.length && possiblePhrases.length > 0; i++ ) {
                        const term = terms[i] 

                        let nextPhrases = []
                        for( let j=0; j < possiblePhrases.length; j++ ) {
                              const possiblePhrase = possiblePhrases[j]
                              const { offset, range } = possiblePhrase

                              // locate next word in the passage 
                              const remainingRange = passage.substring(offset+range,passage.length)
                              const matches = remainingRange.match(nextWordRegex)
                              const nextWord = matches ? matches[0] : null
                              
                              // if we found another word in this phrase and that word is the term
                              if( nextWord && nextWord.match(term) ) {
                                    // extend this phrase to include this term
                                    possiblePhrase.range = nextWord.length + range
                                    nextPhrases.push(possiblePhrase)
                              }
                        }
                        // these phrases match so far
                        possiblePhrases = nextPhrases
                  }
                  if( possiblePhrases.length > 0 ) {
                        // convert back to result format
                        const foundPhrases = []
                        for( const possiblePhrase of possiblePhrases ) {
                              foundPhrases.push([possiblePhrase.offset,possiblePhrase.range])
                        }                        
                        let phrases = {}
                        phrases[firstTerm] = foundPhrases
                        result.matchData.metadata = phrases
                        phraseMatches.push(result)
                  }                  
            }
      }

      // return the list of results with phrase matches
      return phraseMatches
  }
}

export default SearchIndex;

////

// const MAX_FRAGMENT_LENGTH = 12;
const HIGHLIGHT_START = '<mark>';
const HIGHLIGHT_END = '</mark>';

// function offsetToWordIndex( words, wordOffset ) {
//   var offset = 0;
//   for( let i=0; i < words.length; i++ ) {
//     if( offset === wordOffset ) {
//       return i;
//     }
//     offset = offset + words[i].length + 1;
//   }

//   // word not found
//   return -1;
// }

// function isPunctuation( character ) {
//   return (  character === '.' ||
//             character === '?' ||
//             character === '&' ||
//             character === '!' ||
//             character === ';' ||
//             character === ','     );
// }

// function createFragment( fullText, highlightPosition ) {
//   let contextFragment, checkEllipses;
//   let fragment = fullText.replace(/\n/g, ' ').split(' ');
//   let termIndex = offsetToWordIndex( fragment, highlightPosition[0] );

//   // clip the fragment if the full text is too long too display
//   if( fragment.length > MAX_FRAGMENT_LENGTH ) {

//     // create a range that puts term in center of fragment
//     let fragStart = termIndex-Math.floor(MAX_FRAGMENT_LENGTH/2);
//     let fragEnd = fragStart + MAX_FRAGMENT_LENGTH;

//     // don't go past the ends of the string
//     fragStart = (fragStart < 0) ? 0 : fragStart;
//     fragEnd = (fragEnd > fragment.length) ? fragment.length : fragEnd;

//     // clip fragment and update term offsets
//     fragment = fragment.slice( fragStart, fragEnd );
//     termIndex = termIndex - fragStart;

//     checkEllipses = true;
//   }

//   // highlight the term
//   fragment[termIndex] = HIGHLIGHT_START + fragment[termIndex] + HIGHLIGHT_END;

//   // turn back into a string
//   contextFragment = fragment.join(' ');

//   // add ellipses if needed...
//   let lastLetter = contextFragment[contextFragment.length-1];
//   if( checkEllipses && !isPunctuation(lastLetter) ) {
//     contextFragment = contextFragment.concat('...');
//   }

//   return contextFragment;
// }

// // pull a window of text out of the content to display with the search result
// function createFragments( resultMetadata, fullText ) {
//   let highlightedFragments = [];
//   const keywords = Object.keys(resultMetadata);

//   if( keywords.length === 1 ) {
//     const keyword = keywords[0];
//     let keywordData = resultMetadata[keyword];
//     for( let highlightPosition of keywordData.content.position ) {
//       let fragment = createFragment( fullText, highlightPosition );
//       highlightedFragments.push(fragment);
//     }
//   } else {
//     let words = fullText.replace(/\n/g, ' ').split(' ');
  
//     // if there are multiple keywords, find them together in order
//     let keywordSequence = [], i = 0;
//     for( let keyword of keywords ) {
//       let keywordData = resultMetadata[keyword];
//       let indexArray = [];
//       for( let highlightPosition of keywordData.content.position ) {
//         let idx = offsetToWordIndex( words, highlightPosition );
//         indexArray.push( idx );
//       }
//       keywordSequence[i++] = indexArray;
//     }
//     for( let n=0; n < keywordSequence.length; n++ ) {
//       // find a term for the next keyword that is term position + 1
//       for( let term of keywordSequence[n] ) {
//         // if another keyword follows this one
//         if( keywordSequence.length > n+1 ) {
//           for( let nextTerm of keywordSequence[n+1] ) {
//             if( term+1 === nextTerm ) {
//               // terms n and n+1 are adjacent
//               console.log( `terms found at ${term} and ${nextTerm}`);
//               // TODO convert index back into offset range
//               // let termPosition = wordIndexToOffset( words, term );
//               // let nextTermPosition = wordIndexToOffset( words, nextTerm );
//               // let fragment = createFragment( fullText, termPosition, nextTermPosition );
//               // highlightedFragments.push(fragment);      
//               break;
//             }
//           }  
//         }
//       }
//     }
//   }

//   return [ keywords, highlightedFragments ];
// }
