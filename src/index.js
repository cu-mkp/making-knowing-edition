import React from 'react'
import ReactDOM from 'react-dom'
import DiploMatic from './component/DiploMatic';
import reduxStore from './model/reduxStore';

ReactDOM.render(
  <DiploMatic store={reduxStore()} />,
  document.getElementById('app')
)
