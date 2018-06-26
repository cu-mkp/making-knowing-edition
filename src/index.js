import React from 'react'
import ReactDOM from 'react-dom'
import DiploMatic from './component/DiploMatic';
import ReduxStore from './model/ReduxStore';

ReactDOM.render(
  <DiploMatic store={ReduxStore.createStore()} />,
  document.getElementById('app')
)
