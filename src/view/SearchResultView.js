import React, { Component } from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from '../actions/navigationStateActions';
import Parser from 'html-react-parser';
import domToReact from 'html-react-parser/lib/dom-to-react';

class SearchResultView extends Component {


	constructor(props) {
		super(props);
		this.navigationStateActions=navigationStateActions;
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleCheck = this.handleCheck.bind(this);
		this.exitSearch = this.exitSearch.bind(this);
		this.resultClicked = this.resultClicked.bind(this);
	}

	exitSearch(event){
		this.props.dispatch(this.navigationStateActions.exitSearchMode());
	}

	handleSubmit(event) {
		event.preventDefault(); // avoid to execute the actual submit of the form.
		const data = new FormData(event.target);

		let searchTerm = data.get("searchTerm");
		if(searchTerm.length > 0 ){
			console.log("Search:"+searchTerm);
			this.props.dispatch(this.navigationStateActions.enterSearchMode({searchTerm: searchTerm}));
		}
  	}

	resultClicked(event){

		// remove p and strip leading zeros
		let folioname = event.currentTarget.dataset.folioname.slice(1);
			folioname = folioname.replace(/^[0|\D]*/,'');

		// Convert to shortID
		let shortID = this.props.navigationState.folioIDByNameIndex[folioname];
		if(typeof shortID === 'undefined'){
			console.error("Cannot find page via shortID lookup using '"+folioname+"', converting from: "+event.currentTarget.dataset.folioname);
		}else{
			let longID = this.props.navigationState.folioIDPrefix+shortID;
			this.props.dispatch(this.navigationStateActions.changeCurrentFolio({side:'right',id:longID,transcriptionType:event.currentTarget.dataset.type}));
		}


	}

	handleCheck(event){
		let type = event.currentTarget.dataset.id;
		let resultingDisplayCount = 0;
		for (var key in this.props.navigationState.search.typeHidden){
			if(key !== type){
				if(!this.props.navigationState.search.typeHidden[key]){
					resultingDisplayCount++;
				}
			}
		}

		// As long as we have at least one option checked, flip the value
		if(resultingDisplayCount >= 1){
			this.props.dispatch(this.navigationStateActions.searchTypeHidden({type: type, value:!this.props.navigationState.search.typeHidden[type]}));
		}
	}




	// RENDER
	render() {

		let parserOptions = {
			 replace: function(domNode) {
				 switch (domNode.name) {
					case 'span':
						return (
							<mark unrecognized_tag={domNode.name}>
								{domToReact(domNode.children, parserOptions)}
							</mark>
						);
					 /* Just pass through */
					 default:
						 return domNode;
				 }
			 }
		 };

		// Display order
		let displayOrderArray = [];
		for (var key in this.props.navigationState.search.typeHidden){
			if(!this.props.navigationState.search.typeHidden[key]){
				displayOrderArray.push(key);
			}
		}
		/*{(i === 1) && <hr/>}*/


		// Total results
		let totalResultCount = this.props.navigationState.search.results["tc"].length +
							   this.props.navigationState.search.results["tcn"].length +
							   this.props.navigationState.search.results["tl"].length;

		return (
			<div className="searchResultsComponent">
				<div className="navigation" onClick={this.exitSearch}>
					<div className="fa fa-th"></div> exit search
				</div>
				<form onSubmit={this.handleSubmit} id="searchView" action="/" method="post">
					<div className="searchBox">
						<div className="searchField"><input name="searchTerm" className="textField" placeholder={this.props.navigationState.search.term}/></div>
						<div className="searchButton"><button type="submit"><span className="fa fa-search" aria-hidden="true"></span></button></div>
					</div>
					<div className="searchFilters">
						<input checked={!(this.props.navigationState.search.typeHidden['tl'])} type="checkbox" data-id='tl' onChange={this.handleCheck}/><span>{this.props.navigationState.uiLabels.transcriptionType['tl']} ({this.props.navigationState.search.results["tl"].length})</span>
						<input checked={!(this.props.navigationState.search.typeHidden['tc'])} type="checkbox" data-id='tc'onChange={this.handleCheck}/><span data-id='tc'>{this.props.navigationState.uiLabels.transcriptionType['tc']} ({this.props.navigationState.search.results["tc"].length})</span>
						<input checked={!(this.props.navigationState.search.typeHidden['tcn'])} type="checkbox" data-id='tcn' onChange={this.handleCheck}/><span data-id='tcn'>{this.props.navigationState.uiLabels.transcriptionType['tcn']} ({this.props.navigationState.search.results["tcn"].length})</span>
					</div>
				</form>
				<div className="searchResults">
					<div className={(totalResultCount === 0)?"noResultsFound":"hidden"}>
						No Results found for '{this.props.navigationState.search.term}'
					</div>

				 	{displayOrderArray.map((type, i) =>
						<div key={type} className={(this.props.navigationState.search.results[type].length===0)?"resultSection hidden":"resultSection"}>
							<div className={(this.props.navigationState.search.typeHidden[type])?"resultSectionHeader hidden":"resultSectionHeader"}>
								{this.props.navigationState.uiLabels.transcriptionType[type]} ({this.props.navigationState.search.results[type].length} {this.props.navigationState.search.results[type].length === 1?"match":"matches"})
							</div>
							{this.props.navigationState.search.results[type].map((result, idx) =>
								<div key={idx} className="searchResult" data-type={type} data-folioname={result.folio} onClick={this.resultClicked}>
									<div className="fa fa-file-alt icon"></div>
									<div className="title">
										<span className="name">{result.name.replace(/^\s+|\s+$/g, '')}</span>(<span className="folio">{result.folio.replace(/^\s+|\s+$/g, '')}</span>)
									</div>
									<div className="contextFragments">
										{Parser(result.contextFragments.toString(), parserOptions)}
									</div>
								</div>
							)}
						</div>
					)}
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

export default connect(mapStateToProps)(SearchResultView);
