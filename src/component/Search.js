import React from 'react';
import {connect} from 'react-redux';
import { withRouter } from 'react-router-dom'

import SearchIndex from '../model/SearchIndex';
import {dispatchAction} from '../model/ReduxStore';  

class Search extends React.Component {

	constructor(props) {
		super(props);
		this.onSubmit = this.onSubmit.bind(this);
	}

	onSearchTermChange = (event) => {
		let searchTerm = event.target.value;
		dispatchAction( this.props, 'SearchActions.changeSearchTerm', searchTerm);
	}

	onSubmit(event) {
		event.preventDefault();

		this.props.history.push('/search');

		let doSearch = () => {
			dispatchAction( this.props, 'SearchActions.beginSearch' );
		}

		// If we don't have a search index, load it.
		if(Object.keys(this.props.search.index).length === 0){
			let searchIndex = new SearchIndex();
			searchIndex.load().then(
				(searchIndex) => {
					console.log("Search index loaded.")
					dispatchAction(
						this.props,
						'SearchActions.updateSearchIndex',
						searchIndex
					);
					doSearch();
				},
				(error) => {
					// TODO update UI - disable the search field w/message
					console.error('ERROR: Unable to load search index: ' + error);
				}
			);
		} else {
			doSearch();
		}
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
		search: state.search
	};
}

export default connect(mapStateToProps)(withRouter(Search));