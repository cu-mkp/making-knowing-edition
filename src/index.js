import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from './store/configureStore';

import DiploMatic from './DiploMatic';
import { HashRouter } from 'react-router-dom'
// Store
const store = configureStore();

ReactDOM.render(<Provider store={store}><HashRouter><DiploMatic /></HashRouter></Provider>, document.getElementById('app'));
