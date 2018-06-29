var SearchActions = {};

// case UPDATE_SEARCH_INDEX:
SearchActions.updateSearchIndex = function updateSearchIndex( state, searchIndex ) {
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

SearchActions.beginSearch = function beginSearch( state, searchTerm ) {
    let results = {};
    results['tc'] = state.index.searchEdition(searchTerm,'tc');
    results['tcn'] = state.index.searchEdition(searchTerm,'tcn');
    results['tl'] = state.index.searchEdition(searchTerm,'tl');
    
    return {
        ...state,
        term:searchTerm,
        results:results
    };
};

SearchActions.clearSearch = function clearSearch( state ) {
    return {
        ...state,
        term:'',
        results:''
    };
};

// case HIDE_SEARCH_TYPE:
SearchActions.searchTypeHidden = function searchTypeHidden( state, type, value ) {
    if(type === 'tc'){
        return {
            ...state,
            typeHidden:{
                ...state.typeHidden,
                tc:value
            }
        }
    }else if(type === 'tcn'){
        return {
            ...state,
            typeHidden:{
                ...state.typeHidden,
                tcn:value
            }
        }
    }else if(type === 'tl'){
        return {
            ...state,
            typeHidden:{
                ...state.typeHidden,
                tl:value
            }
        }
    }
    return state;
}

// case CACHE_SEARCH_RESULTS:
SearchActions.cacheSearchResults = function cacheSearchResults( state, results ) {
    return{
        ...state,
        results:results
    }
};

export default SearchActions;