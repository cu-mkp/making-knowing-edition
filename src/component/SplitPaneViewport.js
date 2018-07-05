import React, { Component } from 'react';
import {connect} from 'react-redux';
import ImageView from './ImageView';
import ImageGridView from './ImageGridView';
import SearchResultView from './SearchResultView';
import TranscriptionView from './TranscriptionView';
import XMLView from './XMLView';

class SplitPaneViewport extends Component {

  constructor(props) {
    super();

    this.state = {
      folio: props.folio,
      viewType: props.viewType,
      viewWidth: props.viewWidth,
      drawerMode: props.drawerMode,
      drawerOpen: props.drawerOpen
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      folio: nextProps.folio,
      viewType: nextProps.viewType,
      viewWidth: nextProps.viewWidth,
      drawerMode: nextProps.drawerMode,
      drawerOpen: nextProps.drawerOpen
    });
  }

  render() {
    if( this.state.viewType === 'ImageView') {
      return (
        <ImageView
		  history={this.props.history}
		  document={this.props.document}
          side={this.props.side}
          viewWidth={this.state.viewWidth}
          viewHeight={this.state.viewHeight}
          drawerMode={this.props.documentView.drawerMode}
          drawerOpen={this.state.drawerOpen}
          splitPaneView={this.props.splitPaneView}
        />
      );
    } else if( this.state.viewType === 'TranscriptionView' ) {
      return(
        <TranscriptionView
		  history={this.props.history}
		  document={this.props.document}
          side={this.props.side}
          viewWidth={this.state.viewWidth}
          viewHeight={this.state.viewHeight}
          drawerMode={this.props.documentView.drawerMode}
          drawerOpen={this.state.drawerOpen}
          splitPaneView={this.props.splitPaneView}
        />
      );
    } else if( this.state.viewType === 'XMLView' ) {
      return(
        <XMLView
		  history={this.props.history}
		  document={this.props.document}
          side={this.props.side}
          viewWidth={this.state.viewWidth}
          viewHeight={this.state.viewHeight}
          drawerMode={this.props.documentView.drawerMode}
          drawerOpen={this.state.drawerOpen}
          splitPaneView={this.props.splitPaneView}
        />
      );
    } else if( this.state.viewType === 'ImageGridView' ) {
      return (
        <ImageGridView
		  history={this.props.history}
          side={this.props.side}
          document={this.props.document}
          viewWidth={this.state.viewWidth}
          viewHeight={this.state.viewHeight}
          drawerMode={this.state.drawerMode}
          drawerOpen={this.state.drawerOpen}
          splitPaneView={this.props.splitPaneView}
        />
      );
	} else if( this.state.viewType === 'SearchResultView' ) {
		return(
			<SearchResultView
			  history={this.props.history}
	          side={this.props.side}
	        />
		);
    } else {
      return (
        <div>ERROR: Undefined split pane type.</div>
      );
    }
  }
}

function mapStateToProps(state) {
	return {
        documentView: state.documentView
    };
}
export default connect(mapStateToProps)(SplitPaneViewport);
