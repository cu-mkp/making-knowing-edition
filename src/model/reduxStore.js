import {createStore, applyMiddleware} from 'redux';
import rootReducer from '../reducers/allReducers';
import thunk from 'redux-thunk';

export default function configureStore() {
  return createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk)
  );
}

// export default function actionMessage( action, params... ) {
//   return function(state) {
//    return action(state, params);
//   }
//  }
 
//  export default function reducer( state, actionMessage ) {
//    return actionMessage( state );
//  }
 