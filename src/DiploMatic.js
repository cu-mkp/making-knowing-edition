import React, { Component } from 'react';
import './css/DiploMatic.css';
import SplitPaneView from './SplitPaneView';

class DiploMatic extends Component {
  render() {
    return (
      <div className="DiploMatic">
        <SplitPaneView/>
      </div>
    );
  }
}

export default DiploMatic;
