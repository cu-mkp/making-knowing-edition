import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import SplitPaneView from './view/SplitPaneView';
import Document from './model/Document';

class DiploMatic extends Component {

  constructor() {
    super();

    let doc = new Document();

    this.splitPaneDefaults = {
      document: doc,
      leftViewType: 'ImageView',
      leftFolio: doc.folios[0],
      rightViewType: 'TranscriptionView',
      rightFolio: doc.folios[0]
    }
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="DiploMatic">
          <SplitPaneView
            document={this.splitPaneDefaults.document}
            leftViewType={this.splitPaneDefaults.leftViewType}
            leftFolio={this.splitPaneDefaults.leftFolio}
            rightViewType={this.splitPaneDefaults.rightViewType}
            rightFolio={this.splitPaneDefaults.rightFolio}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default DiploMatic;
