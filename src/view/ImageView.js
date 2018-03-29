import OpenSeadragon from 'openseadragon';
import {connect} from 'react-redux';
import * as navigationStateActions from '../actions/navigationStateActions';
import React, { Component } from 'react';
import Navigation from '../Navigation';
import ImageZoomControl from './ImageZoomControl.js';
class ImageView extends Component {

	constructor(props,context){
		super(props,context);
		this.navigationStateActions=navigationStateActions;
		this.isLoaded = false;
	}
	// Refresh the content if there is an incoming change
	componentWillReceiveProps(nextProps) {
		console.log("New props, loading folio...");
		this.loadFolio(this.props.document.getFolio(nextProps.navigationState[this.props.side].currentFolioID));

	}

	componentDidMount() {
		console.log("Did Mount, loading folio...");
		this.loadFolio(this.props.document.getFolio(this.props.navigationState[this.props.side].currentFolioID));
	}

	loadFolio(thisFolio){
		//window.loadingModal_start();
		//console.log("Loading folio:"+thisFolio.id);
		let thisID =  "image-view-seadragon-"+this.props.side;
		this.viewer = OpenSeadragon({
			id: thisID,
			zoomInButton: "os-zoom-in",
			zoomOutButton: "os-zoom-out",
			prefixUrl: "./img/openseadragon/"
		});
		thisFolio.load().then(
			(folio) => {
				this.viewer.addTiledImage({
					tileSource: folio.tileSource
				});
				this.isLoaded=true;
				//window.loadingModal_stop();
			},
			(error) => {
				// TODO update UI
				console.log('Unable to load image: ' + error);
			}
		);
	}
	onZoomGrid = (e) => {
		//console.log("Setting "+this.props.side+" to grid view");
		this.props.dispatch(this.navigationStateActions.setPaneViewtype({side:this.props.side,viewType:'ImageGridView'}));
		//this.props.splitPaneView.openFolio(this.props.side, this, 'ImageGridView');
	}

	render() {
		//console.log("ImageView Render: "+this.props.side+": "+this.props.navigationState[this.props.side].currentFolioID);
		let thisID =  "image-view-seadragon-"+this.props.side;
		let thisClass = "image-view imageViewComponent "+this.props.side;
		return (
				<div className={thisClass}>
					<Navigation side={this.props.side}/>
					<ImageZoomControl onZoomGrid={this.onZoomGrid}/>
					<div id={thisID}></div>
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
