import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import SplitPaneView from './view/SplitPaneView';
import Document from './model/Document';

class DiploMatic extends Component {

  constructor() {
    super();
    this.document = new Document();
    this.state = {
      ready: false
    }
  }

  componentDidMount() {
    this.document.load().then(
      (folio) => {
        this.setState({ ready: true });
      },
      (error) => {
        // TODO update UI
        console.log('Unable to load manifest: '+error);
      }
    );
  }

  render() {
    if( this.state.ready ) {
	window.loadingModal_stop();
      return (
        <MuiThemeProvider>
          <div className="DiploMatic">
            <SplitPaneView
              document={this.document}
            />
          </div>
        </MuiThemeProvider>
      );
    } else {
      return (
        <MuiThemeProvider>
          <div className="DiploMatic"></div>
        </MuiThemeProvider>
      );
    }
  }
}

export default DiploMatic;
