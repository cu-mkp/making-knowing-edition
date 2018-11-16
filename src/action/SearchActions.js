var SearchActions = {};

SearchActions.loadSearchIndex = function loadSearchIndex( state, searchIndex ) {
    return {
        ...state,
        index:searchIndex
    }
};

SearchActions.searchResults = function searchResults( state, results ) {
    return {
        ...state,
        results
    }
};

export default SearchActions;