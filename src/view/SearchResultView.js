import React, { Component } from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from '../actions/navigationStateActions';

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
		console.log("Exit Search");
	}

	handleSubmit(event) {
	    event.preventDefault();
	    const data = new FormData(event.target);
		event.preventDefault(); // avoid to execute the actual submit of the form.
  	}

	resultClicked(event){
		let type = event.currentTarget.dataset.type;
		let index = event.currentTarget.dataset.index;
		console.log("Event Clicked!"+type+index);
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
		/*(type === 1)?'<hr/>':'';\


		{this.props.navigationState.search.results[type].map((thing, idx) =>
			<div>{thing}</div>
		)}
		*/
		let displayOrderArray = [];
		for (var key in this.props.navigationState.search.typeHidden){
			if(!this.props.navigationState.search.typeHidden[key]){
				displayOrderArray.push(key);
			}
		}
		return (
			<div className="searchResultsComponent">
				<div className="navigation" onClick={this.exitSearch}>
					<div className="fa fa-th"></div> exit search
				</div>

				<form onSubmit={this.handleSubmit} id="searchView" action="/" method="post">
					<div className="searchBox">
						<div className="searchField"><input className="textField" placeholder="Search" placeholder={this.props.navigationState.search.term}/></div>
						<div className="searchButton"><input className="button" type="submit" id="submitButton" value=">"/></div>
					</div>
					<div className="searchFilters">
						<input checked={!(this.props.navigationState.search.typeHidden['tl'])} type="checkbox" data-id='tl' onChange={this.handleCheck}/><span>{this.props.navigationState.uiLabels.transcriptionType['tl']}</span>
						<input checked={!(this.props.navigationState.search.typeHidden['tc'])} type="checkbox" data-id='tc'onChange={this.handleCheck}/><span data-id='tc'>{this.props.navigationState.uiLabels.transcriptionType['tc']}</span>
						<input checked={!(this.props.navigationState.search.typeHidden['tcn'])} type="checkbox" data-id='tcn' onChange={this.handleCheck}/><span data-id='tcn'>{this.props.navigationState.uiLabels.transcriptionType['tcn']}</span>
					</div>
				</form>
				<div className="searchResults">
				 	{displayOrderArray.map((type, i) =>
						<div className="resultSection">
							{(i === 1) && <hr/>}
							<div className={(this.props.navigationState.search.typeHidden[type])?"resultSectionHeader hidden":"resultSectionHeader"}>
								{this.props.navigationState.uiLabels.transcriptionType[type]} ({this.props.navigationState.search.results[type].length} {this.props.navigationState.search.results[type].length === 1?"match":"matches"})

								{this.props.navigationState.search.results[type].map((key, idx) =>
									<div className="searchResult" data-type={type}  data-index={idx} onClick={this.resultClicked}>
										<div className="fa fa-file-alt icon"></div>
										<div className="title">
											<span className="name">{key.name.trim()}</span>(<span className="folio">{key.folio.trim()}</span>)
										</div>
										<div className="contextFragments">{key.contextFragments}</div>
									</div>
								)}

							</div>
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
