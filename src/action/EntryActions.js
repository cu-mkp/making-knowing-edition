
var EntryActions = {};

EntryActions.loadEntryManifest = function loadEntryManifest( state, entries ) {   
    return {
        ...state,
        entries,
        loaded: true
    };
};

export default EntryActions;