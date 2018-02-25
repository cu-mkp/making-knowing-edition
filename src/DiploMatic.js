import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import SplitPaneView from './view/SplitPaneView';
import Document from './model/Document';

class DiploMatic extends Component {

  constructor() {
    super();
    this.document = new Document();

  }

  render() {

    return (
      <MuiThemeProvider>
        <div className="DiploMatic">
          <SplitPaneView
            document={this.document}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default DiploMatic;
