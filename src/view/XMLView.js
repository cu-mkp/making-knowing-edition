import React, { Component } from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from '../actions/navigationStateActions';
import copyObject from '../lib/copyObject';
import Navigation from '../Navigation';
import Pagination from '../Pagination';

class XMLView extends Component {


	constructor(props) {
		super(props);
		this.state = {folio:[], isLoaded:false, currentlyLoaded:''};
		this.navigationStateActions=navigationStateActions;
		this.contentChange=true;
		window.loadingModal_stop();
	}

	loadFolio(folio){
		if(typeof folio === 'undefined'){
			//console.log("TranscriptView: Folio is undefined when you called loadFolio()!");
			return;
		}
		folio.load().then(
			(folio) => {
				this.setState({folio:folio,isLoaded:true,currentlyLoaded:this.props.navigationState[this.props.side].currentFolioID});
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
  		if(this.state.currentlyLoaded !== nextProps.navigationState[this.props.side].currentFolioID){
			this.contentChange=true;
			this.loadFolio(this.props.document.getFolio(nextProps.navigationState[this.props.side].currentFolioID));
	  	}
	}

	componentDidUpdate(){
    // TODO make this work for XML view
    
  	// if(this.contentChange){
		// 	// Scroll content to top
		// 	let selector = "transcriptionViewComponent_"+this.props.side;
		// 	var el = document.getElementById(selector);
		// 	if(el !== null){
		// 		//console.log(selector + "scroll to top");
		// 		el.scrollTop = 0;
		// 	}
		// }
	}

	// RENDER
	render() {
		// Retrofit - the folios are loaded asynchronously
		if(this.props.navigationState[this.props.side].currentFolioID === '-1'){
			return (
				<div className="watermark">
					<div className="watermark_contents"/>
				</div>
			);
		}else if(!this.state.isLoaded){
			this.loadFolio(this.props.document.getFolio(this.props.navigationState[this.props.side].currentFolioID));
			return (
				<div className="watermark">
					<div className="watermark_contents"/>
				</div>
			);
		}else{

			return (
		      <div>
		         <p>This is the XML View.</p>
		      </div>
			);

		}
	}
}


function mapStateToProps(state) {
	return {
        navigationState: state.navigationState
    };
}

export default connect(mapStateToProps)(XMLView);
