
var ContentActions = {};

ContentActions.loadMenuStructure = function loadMenuStructure( state, menuStructure ) {
    return {
        ...state,
        menuStructure,
        loaded: true
    }
};

ContentActions.loadContent = function loadContent( state, contentID, contentData ) {
    let newState =  { ...state };
    newState.contents[contentID] = ( contentData ) ? contentData : 404;
    return newState;
};

export default ContentActions;