import ReduxStore from '../model/ReduxStore';
// import navigationStateReducer from './navigationStateReducer';
import DocumentViewActions from './documentViewActions';
import { combineReducers } from 'redux';

export default function createRootReducer() {
    return combineReducers({
        // navigationState: navigationStateReducer,
        // documentView: ReduxStore.createReducer( documentViewActions )
        navigationState: ReduxStore.createReducer( DocumentViewActions )
    });    
};
