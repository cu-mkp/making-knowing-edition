import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import createRootReducer from '../action/rootReducer';
import initialState from '../action/initialState';

var ReduxStore = {};

// Call this once to create a new redux store that is properly configured.
ReduxStore.createStore = function() {
  return createStore(
    createRootReducer(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk)
  );
};

// Dispatch the action with the given parameters.
ReduxStore.dispatchAction = function( props, action, ...params ) {
  props.dispatch( { type: action, payload: { params: params, newReducer: true } } );
};

// Take the action and call it with the current redux state. 
ReduxStore.reducer = function( state=initialState, action ) {
  if( action.payload && action.payload.newReducer ) {
    return action.type( state, ...action.payload.params );
  } else {
    return { ...state }; 
  }
};

export default ReduxStore;