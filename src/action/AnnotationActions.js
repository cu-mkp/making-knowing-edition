
var AnnotationActions = {};

AnnotationActions.loadAnnotationManifest = function loadAnnotationManifest( state, annotationManifestData ) {
    let annotations = {};
    
    for( let annotation of annotationManifestData["content"] ) {
        annotations[annotation.id] = {
            ...annotation,
            loaded: false
        };
    }

    return {
        ...state,
        annotations,
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