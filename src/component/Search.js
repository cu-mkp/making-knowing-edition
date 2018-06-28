import React from 'react';
import {connect} from 'react-redux';
import SearchIndex from '../model/SearchIndex';
import {dispatchAction} from '../model/ReduxStore';
import SearchActions from '../action/SearchActions';

const allowedDirectives=['folioid','name','content'];

class Search extends React.Component {

	constructor(props, context) {
		super(props, context);
		this.state = { searchTerm: "" };
	}

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
		this.setState({ ...this.state, searchTerm: event.target.value });
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

		let parsedSearchTerm = this.parseSearchTerm(this.state.searchTerm);
		// this.props.dispatch(enterSearchMode({searchTerm: parsedSearchTerm}));
		dispatchAction(
			this.props,
			SearchActions.enterSearchMode,
			parsedSearchTerm
		)
		event.preventDefault();
	}

	parseSearchTerm(rawSearchTerm) {
		let searchTerm = rawSearchTerm;

		// Unsanitize spaces
		searchTerm = searchTerm.replace('%20',' ');

		// Check for special directives
		if(searchTerm.split(":").length > 1){
			let directive = searchTerm.split(":")[0];
			if(!allowedDirectives.includes(directive)){
				searchTerm=searchTerm.split(":").slice(1).join(" ");
			}
		}

		return searchTerm;
	}

	render() {
		return (
			<div id="search">
				<form id="search" onSubmit={this.onSubmit}>
					<input 
						className="searchBox" 
						placeholder="Search the Edition"
						onChange={this.onSearchTermChange}
						value={this.state.searchTerm}
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


export default connect(mapStateToProps)(Search);
