var SearchActions = {};

SearchActions.loadSearchIndex = function loadSearchIndex( state, searchIndex ) {
    return {
        ...state,
        index:searchIndex
    }
};

SearchActions.searchResults = function searchMatched( state, results ) {
    return {
        ...state,
        results
    }
};

SearchActions.searchMatched = function searchMatched( state, matched ) {
    return {
        ...state,
        matched
    }
};

export default SearchActions;