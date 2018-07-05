import { combineReducers } from 'redux';

import {createReducer} from '../model/ReduxStore';
import DocumentViewActions from './DocumentViewActions';
import SearchActions from './SearchActions';
import GlossaryActions from './GlossaryActions';
import AnnotationActions from './AnnotationActions';
import DocumentActions from './DocumentActions';

import documentViewInitialState from './initialState/documentViewInitialState';
import searchInitialState from './initialState/searchInitialState';
import glossaryInitialState from './initialState/glossaryInitialState';
import annotationInitialState from './initialState/annotationInitialState';
import documentInitialState from './initialState/documentInitialState';

export default function rootReducer() {
    return combineReducers({
        document: createReducer( 'DocumentActions', DocumentActions, documentInitialState ),
        documentView: createReducer( 'DocumentViewActions', DocumentViewActions, documentViewInitialState ),
        search: createReducer( 'SearchActions', SearchActions, searchInitialState ),
        glossary: createReducer( 'GlossaryActions', GlossaryActions, glossaryInitialState ),
        annotations: createReducer( 'AnnotationActions', AnnotationActions, annotationInitialState )
    });    
};
