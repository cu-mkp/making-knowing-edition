import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';

import './css/DiploMatic.css';
import SplitPaneView from './SplitPaneView';

class DiploMatic extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <div className="DiploMatic">
          <SplitPaneView/>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default DiploMatic;
