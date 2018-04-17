import axios from 'axios';
import lunr from 'lunr';

class SearchIndex {

	constructor() {
    this.searchIndexURL = process.env.REACT_APP_ENGLISH_SEARCH_INDEX;
    this.recipeBookURL = process.env.REACT_APP_RECIPE_BOOK;
    this.searchIndex = null;
    this.recipeBook = null;
		this.loaded = false;
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
						axios.get(this.searchIndexURL),
						axios.get(this.recipeBookURL)
					])
					.then(axios.spread(function(searchIndexResponse, recipeBookResponse) {
            this.searchIndex = lunr.Index.load(searchIndexResponse.data);
            this.recipeBook = recipeBookResponse.data;
            this.loaded = true;
            resolve(this);
					}.bind(this)))
					.catch((error) => {
						reject(error);
					});
			}.bind(this));
		}
	}

  searchEdition( searchTerm ) {
    let results = this.searchIndex.search(searchTerm);
    let recipes = [];

    for( let result of results ) {
      let recipe = this.recipeBook[ result.ref ];
      let fragments = createFragments( result.matchData.metadata, recipe.content )
      recipes.push( { name: recipe.name, folio: recipe.folioID, contextFragments: fragments } );
    }

    return recipes;
  }

}

export default SearchIndex;

////

const MAX_FRAGMENT_LENGTH = 12;
const HIGHLIGHT_START = '<span class="highlight">';
const HIGHLIGHT_END = '</span>';

function offsetToWordIndex( words, wordOffset ) {
  var offset = 0;
  for( let i=0; i < words.length; i++ ) {
    if( offset === wordOffset ) {
      return i;
    }
    offset = offset + words[i].length + 1;
  }

  // word not found
  return -1;
}

function isPunctuation( character ) {
  return (  character === '.' ||
            character === '?' ||
            character === '&' ||
            character === '!' ||
            character === ';' ||
            character === ','     );
}

function createFragment( fullText, highlightPosition ) {
  let contextFragment, checkEllipses;
  let fragment = fullText.replace('\n', ' ').split(' ');
  let termIndex = offsetToWordIndex( fragment, highlightPosition[0] );

  // clip the fragment if the full text is too long too display
  if( fragment.length > MAX_FRAGMENT_LENGTH ) {

    // create a range that puts term in center of fragment
    let fragStart = termIndex-Math.floor(MAX_FRAGMENT_LENGTH/2);
    let fragEnd = fragStart + MAX_FRAGMENT_LENGTH;

    // don't go past the ends of the string
    fragStart = (fragStart < 0) ? 0 : fragStart;
    fragEnd = (fragEnd > fragment.length) ? fragment.length : fragEnd;

    // clip fragment and update term offsets
    fragment = fragment.slice( fragStart, fragEnd );
    termIndex = termIndex - fragStart;

    checkEllipses = true;
  }

  // highlight the term
  fragment[termIndex] = HIGHLIGHT_START + fragment[termIndex] + HIGHLIGHT_END;

  // turn back into a string
  contextFragment = fragment.join(' ');

  // add ellipses if needed...
  let lastLetter = contextFragment[contextFragment.length-1];
  if( checkEllipses && !isPunctuation(lastLetter) ) {
    contextFragment = contextFragment.concat('...');
  }

  return contextFragment;
}

// pull a window of text out of the content to display with the search result
function createFragments( resultMetadata, fullText ) {
  let highlightedFragments = [];

  for( let keyword of Object.keys(resultMetadata) ) {
    let keywordData = resultMetadata[keyword];
    for( let highlightPosition of keywordData.content.position ) {
      let fragment = createFragment( fullText, highlightPosition );
      highlightedFragments.push(fragment);
    }
  }

  return highlightedFragments;
}
