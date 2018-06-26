import React from 'react'
import ReactDOM from 'react-dom'
import DiploMatic from './component/DiploMatic';
import configureStore from './model/ReduxStore';

const store = configureStore();

ReactDOM.render(
  <DiploMatic store={store} />,
  document.getElementById('app')
)
