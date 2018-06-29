import React from 'react';
import {connect} from 'react-redux';
import {dispatchAction} from '../model/ReduxStore';
import GlossaryActions from '../action/GlossaryActions';
import thisGlossary_tc from '../data/bnf-ms-fr-640/glossary/tc.json';
import thisGlossary_tcn from '../data/bnf-ms-fr-640/glossary/tcn.json';
import thisGlossary_tl from '../data/bnf-ms-fr-640/glossary/tl.json';

class Gloss extends React.Component {

	constructor(props, context) {
		super(props, context);
		this.displayGloss = this.displayGloss.bind(this);

		// Cache glossaries if we haven't yet
	    if(Object.keys(this.props.glossary["tc"]).length === 0){
			// this.props.dispatch(this.navigationStateActions.updateGlossary({transcriptionType:'tc', glossaryData:thisGlossary_tc}));
			// this.props.dispatch(this.navigationStateActions.updateGlossary({transcriptionType:'tcn', glossaryData:thisGlossary_tcn}));
			// this.props.dispatch(this.navigationStateActions.updateGlossary({transcriptionType:'tl', glossaryData:thisGlossary_tl}));
			
			dispatchAction( 
				this.props,
				GlossaryActions.updateGlossary,
				'tc', 
				thisGlossary_tc
			);

			dispatchAction( 
				this.props,
				GlossaryActions.updateGlossary,
				'tcn', 
				thisGlossary_tcn
			);

			dispatchAction( 
				this.props,
				GlossaryActions.updateGlossary,
				'tl', 
				thisGlossary_tl
			);
		}
	}

	displayGloss = function(event){
		let popup = document.getElementById('glossaryPopup');
		let term = this.props.term.toLowerCase();
		 	term = term.replace(/\s{2,}/g,' ').trim()
		let glossaryID = this.props.navigationState[this.props.side].transcriptionType;
		let gloss = this.props.glossary[glossaryID];
		let contents = "<div class='term'>"+term+"</div>";
		if(!(typeof gloss[term] === 'undefined')){
			contents += "<div class='definition'>" + gloss[term] +"</div>";
		}else{
			contents += "<div class='definition'> no definition available ("+glossaryID+" glossary)</div>";
		}


		// Hide on scroll

		if(document.getElementById('transcriptionViewComponent_left')){
			document.getElementById('transcriptionViewComponent_left').onscroll = function() {
			  popup.style.display='none';
			}
		}
		if(document.getElementById('transcriptionViewComponent_right')){
			document.getElementById('transcriptionViewComponent_right').onscroll = function() {
			  popup.style.display='none';
			}
		}

		// Make visible on focus
		popup.onfocus = function() {
		  popup.style.display='block';
		}

		// Hide on blur
		popup.onblur = function() {
		  popup.style.display='none';
		}

		let left = (event.clientX-160)+'px';
		let top  = (event.clientY+20)+'px';
		popup.style.left=left;
		popup.style.top=top;
		popup.innerHTML=contents;
		popup.style.display='block';
		popup.focus();
	}

	render() {
		return (
			  <span onClick={this.displayGloss} className="glossaryTerm">{this.props.children}</span>
		);
	}
}

function mapStateToProps(state) {
	return {
		navigationState: state.navigationState,
		glossary: state.glossary
	};
}

export default connect(mapStateToProps)(Gloss);
