import React from 'react';
import {connect} from 'react-redux';
import SearchIndex from './model/SearchIndex';
import * as navigationStateActions from './actions/navigationStateActions';

class Search extends React.Component {

	// Init
	constructor(props, context) {
		super(props, context);
		this.document = new Document();
		this.searchIndex = new SearchIndex();
		this.navigationStateActions = navigationStateActions;
		this.hashDidChange = this.hashDidChange.bind(this);

		this.runSearch();
	}

	// This component doesn't render anything
	render() {return null;}

	// Add/remove listeners
	componentDidMount() {
		window.addEventListener("hashchange", this.hashDidChange, false);

		// Load the search index
		let this2=this;
		if(Object.keys(this.props.navigationState.search.index).length === 0){
			this2.searchIndex.load().then(
				(searchIndex) => {
					//console.log("Search index loaded");
					this.props.dispatch(this.navigationStateActions.updateSearchIndex({searchIndex: searchIndex}));
				},
				(error) => {
					// TODO update UI
					console.error('ERROR: Unable to load search index: ' + error);
				}
			);
		}
	}

	componentWillUnmount() {
		window.removeEventListener("hashchange", this.hashDidChange, false);
	}

	hashDidChange(event) {
		this.runSearch();
	}

	runSearch(){

		// We cannot do this if the search index hasn't been defined yet,
		// there's probably a slicker way to do this but let's poll, whee...
		if(Object.keys(this.props.navigationState.search.index).length === 0){
				let this2 = this;
				setTimeout(function() {
					this2.runSearch();
				}, 250);
				return;
		}

		let newHashpath = this.props.history.location.search.split('#/')[0];
		if (newHashpath.split('=')[0] === '?search') {

			// Enter search mode
			let searchTerm = newHashpath.split('=')[1];

			// Unsanitize spaces
			searchTerm = searchTerm.replace('%20',' ');

			// Cache results
			this.props.dispatch(this.navigationStateActions.enterSearchMode({searchTerm: searchTerm}));
 		}
	}

}


function mapStateToProps(state) {
	return {
		navigationState: state.navigationState
	};
}


export default connect(mapStateToProps)(Search);
