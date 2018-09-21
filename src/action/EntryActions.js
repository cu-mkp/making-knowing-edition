
var EntryActions = {};

EntryActions.loadEntryManifest = function loadEntryManifest( state, entryManifestData ) {
    let entries = {};
    
    for( let entry of entryManifestData["content"] ) {
        entries[entry.id] = {
            ...annotation,
            loaded: false
        };
    }

    return {
        ...state,
        entries,
        loaded: true
    };
};

export default EntryActions;