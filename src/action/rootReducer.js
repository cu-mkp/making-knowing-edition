import { combineReducers } from 'redux';

import {createReducer} from '../model/ReduxStore';
import DocumentViewActions from './DocumentViewActions';
import navigationInitialState from './navigationInitialState';
import SearchActions from './SearchActions';
import searchInitialState from './searchInitialState';
import GlossaryActions from './GlossaryActions';
import glossaryInitialState from './glossaryInitialState';

export default function rootReducer() {
    return combineReducers({
        navigationState: createReducer( DocumentViewActions, navigationInitialState ),
        search: createReducer( SearchActions, searchInitialState ),
        glossary: createReducer( GlossaryActions, glossaryInitialState )
    });    
};
