import axios from 'axios';
import { takeEvery, select } from 'redux-saga/effects'

import { putAction } from '../model/ReduxStore';

const justAnnotations = state => state.annotations

function *userNavigation(action) {
    let pathname = action.payload.params[0].pathname;

    // Based on the route, load the required resources.
    switch(pathname) {
        case '/':
            break;
        case '/folios':
            // let existing code handle this for now
            break;
        case '/annotations':
            yield handleAnnotations();
            break;
        default:
    }
}

function *handleAnnotations() {
    const annotations = yield select(justAnnotations)
    if( !annotations.loaded ) {
        let response = yield axios.get(annotations.annotationManifestURL);
        yield putAction( 'AnnotationActions.loadAnnotationManifest', response.data );    
    }
}

export default function *routeListenerSaga() {
    yield takeEvery('RouteListenerSaga.userNavigatation', userNavigation );
}
