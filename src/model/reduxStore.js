import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import createRootReducer from '../action/rootReducer';
import initialState from '../action/initialState';

var ReduxStore = {};

// Call this once to create a new redux store that is properly configured.
ReduxStore.create = function() {
  return createStore(
    createRootReducer(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk)
  );
};

// Dispatch the action with the given parameters.
ReduxStore.dispatchAction = function( props, action, ...params ) {
  props.dispatch( { type: action, payload: { params: params } } );
};

// Take the action and call it with the current redux state. 
ReduxStore.reducer = function( state, action ) {
  let params = (action.payload && action.payload.params) ? action.payload.params : [];
  return action.type( state, ...params );
};

// Create a reducer that only services actions in the action set.
ReduxStore.createReducer = function( actionSet ) {
  var actionNames = Object.keys(actionSet);

  function scopedReducer(state=initialState, action, validActions=actionNames) {
    if( validActions.includes(action.type.name) ) {
      return ReduxStore.reducer( state, action );
    } else {
      return { ...state }; 
    }
  };
  
  return scopedReducer;
}

export default ReduxStore;