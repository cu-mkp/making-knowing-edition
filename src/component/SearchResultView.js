import React, { Component } from 'react';
import {connect} from 'react-redux';

import Parser from 'html-react-parser';
import domToReact from 'html-react-parser/lib/dom-to-react';

import {dispatchAction} from '../model/ReduxStore';

class SearchResultView extends Component {

	constructor(props) {
		super(props);
		this.matchedOn=[];
		this.fragmentParserOptions = this.generateFragmentParserOptions();
		this.exitSearch = this.exitSearch.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.resultClicked = this.resultClicked.bind(this);
		this.handleCheck = this.handleCheck.bind(this);
	}

	exitSearch(event) {
		dispatchAction( this.props, 'DocumentViewActions.exitSearchMode' );
		dispatchAction( this.props, 'SearchActions.clearSearch' );
	}

	handleSubmit(event) {
		event.preventDefault(); // avoid to execute the actual submit of the form.
		const data = new FormData(event.target);
		let searchTerm = data.get("searchTerm");

		if(searchTerm.length > 0 ){
			dispatchAction( this.props, 'SearchActions.changeSearchTerm', searchTerm );
			dispatchAction( this.props, 'SearchActions.beginSearch' );
		}
  	}

	resultClicked(event) {

		// remove p and strip leading zeros
		let folioname = event.currentTarget.dataset.folioname.slice(1);
			folioname = folioname.replace(/^[0|\D]*/,'');

		// Convert to shortID
		let shortID = this.props.document.folioIDByNameIndex[folioname];
		if(typeof shortID === 'undefined'){
			console.error("Cannot find page via shortID lookup using '"+folioname+"', converting from: "+event.currentTarget.dataset.folioname);
		}else{
			let longID = this.props.document.folioIDPrefix+shortID;
			dispatchAction(
				this.props,
				'SearchActions.searchMatched',
				uniq(this.matchedOn)
			);
			dispatchAction(
				this.props,
				'DocumentViewActions.gotoSearchResult',
				this.props.document,
				longID,
				'right',
				event.currentTarget.dataset.type
			);
		}


	}

	handleCheck(event) {
		let type = event.currentTarget.dataset.id;
		let resultingDisplayCount = 0;
		for (var key in this.props.search.typeHidden){
			if(key !== type){
				if(!this.props.search.typeHidden[key]){
					resultingDisplayCount++;
				}
			}
		}

		// As long as we have at least one option checked, flip the value
		if(resultingDisplayCount >= 1){
			dispatchAction(
				this.props,
				'SearchActions.searchTypeHidden',
				type, 
				!this.props.search.typeHidden[type]
			)
		}
	}

	generateFragmentParserOptions() {
		let this2=this;
		let parserOptions = {
			 replace: function(domNode) {
				 switch (domNode.name) {
					case 'span':
						//FIXME: This should really walk the tree, but we're going to assume keyword matches are not heavily nested
						if(typeof domNode.children[0] !== 'undefined' && domNode.children[0].type === 'text'){

							// Make lower and strip punctuation except -
							let matchedTerm = domNode.children[0].data;
								matchedTerm = matchedTerm.toLowerCase();
								matchedTerm = matchedTerm.replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|"|'|<|,|\.|>|\?|\/|\\|\|_|\+|=)/g,"");
							this2.matchedOn.push(matchedTerm);
							return (
								<mark unrecognized_tag={domNode.name}>
									{domToReact(domNode.children, parserOptions)}
								</mark>
							);
						} else return domNode;

					 /* Just pass through */
					 default:
						 return domNode;
				 }
			 }
		 };

		return parserOptions;
	}

