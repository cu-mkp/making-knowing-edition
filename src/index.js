import React from 'react'
import ReactDOM from 'react-dom'
import DiploMatic from './component/DiploMatic';
import {createReduxStore} from './model/ReduxStore';
import { ThemeProvider } from '@material-ui/core/styles'
import theme from './theme'

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <DiploMatic store={createReduxStore()} />
  </ThemeProvider>,
  document.getElementById('app')
)
