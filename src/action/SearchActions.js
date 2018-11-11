var SearchActions = {};

SearchActions.loadSearchIndex = function loadSearchIndex( state, searchIndex ) {
    return {
        ...state,
        index:searchIndex
    }
};

SearchActions.searchMatched = function searchMatched( state, matched ) {
    return {
        ...state,
        matched
    }
};

export default SearchActions;