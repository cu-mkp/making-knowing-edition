
var EntryActions = {};

EntryActions.toggleFilter = function toggleFilter( state, filterTagID ) {  
    const { filterTags, entries } = state
    let nextFilterTags = [ ...filterTags ]

    let tagIndex = filterTags.indexOf(filterTagID)
    if( tagIndex === -1 ) {
        nextFilterTags.push(filterTagID)
    } else {
        nextFilterTags.splice(tagIndex,1)
    }

    const entryList = reloadEntryList( entries, nextFilterTags )

    return {
        ...state,
        entryList,
        filterTags: nextFilterTags
    }
}

EntryActions.setSortType = function setSortType( state, sortType ) {  
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

function matchFilterTags( mentions, filterTags ) {
    // filter isn't active, allow all
    if( filterTags.length === 0 ) return true

    for( let tagID of filterTags ) {
        if( !mentions[tagID] || parseInt(mentions[tagID]) === 0 ) {
            return false
        }
    }    

    // all terms found
    return true
}

function reloadEntryList( entries, filterTags ) {
    let entryList = [];
    for( let entry of entries ) {
        if( entry.heading_tcn !== '' && entry.heading_tl !== '') {
            if( matchFilterTags( entry.mentions, filterTags ) ) {
                const displayHeading = `${entry.heading_tcn} / ${entry.heading_tl}`.replace(/[@+]/g,'');
                entryList.push( { ...entry, displayHeading });    
            }
        }
    }
    return entryList
}

export default EntryActions;