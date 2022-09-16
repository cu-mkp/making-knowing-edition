import axios from 'axios';
import { takeEvery, select } from 'redux-saga/effects'

import SearchIndex from '../model/SearchIndex';

import { putResolveAction } from '../model/ReduxStore';

const justAnnotations = state => state.annotations
const justEntries = state => state.entries
const juxtDocument = state => state.document
const justSearch = state => state.search
const justAuthors = state => state.authors
const justGlossary = state => state.glossary
const justComments = state => state.comments
const justContents = state => state.contents

function *userNavigation(action) {
    yield resolveMenuStructure();

    const pathname = action.payload.params[0].pathname;
    const pathSegments = pathname.split('/');
    if( pathname === '/' ) {
        if (process?.env?.REACT_APP_ESSAYS_ENABLED !== "false") {
            yield resolveAuthors();
            yield resolveAnnotationManifest();
        }
        if (process?.env?.REACT_APP_MANUSCRIPT_ENABLED !== "false") {
            yield resolveComments();
        }
    }
    if( pathSegments.length > 1 ) {
        switch(pathSegments[1]) {
            case 'content':
                if( pathSegments.length > 2 ) {
                    const contentPath = pathSegments.slice(2)
                    let contentID = contentPath.join('/');
                    yield resolveContent(contentID);
                }
                break;
            case 'folios':
                yield resolveAuthors();
                yield resolveComments();
                yield resolveAnnotationManifest();
                yield resolveDocumentManifest();
                yield resolveGlossary();
                break;
            case 'search':
                yield resolveAuthors();
                yield resolveComments();
                yield resolveAnnotationManifest();
                yield resolveDocumentManifest();
                yield resolveSearchIndex();
                if( pathSegments.length > 3 ) {
                    if( 'annotation' === pathSegments[2] ) {
                        let annotationID = pathSegments[3];
                        yield resolveAnnotation(annotationID);
                    }
                }
                yield resolveSearchResult();
                break;
            case 'essays':
                yield resolveAuthors();
                yield resolveComments();
                yield resolveAnnotationManifest();
                if( pathSegments.length > 2 ) {
                    let annotationID = pathSegments[2];
                    yield resolveAnnotation(annotationID);
                }
                break;
            case 'entries':
                yield resolveAnnotationManifest();
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

function *resolveSearchResult() {
    const search = yield select(justSearch)
    const searchIndex = search.index;
    const searchQuery = decodeURI(window.location.href.split("q=")[1]);

    if( !searchIndex || !searchQuery ) {
        yield putResolveAction( 'SearchActions.searchResults', null );    
    }

    let results = {};
    results.searchQuery = searchQuery;
    results['tc'] = searchIndex.searchEdition(searchQuery,'tc');
    results['tcn'] = searchIndex.searchEdition(searchQuery,'tcn');
    results['tl'] = searchIndex.searchEdition(searchQuery,'tl');
    results['anno'] = (process.env.REACT_APP_HIDE_IN_PROGRESS_FEATURES!=='true') ? searchIndex.searchAnnotations(searchQuery) : [];
    yield putResolveAction( 'SearchActions.searchResults', results );
}

function *resolveAnnotationManifest() {
    const annotations = yield select(justAnnotations)
    if( !annotations.loaded ) {
        try {
            const response = yield axios.get(annotations.annotationManifestURL);
            yield putResolveAction( 'AnnotationActions.loadAnnotationManifest', response.data );
        } catch (e) {
            // do nothing
        }
    }
}

function *resolveMenuStructure() {
    const contents = yield select(justContents)
    if( !contents.loaded ) {
        try {
            const response = yield axios.get(contents.menuStructureURL);
            yield putResolveAction( 'ContentActions.loadMenuStructure', response.data );
        } catch (e) {
            // do nothing
        }
    }
}

function *resolveAuthors() {
    const authors = yield select(justAuthors)
    if( !authors.loaded ) {
        try {
            const response = yield axios.get(authors.authorsURL);
            yield putResolveAction( 'AuthorActions.loadAuthors', response.data );
        } catch (e) {
            // do nothing
        }
    }
}

function *resolveGlossary() {
    const glossary = yield select(justGlossary)
    if( !glossary.loaded ) {
        try {
            const response = yield axios.get(glossary.glossaryURL);
            yield putResolveAction( 'GlossaryActions.loadGlossary', response.data );
        } catch (e) {
            // do nothing
        }
    }
}

function *resolveComments() {
    const comments = yield select(justComments)
    if( !comments.loaded ) {
        try {
            const response = yield axios.get(comments.commentsURL);
            yield putResolveAction( 'CommentActions.loadComments', response.data );
        } catch (e) {
            // do nothing
        }
    }
}

function *resolveEntryManifest() {
    const entries = yield select(justEntries)
    if( !entries.loaded ) {
        try {
            const response = yield axios.get(entries.entryManifestURL);
            yield putResolveAction( 'EntryActions.loadEntryManifest', response.data );
        } catch (e) {
            // do nothing
        }
    }
}

function *resolveContent(contentID) {
    const contents = yield select(justContents);
    const content = contents.contents[contentID];
    if( !content ) {
        try {
            const contentURL = `${contents.contentBaseURL}/${contentID}.html`
            const response = yield axios.get(contentURL);
            yield putResolveAction( 'ContentActions.loadContent', contentID, response.data );
        } catch(e) {
            // do nothing
        }
    }
}

function *resolveAnnotation(annotationID) {
    const annotations = yield select(justAnnotations)
    const annotation = annotations.annotations[annotationID];
    if( !annotation.loaded ) {
        try {
            const response = yield axios.get(annotation.contentURL);
            yield putResolveAction( 'AnnotationActions.loadAnnotation', annotationID, response.data );
        } catch(e) {
            // do nothing
        }
    }
}

export default function *routeListenerSaga() {
    yield takeEvery('RouteListenerSaga.userNavigatation', userNavigation );
}
