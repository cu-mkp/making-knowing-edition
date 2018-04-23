import React, { Component } from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from '../actions/navigationStateActions';

class SearchResultView extends Component {


	constructor(props) {
		super(props);
		this.navigationStateActions=navigationStateActions;
	}





	// RENDER
	render() {
		return (
			<div className="searchResultsComponent">
				<div className="navigation">
					<span className="fa fa-caret-down"></span> Return to edition
				</div>

				<form id="search" action="" method="post">
					<input readOnly className="searchBox" placeholder="Search" value={this.props.navigationState.search.term}/>
					<input type="submit" id="submitButton" className="hidden"/>
					<input type="checkbox"/><span data-id='tl' onClick={this.changeType}>{this.props.navigationState.uiLabels.transcriptionType['tl']}</span>
					<input type="checkbox"/><span data-id='tc' onClick={this.changeType}>{this.props.navigationState.uiLabels.transcriptionType['tc']}</span>
					<input type="checkbox"/><span data-id='tcn' onClick={this.changeType}>{this.props.navigationState.uiLabels.transcriptionType['tcn']}</span>
				</form>

				<div className="resultSectionHeader">
					{this.props.navigationState.uiLabels.transcriptionType['tl']} ({this.props.navigationState.search.results['tl'].length} matches)
				</div>
				<hr/>
				<div className="resultSectionHeader">
					{this.props.navigationState.uiLabels.transcriptionType['tc']} ({this.props.navigationState.search.results['tc'].length} matches)
				</div>
				<div className="resultSectionHeader">
					{this.props.navigationState.uiLabels.transcriptionType['tcn']} ({this.props.navigationState.search.results['tcn'].length} matches)
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
