import React from 'react';
import {connect} from 'react-redux';
import { withRouter } from 'react-router-dom'

class Search extends React.Component {

	constructor(props) {
		super(props);
		this.state = { searchTerm: '' };
		this.onSubmit = this.onSubmit.bind(this);
	}

	onSearchTermChange = (event) => {
		const searchTerm = event.target.value;
		this.setState( { ...this.state, searchTerm })
	}

	doSearch(searchQuery) {
		const url = encodeURI(`/search?q=${searchQuery}`);
		this.props.history.push(url);
	}

	onSubmit(event) {
		event.preventDefault();
		this.props.onSearchDialogClose()
		this.doSearch(this.state.searchTerm);
	}

	render() {
		return (
			<div id="search">
				<form id="search" onSubmit={this.onSubmit}>
					<input 
						autoFocus={this.props.autoFocus}
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

export default connect(mapStateToProps)(withRouter(Search));