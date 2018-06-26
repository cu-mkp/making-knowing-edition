import ReduxStore from '../model/ReduxStore';
import navigationStateReducer from './navigationStateReducer';
import { combineReducers } from 'redux';

export default function createRootReducer() {
    return combineReducers({
        navigationState: navigationStateReducer,
        folioReducer: ReduxStore.reducer
    });    
};