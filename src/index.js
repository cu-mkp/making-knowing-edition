import React from 'react'
import ReactDOM from 'react-dom'
import DiploMatic from './component/DiploMatic';
import ReduxStore from './model/ReduxStore';

var store = ReduxStore.create();

ReactDOM.render(
  <DiploMatic store={store} />,
  document.getElementById('app')
)
