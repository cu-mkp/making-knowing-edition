import React, { Component } from 'react';
import {connect} from 'react-redux';
import Navigation from '../component/Navigation';
import Pagination from '../component/Pagination';
import DocumentHelper from '../model/DocumentHelper';

class XMLView extends Component {

	constructor(props) {
		super(props);
		this.state = {folio:[], isLoaded:false, currentlyLoaded:''};
		this.contentChange=true;
	}

	loadFolio(folio){
		if(typeof folio === 'undefined'){
			//console.log("TranscriptView: Folio is undefined when you called loadFolio()!");
			return;
		}
		folio.load().then(
			(folio) => {
				this.setState({folio:folio,isLoaded:true,currentlyLoaded:this.props.documentView[this.props.side].currentFolioID});
				//this.forceUpdate();
			},(error) => {
				console.log('Unable to load transcription: '+error);
				//this.forceUpdate();
			}
		);
	}

  // Refresh the content if there is an incoming change
	componentWillReceiveProps(nextProps) {
		this.contentChange=false;
		if(this.state.currentlyLoaded !== nextProps.documentView[this.props.side].currentFolioID){
			this.contentChange=true;
			this.loadFolio(DocumentHelper.getFolio( this.props.document, nextProps.documentView[this.props.side].currentFolioID));
  	}
	}

	componentDidUpdate(){
    // TODO make this work for XML view

  	if(this.contentChange){
			// Scroll content to top
			let selector = "xmlViewComponent_"+this.props.side;
			var el = document.getElementById(selector);
			if(el !== null){
				//console.log(selector + "scroll to top");
				el.scrollTop = 0;
			}
		}
	}

	// RENDER
	render() {
		let thisClass = "xmlViewComponent "+this.props.side;
		let thisID = "xmlViewComponent_"+this.props.side;

		// Retrofit - the folios are loaded asynchronously
		if(this.props.documentView[this.props.side].currentFolioID === '-1'){
			return (
				<div className="watermark">
					<div className="watermark_contents"/>
				</div>
			);
		}else if(!this.state.isLoaded){
			this.loadFolio(DocumentHelper.getFolio( this.props.document, this.props.documentView[this.props.side].currentFolioID));
			return (
				<div className="watermark">
					<div className="watermark_contents"/>
				</div>
			);
		}else{

			// get the xml for this transcription
			let transcriptionType = this.props.documentView[this.props.side].transcriptionType;
			let xmlContent = this.state.folio.transcription[`${transcriptionType}_xml`];

			return (
				<div id={thisID} className={thisClass}>
						<Navigation history={this.props.history} side={this.props.side}/>
						<div className="xmlContent">
							<Pagination side={this.props.side} className="pagination_upper"/>

							<div className="xmlContentInner">
								{ transcriptionType === 'tl' ? xmlContent : <pre>{xmlContent}</pre> }
							</div>

						</div>
				</div>
			);

		}
	}
}


function mapStateToProps(state) {
	return {
        documentView: state.documentView
    };
}

export default connect(mapStateToProps)(XMLView);
