import { combineReducers } from 'redux';

import {createReducer} from '../model/ReduxStore';
import DocumentViewActions from './DocumentViewActions';
import SearchActions from './SearchActions';
import GlossaryActions from './GlossaryActions';
import AnnotationActions from './AnnotationActions';

import navigationInitialState from './initialState/navigationInitialState';
import searchInitialState from './initialState/searchInitialState';
import glossaryInitialState from './initialState/glossaryInitialState';
import annotationInitialState from './initialState/annotationInitialState';

export default function rootReducer() {
    return combineReducers({
        navigationState: createReducer( 'DocumentViewActions', DocumentViewActions, navigationInitialState ),
        search: createReducer( 'SearchActions', SearchActions, searchInitialState ),
        glossary: createReducer( 'GlossaryActions', GlossaryActions, glossaryInitialState ),
        annotations: createReducer( 'AnnotationActions', AnnotationActions, annotationInitialState )
    });    
};
