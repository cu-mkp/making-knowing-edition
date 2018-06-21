import React from 'react'
import ReactDOM from 'react-dom'
import DiploMatic from './DiploMatic';
import configureStore from './store/configureStore';

// Store
const store = configureStore();

ReactDOM.render(
  <DiploMatic store={store} />,
  document.getElementById('app')
)
