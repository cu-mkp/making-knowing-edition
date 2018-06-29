import { combineReducers } from 'redux';

import {createReducer} from '../model/ReduxStore';
import DocumentViewActions from './DocumentViewActions';
import SearchActions from './SearchActions';
import GlossaryActions from './GlossaryActions';

import navigationInitialState from './initialState/navigationInitialState';
import searchInitialState from './initialState/searchInitialState';
import glossaryInitialState from './initialState/glossaryInitialState';

export default function rootReducer() {
    return combineReducers({
        navigationState: createReducer( DocumentViewActions, navigationInitialState ),
        search: createReducer( SearchActions, searchInitialState ),
        glossary: createReducer( GlossaryActions, glossaryInitialState )
    });    
};
