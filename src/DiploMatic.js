import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import SplitPaneView from './view/SplitPaneView';
import Document from './model/Document';

class DiploMatic extends Component {

  constructor() {
    super();

    let doc = new Document();

    this.state = {
      document: doc,
      leftViewType: 'ImageGridView',
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
            document={this.state.document}
            leftViewType={this.state.leftViewType}
            leftFolio={this.state.leftFolio}
            rightViewType={this.state.rightViewType}
            rightFolio={this.state.rightFolio}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default DiploMatic;
