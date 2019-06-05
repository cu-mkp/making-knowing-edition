
var EntryActions = {};

EntryActions.toggleFilter = function loadEntryManifest( state, filterTag ) {  
    // add/remove a unique filter tag to the filter list and reload the entry list
}

EntryActions.setSortType = function loadEntryManifest( state, sortType ) {  
    // update sort type and reload entry list
}

EntryActions.loadEntryManifest = function loadEntryManifest( state, entries ) {  

    const entryList = reloadEntryList( entries, state.filterTags )

    return {
        ...state,
        entries,
        entryList,
        loaded: true
    };
};

function reloadEntryList( entries, filterTags ) {
    let entryList = [];
    for( let entry of entries ) {
        if( entry.heading_tcn !== '' && entry.heading_tl !== '') {
            const displayHeading = `${entry.heading_tcn} / ${entry.heading_tl}`.replace(/[@+]/g,'');
            entryList.push( { ...entry, displayHeading });
        }
    }
    return entryList
}

export default EntryActions;