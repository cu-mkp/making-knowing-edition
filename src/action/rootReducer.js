import { combineReducers } from 'redux';

import ReduxStore from '../model/ReduxStore';
import DocumentViewActions from './DocumentViewActions';
import SearchActions from './SearchActions';

export default function createRootReducer() {
    return combineReducers({
        search: ReduxStore.createReducer( SearchActions ),
        navigationState: ReduxStore.createReducer( DocumentViewActions )
    });    
};
