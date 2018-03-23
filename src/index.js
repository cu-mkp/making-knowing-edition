import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from './store/configureStore';

import DiploMatic from './DiploMatic';

// Store
const store = configureStore();

ReactDOM.render(<Provider store={store}><DiploMatic /></Provider>, document.getElementById('app'));
