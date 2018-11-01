var SearchActions = {};

const allowedDirectives=['folioid','name','content'];

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

SearchActions.changeSearchTerm = function changeSearchTerm( state, rawSearchTerm ) {
    return {
        ...state,
        rawSearchTerm
    }
}

SearchActions.beginSearch = function beginSearch( state ) {

    let searchTerm = parseSearchTerm(state.rawSearchTerm);

    let results = {};
    results['tc'] = state.index.searchEdition(searchTerm,'tc');
    results['tcn'] = state.index.searchEdition(searchTerm,'tcn');
    results['tl'] = state.index.searchEdition(searchTerm,'tl');
    results['anno'] = state.index.searchAnnotations(searchTerm);
    
    return {
        ...state,
        term:searchTerm,
        loaded:true,
        results:results
    };
};

SearchActions.clearSearch = function clearSearch( state ) {
    return {
        ...state,
        term:'',
        rawSearchTerm:'',
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

function parseSearchTerm(rawSearchTerm) {
    let searchTerm = rawSearchTerm;

    // Unsanitize spaces
    searchTerm = searchTerm.replace('%20',' ');

    // Check for special directives
    if(searchTerm.split(":").length > 1){
        let directive = searchTerm.split(":")[0];
        if(!allowedDirectives.includes(directive)){
            searchTerm=searchTerm.split(":").slice(1).join(" ");
        }
    }

    return searchTerm;
}

export default SearchActions;