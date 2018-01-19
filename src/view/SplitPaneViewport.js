import React, { Component } from 'react';
import ImageView from './ImageView';
import ImageGridView from './ImageGridView';
import TranscriptionView from './TranscriptionView';

class SplitPaneViewport extends Component {

  constructor(props) {
    super();

    this.state = {
      folio: props.initialFolio,
      viewType: props.initialViewType,
      viewWidth: props.viewWidth,
      drawerMode: props.drawerMode,
      drawerOpen: props.drawerOpen
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      viewWidth: nextProps.viewWidth,
      drawerMode: nextProps.drawerMode,
      drawerOpen: nextProps.drawerOpen
    });
  }

  openFolio(folioID, viewType) {
    let folios = this.props.document.folios;
    this.setState({
      folio: folios[folioID],
      viewType: viewType
    });
  }

  render() {
    if( this.state.viewType === 'ImageView') {
      return (
        <ImageView
          folio={this.state.folio}
          viewWidth={this.state.viewWidth}
          drawerMode={this.state.drawerMode}
          drawerOpen={this.state.drawerOpen}
        />
      );
    } else if( this.state.viewType === 'TranscriptionView' ) {
      return(
        <TranscriptionView
          folio={this.state.folio}
          viewWidth={this.state.viewWidth}
          drawerMode={this.state.drawerMode}
          drawerOpen={this.state.drawerOpen}
        />
      );
    } else if( this.state.viewType === 'ImageGridView' ) {
      return (
        <ImageGridView
          document={this.state.document}
          viewWidth={this.state.viewWidth}
          drawerMode={this.state.drawerMode}
          drawerOpen={this.state.drawerOpen}
          viewport={this}
        />
      );
    } else {
      return (
        <div>ERROR: Undefined split pane type.</div>
      );
    }
  }
}

export default SplitPaneViewport;
