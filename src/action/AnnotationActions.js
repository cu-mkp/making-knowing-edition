import axios from 'axios';
import { dispatchAction } from '../model/ReduxStore';

var AnnotationActions = {};

AnnotationActions.requestAnnotation = function requestAnnotation( state, dispatcher ) {
    axios.get(state.annotationURL)
        .then(function(annotationResponse) {
            dispatchAction( dispatcher, 'AnnotationActions.loadAnnotation', annotationResponse.data );
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