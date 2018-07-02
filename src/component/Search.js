import React from 'react';
import {connect} from 'react-redux';
import { withRouter } from 'react-router-dom'

import SearchIndex from '../model/SearchIndex';
import {dispatchAction} from '../model/ReduxStore';
import SearchActions from '../action/SearchActions';
import DocumentViewActions from '../action/DocumentViewActions';
  

class Search extends React.Component {

	constructor(props) {
		super(props);
		this.onSubmit = this.onSubmit.bind(this);
	}

	componentDidMount() {
		// If we don't have a search index, load it.
		if(Object.keys(this.props.search.index).length === 0){
			let searchIndex = new SearchIndex();
			searchIndex.load().then(
				(searchIndex) => {
					console.log("Search index loaded.")
					dispatchAction(
						this.props,
						SearchActions.updateSearchIndex,
						searchIndex
					);
				},
				(error) => {
					// TODO update UI - disable the search field w/message
					console.error('ERROR: Unable to load search index: ' + error);
				}
			);
		}
	}

	onSearchTermChange = (event) => {
		let searchTerm = event.target.value;
		dispatchAction( this.props, SearchActions.changeSearchTerm, searchTerm);
	}

	onSubmit(event) {
		event.preventDefault();

		let doSearch = () => {
			this.props.history.push('/folios');
			dispatchAction( this.props, SearchActions.beginSearch );
			dispatchAction( this.props, DocumentViewActions.enterSearchMode );	
		}

		// We cannot do this if the search index hasn't been defined yet,
		// there's probably a slicker way to do this but let's poll, whee...
		if(Object.keys(this.props.search.index).length === 0){
			setTimeout(() => {
				doSearch();
			}, 250);
			return;
		}

		doSearch();
	}

	render() {
		return (
			<div id="search">
				<form id="search" onSubmit={this.onSubmit}>
					<input 
						className="searchBox" 
						placeholder="Search the Edition"
						onChange={this.onSearchTermChange}
						value={this.props.search.rawSearchTerm}
						/>
				</form>
			</div>
		);
	}

}

function mapStateToProps(state) {
	return {
		navigationState: state.navigationState,
		search: state.search
	};
}

export default connect(mapStateToProps)(withRouter(Search));