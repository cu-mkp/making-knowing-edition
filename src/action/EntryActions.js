
var EntryActions = {};

EntryActions.toggleFilter = function toggleFilter( state, filterID, filterType ) {  
    const { filterTags, filterCategories, entries } = state

    let nextFilter, filterIndex
    if( filterType === 'tags') {
        nextFilter = [ ...filterTags ]
        filterIndex = filterTags.indexOf(filterID)
    } else {
        nextFilter = [ ...filterCategories ]
        filterIndex = filterCategories.indexOf(filterID)
    }
 
    if( filterIndex === -1 ) {
        nextFilter.push(filterID)
    } else {
        nextFilter.splice(filterIndex,1)
    }

    if( filterType === 'tags' ) {
        const entryList = reloadEntryList( entries, nextFilter, filterCategories )
        return {
            ...state,
            entryList,
            filterTags: nextFilter
        }
    } else {
        const entryList = reloadEntryList( entries, filterTags, nextFilter )
        return {
            ...state,
            entryList,
            filterCategories: nextFilter
        }
    }    
}

EntryActions.loadEntryManifest = function loadEntryManifest( state, entries ) {  
    const entryList = reloadEntryList( entries, state.filterTags, state.filterCategories )

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
        if( !mentions[tagID] || parseInt(mentions[tagID],10) === 0 ) {
            return false
        }
    }    

    // all terms found
    return true
}

function matchFilterCategories( categories, filterCategories ) {
    // filter isn't active, allow all
    if( filterCategories.length === 0 ) return true

    for( let categoryName of filterCategories ) {
        if( !categories.includes(categoryName) ) {
            return false
        }
    }    

    // all terms found
    return true
}


function reloadEntryList( entries, filterTags, filterCategories ) {
    let entryList = [];
    for( let entry of entries ) {
        if( entry.heading_tcn !== '' && entry.heading_tl !== '') {
            if( matchFilterTags( entry.mentions, filterTags ) && matchFilterCategories( entry.categories, filterCategories ) ) {
                const displayHeading = `${entry.heading_tl} / ${entry.heading_tcn}`.replace(/[@+]/g,'');
                entryList.push( { ...entry, displayHeading });    
            }
        }
    }
    return entryList
}

export default EntryActions;