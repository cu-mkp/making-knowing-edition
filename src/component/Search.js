import React from 'react';
import {connect} from 'react-redux';
import SearchIndex from '../model/SearchIndex';
import {dispatchAction} from '../model/ReduxStore';
import SearchActions from '../action/SearchActions';
import DocumentViewActions from '../action/DocumentViewActions';

class Search extends React.Component {

	componentDidMount() {
		// If we don't have a search index, load it.
		if(Object.keys(this.props.search.index).length === 0){
			let searchIndex = new SearchIndex();
			searchIndex.load().then(
				(searchIndex) => {
					console.log("Search index loaded.")
					// this.props.dispatch(updateSearchIndex({searchIndex: searchIndex}));
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

	onSubmit = (event) => {

		// We cannot do this if the search index hasn't been defined yet,
		// there's probably a slicker way to do this but let's poll, whee...
		if(Object.keys(this.props.search.index).length === 0){
			setTimeout(() => {
				this.onSubmit();
			}, 250);
			return;
		}

		// this.props.dispatch(enterSearchMode({searchTerm: parsedSearchTerm}));
		dispatchAction( this.props, SearchActions.beginSearch );
		dispatchAction( this.props, DocumentViewActions.enterSearchMode );
		event.preventDefault();
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

export default connect(mapStateToProps)(Search);