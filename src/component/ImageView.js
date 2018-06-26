import OpenSeadragon from 'openseadragon';
import {connect} from 'react-redux';
import * as navigationStateActions from '../action/navigationStateActions';
import React, { Component } from 'react';
import Navigation from '../component/Navigation';
import ImageZoomControl from './ImageZoomControl.js';
class ImageView extends Component {

	constructor(props,context){
		super(props,context);
		this.navigationStateActions=navigationStateActions;
		this.isLoaded = false;
		this.currentFolioID="";
		this.elementID =  "image-view-seadragon-"+this.props.side;
		this.onZoomFixed_1 = this.onZoomFixed_1.bind(this);
		this.onZoomFixed_2 = this.onZoomFixed_2.bind(this);
		this.onZoomFixed_3 = this.onZoomFixed_3.bind(this);
	}
	// Refresh the content only if there is an incoming change
	componentWillReceiveProps(nextProps) {
		if(nextProps.navigationState[this.props.side].currentFolioID !== this.currentFolioID){
			this.loadFolio(this.props.document.getFolio(nextProps.navigationState[this.props.side].currentFolioID));
		}
	}

	componentDidMount() {
		if(this.props.navigationState[this.props.side].currentFolioID !== this.currentFolioID){
			this.loadFolio(this.props.document.getFolio(this.props.navigationState[this.props.side].currentFolioID));
		}
	}

	loadFolio(thisFolio){
		//window.loadingModal_start();
		this.currentFolioID=thisFolio.id;
		if(typeof this.viewer !== 'undefined'){
			this.viewer.destroy();
		}
		let in_id="os-zoom-in "+this.props.side;
		let out_id="os-zoom-out "+this.props.side;
		this.viewer = OpenSeadragon({
			id: this.elementID,
			zoomInButton: in_id,
			zoomOutButton: out_id,
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
		this.props.dispatch(this.navigationStateActions.setPaneViewtype({side:this.props.side,viewType:'ImageGridView'}));
	}

	onZoomFixed_1 = (e) => {
		this.viewer.viewport.fitVertically();
	}
	onZoomFixed_2 = (e) => {
		this.viewer.viewport.zoomTo((this.viewer.viewport.getMaxZoom()/2));

	}
	onZoomFixed_3 = (e) => {
		this.viewer.viewport.zoomTo(this.viewer.viewport.getMaxZoom());

	}

	render() {
		let thisClass = "image-view imageViewComponent "+this.props.side;
		return (
			<div>
				<div className={thisClass}>
					<Navigation history={this.props.history} side={this.props.side}/>
					<ImageZoomControl side={this.props.side}
									  onZoomFixed_1={this.onZoomFixed_1}
									  onZoomFixed_2={this.onZoomFixed_2}
									  onZoomFixed_3={this.onZoomFixed_3}
									  onZoomGrid={this.onZoomGrid}/>
					<div id={this.elementID}></div>
				</div>
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