	renderSearchResult( type, result, idx ) {
		if( type !== 'anno') {
			return (
				<div key={idx} className="searchResult" data-type={type} data-folioname={result.folio} onClick={this.resultClicked}>
					<div className="fa fa-file-alt icon"></div>
					<div className="title">
						<span className="name">{result.name.replace(/^\s+|\s+$/g, '')}</span>(<span className="folio">{result.folio.replace(/^\s+|\s+$/g, '')}</span>)
					</div>
					<div className="contextFragments">
						{Parser(result.contextFragments.toString(), this.fragmentParserOptions)}
					</div>
				</div>
			);	
		} else {
			const annotation = this.props.annotations.annotations[result];

			return (
				<div key={idx} className="searchResult" data-type={type}>
					<div className="fa fa-file-alt icon"></div>
					<div className="title">
						<span className="name">{annotation.name}</span>(<span className="folio">{annotation.entryIDs}</span>)
					</div>
					<div className="contextFragments">
						<span>{annotation.theme}, {annotation.semester} {annotation.year}</span>
					</div>
				</div>
			);
		}
	}

	// RENDER
	render() {

		// This is populated each time by the fragment parser.
		this.matchedOn=[];

		// Display order
		let displayOrderArray = [];
		for (var key in this.props.search.typeHidden){
			if(!this.props.search.typeHidden[key]){
				displayOrderArray.push(key);
			}
		}
		/*{(i === 1) && <hr/>}*/

		// Total results
		let totalResultCount = this.props.search.results["tc"].length +
							   this.props.search.results["tcn"].length +
							   this.props.search.results["tl"].length;

		return (
			<div className="searchResultsComponent">
				<div className="navigation" onClick={this.exitSearch}>
					<div className="fa fa-th"></div> exit search
				</div>
				<form onSubmit={this.handleSubmit} id="searchView" action="/" method="post">
					<div className="searchBox">
						<div className="searchField"><input name="searchTerm"  key={this.props.search.term} className="textField" defaultValue={this.props.search.rawSearchTerm}/></div>
						<div className="searchButton"><button type="submit"><span className="fa fa-search" aria-hidden="true"></span></button></div>
					</div>
					<div className="searchFilters">
						{totalResultCount} {totalResultCount === 1?"match":"matches"} for: {this.props.search.term}
					</div>
					<div className="searchFilters">
						<input checked={!(this.props.search.typeHidden['tl'])} type="checkbox" data-id='tl' onChange={this.handleCheck}/><span>{this.props.documentView.uiLabels.transcriptionType['tl']} ({this.props.search.results["tl"].length})</span>
						<input checked={!(this.props.search.typeHidden['tc'])} type="checkbox" data-id='tc'onChange={this.handleCheck}/><span data-id='tc'>{this.props.documentView.uiLabels.transcriptionType['tc']} ({this.props.search.results["tc"].length})</span>
						<input checked={!(this.props.search.typeHidden['tcn'])} type="checkbox" data-id='tcn' onChange={this.handleCheck}/><span data-id='tcn'>{this.props.documentView.uiLabels.transcriptionType['tcn']} ({this.props.search.results["tcn"].length})</span>
						<input checked={!(this.props.search.typeHidden['anno'])} type="checkbox" data-id='tcn' onChange={this.handleCheck}/><span data-id='anno'>{this.props.documentView.uiLabels.transcriptionType['anno']} ({this.props.search.results["anno"].length})</span>
					</div>
				</form>
				<div className="searchResults">
					<div className={(totalResultCount === 0)?"noResultsFound":"hidden"}>
						No Results found for '{this.props.search.rawSearchTerm}'
					</div>

				 	{displayOrderArray.map((type, i) =>
						<div key={type} className={(this.props.search.results[type].length===0)?"resultSection hidden":"resultSection"}>
							<div className={(this.props.search.typeHidden[type])?"resultSectionHeader hidden":"resultSectionHeader"}>
								{this.props.documentView.uiLabels.transcriptionType[type]} ({this.props.search.results[type].length} {this.props.search.results[type].length === 1?"match":"matches"})
							</div>
							{this.props.search.results[type].map((result, idx) => {
								return this.renderSearchResult( type, result, idx );
							})}
						</div>
					)}
				</div>
			</div>
		);
	}
}

function uniq(a) {
    var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

    return a.filter(function(item) {
        var type = typeof item;
        if(type in prims)
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
}

function mapStateToProps(state) {
	return {
		search: state.search,
		document: state.document,
        documentView: state.documentView,
		annotations: state.annotations
    };
}

export default connect(mapStateToProps)(SearchResultView);
