import Annotation from '../model/Annotation';

var AnnotationActions = {};

AnnotationActions.loadAnnotation = function loadAnnotation( state ) {
    let annotation = new Annotation();
    annotation.load();
    return {
        ...state,
        annotation: annotation
    };
};

export default AnnotationActions;