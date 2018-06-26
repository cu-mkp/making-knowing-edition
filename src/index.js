import React from 'react'
import ReactDOM from 'react-dom'
import DiploMatic from './component/DiploMatic';
import configureStore from './store/configureStore';

const store = configureStore();

ReactDOM.render(
  <DiploMatic store={store} />,
  document.getElementById('app')
)
