import OpenSeadragon from 'openseadragon';
import {connect} from 'react-redux';
import React, { Component } from 'react';

import Navigation from '../component/Navigation';
import ImageZoomControl from './ImageZoomControl.js';
import {dispatchAction} from '../model/ReduxStore';

import DocumentHelper from '../model/DocumentHelper';

class ImageView extends Component {

	constructor(props,context){
		super(props,context);
		this.isLoaded = false;
		this.currentFolioURL="";
		this.elementID =  "image-view-seadragon-"+this.props.side;
		this.onZoomFixed_1 = this.onZoomFixed_1.bind(this);
		this.onZoomFixed_2 = this.onZoomFixed_2.bind(this);
		this.onZoomFixed_3 = this.onZoomFixed_3.bind(this);
	}
	// Refresh the content only if there is an incoming change
	componentWillReceiveProps(nextProps) {
		const nextFolioID = nextProps.documentView[this.props.side].currentFolioShortID;
		const nextFolioURL = DocumentHelper.folioURL(nextFolioID);
		if(nextFolioURL !== this.currentFolioURL){
			this.loadFolio(DocumentHelper.getFolio(this.props.document, nextFolioURL));
		}
	}

	componentDidMount() {
		const folioID = this.props.documentView[this.props.side].currentFolioShortID;
		const folioURL = DocumentHelper.folioURL(folioID);
		if(folioURL !== this.currentFolioURL){
			this.loadFolio(DocumentHelper.getFolio(this.props.document, folioURL));
		}
	}

	loadFolio(thisFolio){
		//window.loadingModal_start();
		this.currentFolioURL=thisFolio.id;
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
		dispatchAction(
			this.props,
			'DocumentViewActions.setPaneViewtype',
			this.props.side,
			'ImageGridView'
		);
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
		document: state.document,
        documentView: state.documentView
    };
}


export default connect(mapStateToProps)(ImageView);
