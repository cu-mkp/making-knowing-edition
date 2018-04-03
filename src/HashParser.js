import React from 'react';
import {connect} from 'react-redux';

class HashParser extends React.Component {
	constructor(props,context){
		super(props,context);
		this.hashDidChange = this.hashDidChange.bind(this);
		this.initURL();
	}

	// State change incoming
	componentWillReceiveProps(nextProps) {
		let newPath = this.createHashPath(nextProps.navigationState);
		if(this.props.history.location.search !== newPath){
			this.props.history.push(newPath);
		}
	}

	// Add/remove listeners
	componentDidMount() {
	    window.addEventListener("hashchange", this.hashDidChange, false);
	}
	componentWillUnmount() {
	    window.removeEventListener("hashchange", this.hashDidChange, false);
	}

	// Hash listener
	hashDidChange(event){
		let oldHashpath = event.oldURL.split('#/')[1];
		let newHashpath = event.newURL.split('#/')[1];
		if(typeof newHashpath === 'undefined' || newHashpath.length === 0){
			this.initURL();
			return;
		}else{
			console.log("Old: "+oldHashpath);
			console.log("Incoming: "+newHashpath);
			return;
		}

	}

	// This component doesn't render anything
	render() {
		return null;
	}

	initURL(){
		let newPath = this.createHashPath(this.props.navigationState);
		if(this.props.history.location.search !== newPath){
			this.props.history.push(newPath);
		}
	}

	// Create a hashpath encoding the state
	// m=[b|l|u] sr=ratio [l|r]=[shortFolioID[-1], transcriptType[f|tl|tc|tcn], viewType[g|t|i]]
	createHashPath(state){

		let splitRatio = ((state.left.width)/window.innerWidth).toFixed(2);
			splitRatio = (splitRatio===0)?.50:splitRatio;

		let newPath = "?m="  + ((state.bookMode)?"b":(state.linkedMode)?"l":"u")
				    + "&sr=" + splitRatio

				    + "&l="  + ((state.left.currentFolioShortID)?state.left.currentFolioShortID:"-1") + ","
							 + ((state.left.transcriptionType === 'facsimile')?"f":state.left.transcriptionType) +","
							 + ((state.left.viewType === 'ImageGridView')?"g":(state.left.viewType === 'TranscriptionView')?"t":"i")

					+ "&r="  + ((state.right.currentFolioShortID)?state.right.currentFolioShortID:"-1") + ","
	 						 + ((state.right.transcriptionType === 'facsimile')?"f":state.right.transcriptionType) +","
	 						 + ((state.right.viewType === 'ImageGridView')?"g":(state.right.viewType === 'TranscriptionView')?"t":"i")
	   return newPath;
	}

	// Decode and update the redux store with the parsed path
	// mode=[b|l|u] split=ratio [l|r]=[shortFolioID,transcriptType,viewType]
	setStateWithPath(path){

	}

}


function mapStateToProps(state) {
	return {
        navigationState: state.navigationState
    };
}


export default connect(mapStateToProps)(HashParser);
