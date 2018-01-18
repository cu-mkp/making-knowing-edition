import React, { Component } from 'react';
import ImageView from './ImageView';
import ImageGridView from './ImageGridView';
import TranscriptionView from './TranscriptionView';

class SplitPaneViewport extends Component {

  constructor(props) {
    super();
  }

  render() {
    if( this.props.viewType === 'ImageView') {
      return (
        <ImageView
          viewWidth={this.props.viewWidth}
          drawerMode={this.props.drawerMode}
          drawerOpen={this.props.drawerOpen}
        />
      );
    } else if( this.props.viewType === 'TranscriptionView' ) {
      return(
        <TranscriptionView
          viewWidth={this.props.viewWidth}
          drawerMode={this.props.drawerMode}
          drawerOpen={this.props.drawerOpen}
        />
      );
    } else if( this.props.viewType === 'ImageGridView' ) {
      return (
        <ImageGridView
          viewWidth={this.props.viewWidth}
          drawerMode={this.props.drawerMode}
          drawerOpen={this.props.drawerOpen}
        />
      );
    } else {
      return (
        <div>ERROR: Undefined view type.</div>
      );
    }
  }

}

export default SplitPaneViewport;
