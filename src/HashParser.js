import React from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from './actions/navigationStateActions';

class HashParser extends React.Component {

	// Init
	constructor(props, context) {
		super(props, context);
		this.hashDidChange = this.hashDidChange.bind(this);
		this.navigationStateActions=navigationStateActions;
		this.suppressNextUpdate=true;
		this.initURL();
		this.lastHashChangeInvokedStateUpdate= new Date();
	}

	// This component doesn't render anything
	render() {return null;}

	// Add/remove listeners
	componentDidMount() {
		window.addEventListener("hashchange", this.hashDidChange, false);
	}
	componentWillUnmount() {
		window.removeEventListener("hashchange", this.hashDidChange, false);
	}

	// Hash changed
	hashDidChange(event) {
		let newHashpath = event.newURL.split('#/')[1];
		if (!(typeof newHashpath === 'undefined' || newHashpath.length === 0)) {
			this.lastHashChangeInvokedStateUpdate=new Date();
			this.setStateWithPath(newHashpath);
		}
	}

	// State changed
	componentWillReceiveProps(nextProps) {
		let now = new Date();
	 	let secSinceLastHashChangeUpdate = (now.getTime() - this.lastHashChangeInvokedStateUpdate.getTime()) / 1000;

		// Make sure the path has actually changed
		let newPath = this.createHashPath(nextProps.navigationState);
		let oldPath = this.createHashPath(this.props.navigationState);
		if(newPath !== oldPath){

			// This is debounced, so that we ignore props update if we've handled a hash change very recently (otherwise it loops)
			if(secSinceLastHashChangeUpdate >= 0.1){
				this.setStateWithPath(newPath);
				this.props.history.push(newPath);
			}else{
				//console.log("Ignoring, too soon!");
			}
		}

	}


	initURL() {
		let newPath = this.createHashPath(this.props.navigationState);
		if (this.props.history.location.search !== newPath) {
			console.log("Init to: "+newPath);
			this.props.history.push(newPath);
		}
	}

	// Create a hashpath encoding the state
	// m=[b|l|u] sr=ratio [l|r]=[shortFolioID[-1], transcriptType[f|tl|tc|tcn], viewType[g|t|i]]
	createHashPath(state) {

		let splitRatio = ((state.left.width) / window.innerWidth).toFixed(2);
		splitRatio = (splitRatio === 0) ? .50 : splitRatio;

		let newPath = "?m=" + ((state.bookMode) ? "b" : (state.linkedMode) ? "l" : "u") +
			"&sr=" + splitRatio

			+
			"&l=" + ((state.left.currentFolioShortID) ? state.left.currentFolioShortID : "-1") + "," +
			((state.left.transcriptionType === 'facsimile') ? "f" : state.left.transcriptionType) + "," +
			((state.left.viewType === 'ImageGridView') ? "g" : (state.left.viewType === 'TranscriptionView') ? "t" : "i")

			+
			"&r=" + ((state.right.currentFolioShortID) ? state.right.currentFolioShortID : "-1") + "," +
			((state.right.transcriptionType === 'facsimile') ? "f" : state.right.transcriptionType) + "," +
			((state.right.viewType === 'ImageGridView') ? "g" : (state.right.viewType === 'TranscriptionView') ? "t" : "i")
		return newPath;
	}

	// Decode and update the redux store with the parsed path
	// mode=[b|l|u] split=ratio [l|r]=[shortFolioID,transcriptType,viewType]
	setStateWithPath(path) {

		// Set defaults
		let mode = 'x';
		let splitRatio = 0.5;
		let left_currentFolioShortID = -1;
		let left_transcriptionType = 'tc';
		let left_viewType = 'g';
		let right_currentFolioShortID = -1;
		let right_transcriptionType = 'tc';
		let right_viewType = 'f';

		// Parse the URL
		let urlParams = path.split('&');
		if (urlParams.length === 4) {
			mode = urlParams[0].split('=')[1];
			splitRatio = urlParams[1].split('=')[1]
			let left = urlParams[2].split('=')[1];
			let right = urlParams[3].split('=')[1];

			if (left.split(',').length === 3) {
				left_currentFolioShortID = left.split(',')[0];
				left_transcriptionType = left.split(',')[1];
				left_viewType = left.split(',')[2];
			}

			if (right.split(',').length === 3) {
				right_currentFolioShortID = right.split(',')[0];
				right_transcriptionType = right.split(',')[1];
				right_viewType = right.split(',')[2];
			}

		}

		// Apply changes to state
		switch (mode) {
			case 'b':
					this.props.dispatch(this.navigationStateActions.setBookMode(true));
				break;
			case 'l':
					this.props.dispatch(this.navigationStateActions.setBookMode(false));
					this.props.dispatch(this.navigationStateActions.setLinkedMode(true));
				break;
			case 'u':
					this.props.dispatch(this.navigationStateActions.setBookMode(false));
					this.props.dispatch(this.navigationStateActions.setLinkedMode(false));
				break;
		}



	}

}


function mapStateToProps(state) {
	return {
		navigationState: state.navigationState
	};
}


export default connect(mapStateToProps)(HashParser);
