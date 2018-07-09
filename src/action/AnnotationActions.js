import axios from 'axios';
import { dispatchAction } from '../model/ReduxStore';

var AnnotationActions = {};

AnnotationActions.requestAnnotationManifest = function requestAnnotationManifest( state, annotationManifestURL, dispatcher ) {
    axios.get(annotationManifestURL)
        .then(function(response) {
            dispatchAction( dispatcher, 'AnnotationActions.loadAnnotationManifest', response.data );
        })
        .catch((error) => {
            console.log(error)
        });

    return {
        ...state,
        annotationManifestURL    
    };
};

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


AnnotationActions.requestAnnotation = function requestAnnotation( state, annotationID, dispatcher ) {
    axios.get(state.annotations[annotationID].contentURL)
        .then(function(response) {
            dispatchAction( dispatcher, 'AnnotationActions.loadAnnotation', response.data );
        })
        .catch((error) => {
            console.log(error)
        });
    
    return state;
};

AnnotationActions.loadAnnotation = function loadAnnotation( state, annotationData ) {
    return {
        ...state,
        content: annotationData,
        loaded: true
    };
};

export default AnnotationActions;