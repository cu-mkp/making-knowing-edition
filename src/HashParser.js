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

		// If we're coming in with nothing, generate the URL from the default state
		if(this.props.history.location.search.length === 0){
			let newPath = this.createHashPath(this.props.navigationState);
			if (this.props.history.location.search !== newPath) {
				//console.log("Init with default: "+newPath);
				this.props.history.push(newPath);
			}

		// Otherwise parse the incoming URL to set state
		}else{
			//console.log("Init with user specified: "+this.props.history.location.search);
			this.setStateWithPath(this.props.history.location.search);

		}

		// Initialize last hash change
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
			if(secSinceLastHashChangeUpdate >= 0.25){
				//this.setStateWithPath(newPath);
				this.props.history.push(newPath);
			}else{
				//console.log("Ignoring, too soon!");
			}
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

			// We cannot do this if the folio index hasn't been defined yet,
			// there's probably a slicker way to do this but let's poll, whee...
			if(this.props.navigationState.folioNameIndex.length === 0){
					let this2 = this;
					setTimeout(function() {
						this2.setStateWithPath(path);
					}, 250);
					return;
			}

			// Default to current
			let newState = {left:{},right:{}};
				newState.bookMode =	this.props.navigationState.bookMode;
				newState.linkedMode = this.props.navigationState.linkedMode;

				newState.left.folioID = this.props.navigationState.left.currentFolioID;
				newState.left.folioShortID = this.props.navigationState.left.currentFolioShortID;
				newState.left.viewType = this.props.navigationState.left.viewType;
				newState.left.transcriptionType = this.props.navigationState.left.transcriptionType;

				newState.right.folioID = this.props.navigationState.right.currentFolioID;
				newState.right.folioShortID = this.props.navigationState.right.currentFolioShortID;
				newState.right.viewType = this.props.navigationState.right.viewType;
				newState.right.transcriptionType = this.props.navigationState.right.transcriptionType;

			// Parse the URL into the params we use internally
			let urlParams = path.split('&');
			let mode;
			let left_currentFolioShortID,left_transcriptionType,left_viewType;
			let right_currentFolioShortID,right_transcriptionType,right_viewType;
			if (urlParams.length === 4) {
				mode = urlParams[0].split('=')[1];
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
			right_transcriptionType=(right_transcriptionType === 'f')?'facsimile':right_transcriptionType;
			left_transcriptionType=(left_transcriptionType === 'f')?'facsimile':left_transcriptionType;


			// Now build the new state

			// Mode
			switch (mode) {
				case 'b':
						if(left_currentFolioShortID !== '-1'){
							if(!this.props.navigationState.bookMode){
								newState.bookMode = true;
							}
						}
						break;
				case 'l':
						newState.bookMode = false;
						newState.linkedMode = true;
						break;
				case 'u':
						newState.bookMode = false;
						newState.linkedMode = false;
						break;
				default:
					console.log("WARNING: Hashparser: I don't understand the mode:"+mode);

			}


			// Set view type if we're NOT in bookMode
			//if(mode !== 'b'){

				// Left
				switch (left_viewType) {
					case 'g':
						newState.left.viewType='ImageGridView';
						break;

					case 't':
						newState.left.transcriptType=left_transcriptionType;
						newState.left.viewType='TranscriptionView';
						break;

					case 'i':
						newState.left.transcriptType=left_transcriptionType;
						newState.left.viewType='ImageView';
						break;

					default:
						console.log("WARNING: Hashparser: I don't understand the left_viewtype:"+left_viewType);
				}

				// Right
				switch (right_viewType) {
					case 'g':
						newState.right.viewType='ImageGridView';
						break;

					case 't':
						newState.right.transcriptType=right_transcriptionType;
						newState.right.viewType='TranscriptionView';
						break;

					case 'i':
						newState.right.transcriptType=right_transcriptionType;
						newState.right.viewType='ImageView';
						break;

					default:
						console.log("WARNING: Hashparser: I don't understand the right_viewtype:"+right_viewType);
				}

			//}

			// Set the left folio if it's defined
			if(left_currentFolioShortID !== '-1'){
				newState.left.folioID=(this.props.navigationState.folioIDPrefix+left_currentFolioShortID);
				newState.left.folioShortID=left_currentFolioShortID;

				// If locked mode, set right to match
				if(mode === 'l'){
					newState.right.folioID=(this.props.navigationState.folioIDPrefix+left_currentFolioShortID);
					newState.right.folioShortID=left_currentFolioShortID;
				}
			}

			// If we have a right folio specified and we're in unlocked mode, set it
			if(right_currentFolioShortID !== '-1' && mode === 'u'){
				newState.right.folioID=(this.props.navigationState.folioIDPrefix+right_currentFolioShortID);
				newState.right.folioShortID=right_currentFolioShortID;
			}


			// Finally pass the new state object to the reducer
			this.props.dispatch(this.navigationStateActions.setStateFromHash({newState:newState}));



	}

}


function mapStateToProps(state) {
	return {
		navigationState: state.navigationState
	};
}


export default connect(mapStateToProps)(HashParser);
