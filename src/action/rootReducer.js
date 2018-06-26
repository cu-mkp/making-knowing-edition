import ReduxStore from '../model/ReduxStore';
import navigationStateReducer from './navigationStateReducer';
import transcriptionViewActions from './transcriptionViewActions';
import { combineReducers } from 'redux';

export default function createRootReducer() {
    return combineReducers({
        navigationState: navigationStateReducer,
        transcriptionView: ReduxStore.createReducer( transcriptionViewActions )
    });    
};