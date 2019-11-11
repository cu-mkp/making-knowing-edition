import { combineReducers } from 'redux';

import {createReducer} from '../model/ReduxStore';
import SearchActions from './SearchActions';
import GlossaryActions from './GlossaryActions';
import AnnotationActions from './AnnotationActions';
import EntryActions from './EntryActions';
import DocumentActions from './DocumentActions';
import DiplomaticActions from './DiplomaticActions';
import ContentActions from './ContentActions';

import diplomaticInitialState from './initialState/diplomaticInitialState';
import searchInitialState from './initialState/searchInitialState';
import glossaryInitialState from './initialState/glossaryInitialState';
import annotationInitialState from './initialState/annotationInitialState';
import entryInitialState from './initialState/entryInitialState';
import documentInitialState from './initialState/documentInitialState';
import AuthorActions from './AuthorActions';
import authorInitialState from './initialState/authorInitialState';
import CommentActions from './CommentActions';
import commentInitialState from './initialState/commentInitialState';
import contentInitialState from './initialState/contentInitialState';

export default function rootReducer() {
    return combineReducers({
        diplomatic: createReducer( 'DiplomaticActions', DiplomaticActions, diplomaticInitialState ),
        document: createReducer( 'DocumentActions', DocumentActions, documentInitialState ),
        search: createReducer( 'SearchActions', SearchActions, searchInitialState ),
        glossary: createReducer( 'GlossaryActions', GlossaryActions, glossaryInitialState ),
        annotations: createReducer( 'AnnotationActions', AnnotationActions, annotationInitialState ),
        entries: createReducer( 'EntryActions', EntryActions, entryInitialState ),
        authors: createReducer( 'AuthorActions', AuthorActions, authorInitialState ),
        comments: createReducer( 'CommentActions', CommentActions, commentInitialState ),
        contents: createReducer( 'ContentActions', ContentActions, contentInitialState )
    });    
};
