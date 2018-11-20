
var AnnotationActions = {};

AnnotationActions.loadAnnotationManifest = function loadAnnotationManifest( state, annotationManifestData ) {
    let annotations = {};
    let annotationsByEntry = {};
    
    for( let annotation of annotationManifestData["content"] ) {
        annotations[annotation.id] = {
            ...annotation,
            loaded: false
        };
        // also index the annotations by entry ID
        let entryIDs = annotation.entryIDs.split(';');
        for( let entryID of entryIDs ) {
            if( !annotationsByEntry[entryID] ) {
                annotationsByEntry[entryID] = [];
            }
            annotationsByEntry[entryID].push(annotation.id);
        }
    }

    return {
        ...state,
        annotations,
        annotationsByEntry,
        loaded: true
    };
};

AnnotationActions.loadAnnotation = function loadAnnotation( state, annotationID, annotationData ) {
    let newState =  { ...state };
    newState.annotations[annotationID].content = annotationData;
    newState.annotations[annotationID].loaded = true;
    return newState;
};

export default AnnotationActions;