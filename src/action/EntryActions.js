
var EntryActions = {};

EntryActions.loadEntryManifest = function loadEntryManifest( state, entries ) {  

    let entryList = [];
    for( let entry of entries ) {
        if( entry.heading_tcn !== '' && entry.heading_tl !== '') {
            entryList.push( entry );
        }
    }

    return {
        ...state,
        entries,
        entryList,
        loaded: true
    };
};

export default EntryActions;