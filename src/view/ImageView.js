import OpenSeadragon from 'openseadragon';
import {connect} from 'react-redux';
import React, { Component } from 'react';
import Navigation from '../Navigation';
import ImageZoomControl from './ImageZoomControl.js';
class ImageView extends Component {

	// Refresh the content if there is an incoming change
	componentWillReceiveProps(nextProps) {
	 	if(this.props.navigationState.currentFolioID !== nextProps.navigationState.currentFolioID){
			let newFolio = this.props.document.getFolio(nextProps.navigationState.currentFolioID);
  		  	newFolio.load().then(
		        (folio) => {
					this.viewer.addTiledImage({
						tileSource: folio.tileSource
					});
		        },
		        (error) => {
		          // TODO update UI
		          console.log('Unable to load transcription: '+error);
				  this.forceUpdate();
		        }
  	      );
		}
	}

	componentDidMount() {
		this.viewer = OpenSeadragon({
			id: "image-view-seadragon",
			zoomInButton: "os-zoom-in",
			zoomOutButton: "os-zoom-out",
			prefixUrl: "./img/openseadragon/"
		});
		this.props.folio.load().then(
			(folio) => {
				this.viewer.addTiledImage({
					tileSource: folio.tileSource
				});
			},
			(error) => {
				// TODO update UI
				console.log('Unable to load image: ' + error);
			}
		);
	}
	onZoomGrid = (e) => {
		this.props.splitPaneView.openFolio(this.props.side, this, 'ImageGridView');
	}

	render() {
		return (
				<div className="image-view imageViewComponent">
				<Navigation context="image-view"/>
					<ImageZoomControl
					  onZoomGrid={this.onZoomGrid}
					/>
					<div id="image-view-seadragon" ></div>
				</div>
		);
	}
}

function mapStateToProps(state) {
	return {
        navigationState: state.navigationState
    };
}


export default connect(mapStateToProps)(ImageView);
