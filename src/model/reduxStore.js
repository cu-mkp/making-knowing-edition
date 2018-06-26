import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import createRootReducer from '../action/rootReducer';

var ReduxStore = {};

// Call this once to create a new redux store that is properly configured.
ReduxStore.createStore = function() {
  return createStore(
    createRootReducer(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk)
  );
};

// Create a dispatchable action message from an action function and its parameters.
ReduxStore.actionMessage = function( action, ...params ) {
  return { type: action, payload: params };
};

// This reducer takes the actionMessage created using ReduxStore.actionMessage()
// and calls it with the current redux state. It returns a new redux state as a result of the action.
ReduxStore.reducer = function( state=null, action ) {
  return { ...state }; //action.type( state, action.payload );
};

export default ReduxStore;