import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import rootReducer from '../action/rootReducer';

// Call this once to create a new redux store that is properly configured.
export function createReduxStore() {
  return createStore(
    rootReducer(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk)
  );
};

// Dispatch the action with the given parameters.
export function dispatchAction( props, action, ...params ) {
  props.dispatch( { type: action, payload: { params: params } } );
};

// Take the action and call it with the current redux state. 
function reducer( state, action ) {
  let params = (action.payload && action.payload.params) ? action.payload.params : [];
  return action.type( state, ...params );
};

// Create a reducer that only services actions in the action set.
export function createReducer( actionSet, initialState ) {
  var actionNames = Object.keys(actionSet);

  function scopedReducer(state=initialState, action, validActions=actionNames) {
    if( validActions.includes(action.type.name) ) {
      return reducer( state, action );
    } else {
      return { ...state }; 
    }
  };
  
  return scopedReducer;
}