import {combineReducers} from 'redux';
import navigationState from './navigationStateReducer';

const rootReducer = combineReducers({
  navigationState
});

export default rootReducer;
