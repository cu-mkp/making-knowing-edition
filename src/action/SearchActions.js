var SearchActions = {};

// case UPDATE_SEARCH_INDEX:
SearchActions.updateSearchIndex = function updateSearchIndex( state, searchIndex ) {
    return {
        ...state,
        search:{
            ...state.search,
            index:searchIndex
        }
    }
};

// case ENTER_SEARCH_MODE:
SearchActions.enterSearchMode = function enterSearchMode( state, searchTerm ) {
    let results = {};
    results['tc'] = state.search.index.searchEdition(searchTerm,'tc');
    results['tcn'] = state.search.index.searchEdition(searchTerm,'tcn');
    results['tl'] = state.search.index.searchEdition(searchTerm,'tl');
    
    return {
        ...state,
        linkedMode: false,
        bookMode: false,
        search:{
            ...state.search,
            term:searchTerm,
            inSearchMode:true,
            results:results
        },
    
        left: {
            ...state.left,
            viewType: 'SearchResultView'
        },
    
        right:{
            ...state.right,
            isGridMode: false,
            viewType: 'TranscriptionView',
            transcriptionType: 'tc',
            transcriptionTypeLabel: 'Transcription',
            currentFolioName: '',
            currentFolioID: '-1',
            currentFolioShortID: '',
            hasPrevious: false,
            hasNext: false,
            nextFolioShortID: '',
            previousFolioShortID: ''
        }
    }
};

// case EXIT_SEARCH_MODE:
SearchActions.exitSearchMode = function exitSearchMode( state ) {
    // If we have a folio selected in search results, match the left pane
    // otherwise just clear and gridview
    let leftState;
    if(parseInt(state.right.currentFolioID,10) === -1){
            leftState = {
                ...state.left,
                viewType: 'ImageGridView',
                currentFolioName: '',
                currentFolioID: '',
                currentFolioShortID: '',
                hasPrevious: false,
                hasNext: false,
                nextFolioShortID: '',
                previousFolioShortID: ''
            };
        }else{
            leftState = {
                ...state.right,
                viewType: 'ImageView'
            };
    }

    return {
        ...state,
        linkedMode: true,
        search:{
            ...state.search,
            term:'',
            inSearchMode:false,
            results:''
        },

        left: leftState,

        right:{
            ...state.right,
        }
    }
};

// case HIDE_SEARCH_TYPE:
SearchActions.searchTypeHidden = function searchTypeHidden( state, type, value ) {
    if(type === 'tc'){
        return {
            ...state,
            search:{
                ...state.search,
                typeHidden:{
                    ...state.search.typeHidden,
                    tc:value
                }
            }
        }
    }else if(type === 'tcn'){
        return {
            ...state,
            search:{
                ...state.search,
                typeHidden:{
                    ...state.search.typeHidden,
                    tcn:value
                }
            }
        }
    }else if(type === 'tl'){
        return {
            ...state,
            search:{
                ...state.search,
                typeHidden:{
                    ...state.search.typeHidden,
                    tl:value
                }
            }
        }
    }
    return state;
}

// case CACHE_SEARCH_RESULTS:
SearchActions.cacheSearchResults = function cacheSearchResults( state, results ) {
    return{
        ...state,
        search:{
            ...state.search,
            results:results
        }
    }
};

export default SearchActions;