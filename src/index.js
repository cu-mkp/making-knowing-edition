import React from 'react'
import ReactDOM from 'react-dom'
import DiploMatic from './component/DiploMatic';
import {createReduxStore} from './model/ReduxStore';

ReactDOM.render(
  <DiploMatic store={createReduxStore()} />,
  document.getElementById('app')
)
