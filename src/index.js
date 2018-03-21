import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from './store/configureStore';

import DiploMatic from './DiploMatic';
import Navigation from './Navigation';

// Store
const store = configureStore();

ReactDOM.render(<Provider store={store}><DiploMatic /></Provider>, document.getElementById('diplo-matic'));
