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
	}
	// Refresh the content if there is an incoming change
	componentWillReceiveProps(nextProps) {
	 	if(this.props.navigationState[this.props.side].currentFolioID !== nextProps.navigationState[this.props.side].currentFolioID){
			let newFolio = this.props.document.getFolio(nextProps.navigationState[this.props.side].currentFolioID);
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
		console.log("Setting "+this.props.side+" to grid view");
		this.props.dispatch(this.navigationStateActions.setPaneViewtype({side:this.props.side,viewType:'ImageGridView'}));
		//this.props.splitPaneView.openFolio(this.props.side, this, 'ImageGridView');
	}

	render() {
		let thisClass = "image-view imageViewComponent "+this.props.side;
		return (
				<div className={thisClass}>
				<Navigation side={this.props.side}/>
					<ImageZoomControl onZoomGrid={this.onZoomGrid}/>
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
