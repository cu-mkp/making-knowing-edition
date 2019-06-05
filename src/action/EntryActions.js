
var EntryActions = {};

EntryActions.loadEntryManifest = function loadEntryManifest( state, entries ) {  

    let entryList = [];
    for( let entry of entries ) {
        if( entry.heading_tcn !== '' && entry.heading_tl !== '') {
            const displayHeading = `${entry.heading_tcn} / ${entry.heading_tl}`.replace(/[@+]/g,'');
            entryList.push( { ...entry, displayHeading });
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