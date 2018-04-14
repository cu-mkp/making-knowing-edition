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
		console.log(event.clientX+","+event.clientY);
		let term = this.props.children.toLowerCase();
		let glossaryID = this.props.navigationState[this.props.side].transcriptionType;
		let gloss = this.props.navigationState.glossary[glossaryID];

		if(typeof gloss[term] === 'undefined'){
			console.log("Cannot find ("+glossaryID+") definition for: "+term);

		}else{
			console.log("Definition: "+gloss[term]);
		}
		let left = (event.clientX-100)+'px';
		let top  = (event.clientY+20)+'px';
		document.getElementById('glossaryPopup').style.left=left;
		document.getElementById('glossaryPopup').style.top=top;

	}

	render() {
		return (
			  <span onClick={this.displayGloss} style={{color:'red'}}>{this.props.children}</span>
		);
	}
}

function mapStateToProps(state) {
	return {
		navigationState: state.navigationState
	};
}


export default connect(mapStateToProps)(Gloss);
