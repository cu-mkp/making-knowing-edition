import { combineReducers } from 'redux';

import {createReducer} from '../model/ReduxStore';
import DocumentViewActions from './DocumentViewActions';
import SearchActions from './SearchActions';
import GlossaryActions from './GlossaryActions';
import AnnotationActions from './AnnotationActions';
import EntryActions from './EntryActions';
import DocumentActions from './DocumentActions';
import DiplomaticActions from './DiplomaticActions';

import diplomaticInitialState from './initialState/diplomaticInitialState';
import documentViewInitialState from './initialState/documentViewInitialState';
import searchInitialState from './initialState/searchInitialState';
import glossaryInitialState from './initialState/glossaryInitialState';
import annotationInitialState from './initialState/annotationInitialState';
import entryInitialState from './initialState/entryInitialState';
import documentInitialState from './initialState/documentInitialState';

export default function rootReducer() {
    return combineReducers({
        diplomatic: createReducer( 'DiplomaticActions', DiplomaticActions, diplomaticInitialState ),
        document: createReducer( 'DocumentActions', DocumentActions, documentInitialState ),
        documentView: createReducer( 'DocumentViewActions', DocumentViewActions, documentViewInitialState ),
        search: createReducer( 'SearchActions', SearchActions, searchInitialState ),
        glossary: createReducer( 'GlossaryActions', GlossaryActions, glossaryInitialState ),
        annotations: createReducer( 'AnnotationActions', AnnotationActions, annotationInitialState ),
        entries: createReducer( 'EntryActions', EntryActions, entryInitialState )
    });    
};
