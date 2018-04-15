import React from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from './actions/navigationStateActions';
import thisGlossary_tc from './data/bnf-ms-fr-640/glossary/tc.json';
import thisGlossary_tcn from './data/bnf-ms-fr-640/glossary/tcn.json';
import thisGlossary_tl from './data/bnf-ms-fr-640/glossary/tl.json';

class Gloss extends React.Component {

	constructor(props, context) {
		super(props, context);
		this.navigationStateActions = navigationStateActions;
		this.displayGloss = this.displayGloss.bind(this);

		// Cache glossaries if we haven't yet
	    if(Object.keys(this.props.navigationState.glossary["tc"]).length === 0){
			this.props.dispatch(this.navigationStateActions.updateGlossary({transcriptionType:'tc', glossaryData:thisGlossary_tc}));
			this.props.dispatch(this.navigationStateActions.updateGlossary({transcriptionType:'tcn', glossaryData:thisGlossary_tcn}));
			this.props.dispatch(this.navigationStateActions.updateGlossary({transcriptionType:'tl', glossaryData:thisGlossary_tl}));
		}
	}

	displayGloss = function(event){

		let popup = document.getElementById('glossaryPopup');
		let term = this.props.children.toLowerCase();
		let glossaryID = this.props.navigationState[this.props.side].transcriptionType;
		let gloss = this.props.navigationState.glossary[glossaryID];
		let contents = "<div class='term'>"+term+"</div>";
		if(!(typeof gloss[term] === 'undefined')){
			contents += "<div class='definition'>" + gloss[term] +"</div>";
		}else{
			contents += "<div class='definition'>" + "no ("+glossaryID+") definition" +"</div>";
		}
		let left = (event.clientX-160)+'px';
		let top  = (event.clientY+20)+'px';
		if(document.getElementById('transcriptionView_left')){
			document.getElementById('transcriptionView_left').onscroll = function() {
			  popup.style.display='none';
			}
		}
		if(document.getElementById('transcriptionView_right')){
			document.getElementById('transcriptionView_right').onscroll = function() {
			  popup.style.display='none';
			}
		}
		popup.onfocus = function() {
		  popup.style.display='block';
		}
		popup.onblur = function() {
		  popup.style.display='none';
		}



		popup.style.left=left;
		popup.style.top=top;
		popup.innerHTML = contents;
		popup.style.display='block';
		popup.focus();
	}



	render() {
		return (
			  <span onClick={this.displayGloss} className="annotation">{this.props.children}</span>
		);
	}
}

function mapStateToProps(state) {
	return {
		navigationState: state.navigationState
	};
}

function onFocusOutPopup(){
	console.log("Hello");
}

export default connect(mapStateToProps)(Gloss);
