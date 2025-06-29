
var AnnotationActions = {};

AnnotationActions.loadAnnotationManifest = function loadAnnotationManifest( state, annotationManifestData ) {
    let annotations = {};
    let annotationList = annotationManifestData["content"]
    let annotationsByEntry = {};

    for( let annotation of annotationList ) {
        if( annotations[annotation.id] ) {
            console.log('ERROR, duplicate annotation id: '+annotation.id)
        }
        annotations[annotation.id] = {
            ...annotation,
            loaded: false
        };
        // also index the annotations by entry ID
        let entryIDs = annotation.entryIDs.split('; ');
        for( let entryID of entryIDs ) {
            if( !annotationsByEntry[entryID] ) {
                annotationsByEntry[entryID] = [];
            }
            annotationsByEntry[entryID].push(annotation.id);
        }
    }

    // organize the annotations into sections
    let sections = {}
    for( let annotation of annotationList ) {
        if( !sections[annotation.theme] ) {
            sections[annotation.theme] = { name: annotation.theme, annotations: [ annotation ] }
        } else {
            sections[annotation.theme].annotations.push( annotation )
        }
    }
    
    // sort the sections and the annotations in each section
    let annotationSections = Object.values(sections).sort(alphaSort);
    let i = 0
    for( let section of annotationSections ) {
        section.id = `section-${i++}`
        section.annotations = section.annotations.sort(displayOrderSort);
    }

    return {
        ...state,
        annotations,
        annotationsByEntry,
        annotationSections,
        loaded: true
    };
};

AnnotationActions.loadAnnotation = function loadAnnotation( state, annotationID, annotationData ) {
    let newState =  { ...state };
    newState.annotations[annotationID].content = annotationData;
    newState.annotations[annotationID].loaded = true;
    return newState;
};

const alphaSort = function(a, b) {
    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    
    // names must be equal
    return 0;
}

const displayOrderSort = function(a, b) {
    var ordA = +a.displayOrder
    var ordB = +b.displayOrder
    if (ordA < ordB) {
        return -1;
    }
    if (ordA > ordB) {
        return 1;
    }
    
    // same ord
    return 0;
}

export default AnnotationActions;