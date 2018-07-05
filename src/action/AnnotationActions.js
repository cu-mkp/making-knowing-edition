import axios from 'axios';

var AnnotationActions = {};

AnnotationActions.loadAnnotation = function loadAnnotation( state ) {

    axios.get(state.annotationURL)
        .then(function(annotationResponse) {
            state.content = annotationResponse.data;
            state.loaded = true;
        })
        .catch((error) => {
            console.log('error')
        });

    return state;
};

export default AnnotationActions;