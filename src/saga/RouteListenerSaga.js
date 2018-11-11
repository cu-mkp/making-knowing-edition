import axios from 'axios';
import { takeEvery, select } from 'redux-saga/effects'

import SearchIndex from '../model/SearchIndex';

import { putResolveAction } from '../model/ReduxStore';

const justAnnotations = state => state.annotations
const justEntries = state => state.entries
const juxtDocument = state => state.document
const justSearch = state => state.search

function *userNavigation(action) {
    const pathname = action.payload.params[0].pathname;
    const pathSegments = pathname.split('/');

    if( pathSegments.length > 1 ) {
        switch(pathSegments[1]) {
            case 'folios':
                yield resolveDocumentManifest();
                break;
            case 'search':
                yield resolveAnnotationManifest();
                yield resolveDocumentManifest();
                yield resolveSearchIndex();
                if( pathSegments.length > 3 ) {
                    if( 'annotation' === pathSegments[2] ) {
                        let annotationID = pathSegments[3];
                        yield resolveAnnotation(annotationID);    
                    }
                }
                break;
            case 'annotations':
                yield resolveAnnotationManifest();
                if( pathSegments.length > 2 ) {
                    let annotationID = pathSegments[2];
                    yield resolveAnnotation(annotationID);
                }
                break;
            case 'entries':
                yield resolveEntryManifest();
                break;
            default:
        }    
    }
}

function *resolveDocumentManifest() {
    const document = yield select(juxtDocument)
    if( !document.loaded ) {
        const response = yield axios.get(document.manifestURL)
        yield putResolveAction( 'DocumentActions.loadDocument', response.data );    
    }
}

function *resolveSearchIndex() {
    const search = yield select(justSearch)
    if( !search.index ) {
        let searchIndex = new SearchIndex();
        searchIndex = yield searchIndex.load();
        yield putResolveAction( 'SearchActions.loadSearchIndex', searchIndex );    
    }
}

function *resolveAnnotationManifest() {
    const annotations = yield select(justAnnotations)
    if( !annotations.loaded ) {
        const response = yield axios.get(annotations.annotationManifestURL);
        yield putResolveAction( 'AnnotationActions.loadAnnotationManifest', response.data );    
    }
}

function *resolveEntryManifest() {
    const entries = yield select(justEntries)
    if( !entries.loaded ) {
        const response = yield axios.get(entries.entryManifestURL);
        yield putResolveAction( 'EntryActions.loadEntryManifest', response.data );    
    }
}

function *resolveAnnotation(annotationID) {
    const annotations = yield select(justAnnotations)
    const annotation = annotations.annotations[annotationID];
    if( !annotation.loaded ) {
        const response = yield axios.get(annotation.contentURL);
        yield putResolveAction( 'AnnotationActions.loadAnnotation', annotationID, response.data );        
    }
}

export default function *routeListenerSaga() {
    yield takeEvery('RouteListenerSaga.userNavigatation', userNavigation );
}
