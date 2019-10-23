import React, { Component } from 'react';
import {connect} from 'react-redux';
import Parser from 'html-react-parser';
import DocumentHelper from '../model/DocumentHelper';
import  Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import copyObject from '../lib/copyObject';

class SearchResultView extends Component {

	constructor(props) {
		super(props);

		this.state = {
			typeHidden:{
				tc: false,
				tcn:false,
				tl: false,
				anno: false
                  },
                  sortByFolio: true,
                  searchResults:{},
		}
		this.exitSearch = this.exitSearch.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.transcriptionResultClicked = this.transcriptionResultClicked.bind(this);
		this.annotationResultClicked = this.annotationResultClicked.bind(this);
		this.handleCheck = this.handleCheck.bind(this);
	}

	exitSearch() {
		this.props.searchActions.exitSearch();
	}

	handleSubmit(event) {
		event.preventDefault(); // avoid to execute the actual submit of the form.
		const data = new FormData(event.target);
		let searchQuery = data.get("searchTerm");

		if(searchQuery.length > 0 && searchQuery !== this.props.searchQuery ){
			const url = encodeURI(`/search?q=${searchQuery}`);
			this.props.history.push(url);
		}
	}
	  
	transcriptionResultClicked(event) {
		// // remove p and strip leading zeros
		let folioname = event.currentTarget.dataset.folioname.slice(1);
			folioname = folioname.replace(/^[0|\D]*/,'');

		// Convert to shortID
		let shortID = this.props.document.folioIDByNameIndex[folioname];
		if(typeof shortID === 'undefined'){
			console.error("Cannot find page via shortID lookup using '"+folioname+"', converting from: "+event.currentTarget.dataset.folioname);
		}else{
			let longID = DocumentHelper.folioURL(shortID);
			this.props.searchActions.changeCurrentFolio(longID,'right', event.currentTarget.dataset.type )
		}
	}

	annotationResultClicked(event) {
		const annotationID = event.currentTarget.dataset.annoid;
		this.props.searchActions.changeCurrentAnnotation(annotationID);
	}

	handleCheck(event) {
		let type = event.currentTarget.dataset.id;
		let resultingDisplayCount = 0;
		for (var key in this.state.typeHidden){
			if(key !== type){
				if(!this.state.typeHidden[key]){
					resultingDisplayCount++;
				}
			}
		}

		// As long as we have at least one option checked, flip the value
		if(resultingDisplayCount >= 1){
			let typeHidden = { ...this.state.typeHidden };
			typeHidden[type] = !this.state.typeHidden[type];

			this.setState( {
				...this.state,
				typeHidden
			});
		}
	}

	renderSearchResult( type, result, idx ) {
		if( type !== 'anno') {
			return (
				<div key={idx} className="searchResult" data-type={type} data-folioname={result.folio} onClick={this.transcriptionResultClicked}>
					<div className="fa fa-file-alt icon"></div>
					<div className="title">
						<span className="name">{result.name.replace(/^\s+|\s+$/g, '')}</span>(<span className="folio">{result.folio.replace(/^\s+|\s+$/g, '')}</span>)
					</div>
					<div className="contextFragments">
						{Parser(result.contextFragment)}
					</div>
				</div>
			);	
		} else {
			const annotation = this.props.annotations.annotations[result.id];

			return (
				<div key={idx} className="searchResult" data-type={type} data-annoid={annotation.id} onClick={this.annotationResultClicked}>
					<div className="fa fa-file-alt icon"></div>
					<div className="title">
						<span className="name">{annotation.name}</span>
					</div>
					<div className="contextFragments">
						<span>{annotation.theme}, {annotation.semester} {annotation.year}</span>
					</div>
				</div>
			);
		}
      }
      
      toggleSort = ()=>{
            let newValue = ! this.state.sortByFolio;
            this.setState({sortByFolio : newValue})
      }

      getResultsByFolio( originalResults ){
            const results = copyObject(originalResults);
            let sortedResults={};
            const compareRecipeIndices=(a,b)=>{
                  if(a.index < b.index)
                        return -1;
                  else if ( a.index > b.index)
                        return 1;
                  else  
                        return 0;
            }

            sortedResults.tc=results["tc"].sort(compareRecipeIndices);
            sortedResults.tcn=results["tcn"].sort(compareRecipeIndices);
            sortedResults.tl=results["tl"].sort(compareRecipeIndices);
            sortedResults.anno = results.anno;
            return sortedResults;
      }

	// RENDER
	render() {

            let results;
            if( this.state.sortByFolio)
                  results=this.getResultsByFolio(this.props.search.results)
            else
                  results = this.props.search.results;

            let displayOrderArray = [];
		for (var key in this.state.typeHidden){
			if(!this.state.typeHidden[key]){
				displayOrderArray.push(key);
			}
            }

		let totalResultCount = results["tc"].length +
							   results["tcn"].length +
							   results["tl"].length + 
							   results["anno"].length;

		return (
			<div className="searchResultsComponent">
				<div className="navigation" onClick={this.exitSearch}>
					<div className="fa fa-th"></div> exit search
				</div>
				<form onSubmit={this.handleSubmit} id="searchView" action="/" method="post">
					<div className="searchBox">
						<div className="searchField"><input name="searchTerm"  key={results.searchQuery} className="textField" defaultValue={results.searchQuery}/></div>
						<div className="searchButton"><button type="submit"><span className="fa fa-search" aria-hidden="true"></span></button></div>
					</div>
					<div className="searchFilters">
						{totalResultCount} {totalResultCount === 1?"match":"matches"} for: {results.searchQuery}
					</div>
					<div className="searchFilters">
						<input checked={!(this.state.typeHidden['tl'])} type="checkbox" data-id='tl' onChange={this.handleCheck}/><span>{DocumentHelper.transcriptionTypeLabels['tl']} ({results["tl"].length})</span>
						<input checked={!(this.state.typeHidden['tc'])} type="checkbox" data-id='tc'onChange={this.handleCheck}/><span data-id='tc'>{DocumentHelper.transcriptionTypeLabels['tc']} ({results["tc"].length})</span>
						<input checked={!(this.state.typeHidden['tcn'])} type="checkbox" data-id='tcn' onChange={this.handleCheck}/><span data-id='tcn'>{DocumentHelper.transcriptionTypeLabels['tcn']} ({results["tcn"].length})</span>
						<input checked={!(this.state.typeHidden['anno'])} type="checkbox" data-id='anno' onChange={this.handleCheck}/><span data-id='anno'>{DocumentHelper.transcriptionTypeLabels['anno']} ({results["anno"].length})</span>
					</div>
				</form>
				
                        
                        <div className="searchResults">
					<div className={(totalResultCount === 0)?"noResultsFound":"hidden"}>
						No Results found for '{results.searchQuery}'
					</div>
                              <div >
                              <RadioGroup
                                   row={true}
                                    value={this.state.sortByFolio ? 'folioId': 'relevance'}
                                    onChange={this.toggleSort}
                              >
                                    <FormControlLabel
                                          
                                          control={<Radio className='search-radio' />}
                                          label={'Sort Results by Relevance'}
                                          value='relevance'
                                          />
                                    <FormControlLabel
                                     
                                          control={<Radio  className='search-radio'/>}
                                          label={'Sort Results by Folio Id'}
                                          value='folioId'
                                          />
                                   </RadioGroup>
                              </div>

				 	{displayOrderArray.map((type, i) =>
						<div key={type} className={(results[type].length===0)?"resultSection hidden":"resultSection"}>
							<div className={(this.state.typeHidden[type])?"resultSectionHeader hidden":"resultSectionHeader"}>
								{DocumentHelper.transcriptionTypeLabels[type]} ({results[type].length} {results[type].length === 1?"match":"matches"})
							</div>
							{results[type].map((result, idx) => {
								return this.renderSearchResult( type, result, idx );
							})}
						</div>
					)}
				</div>



			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		search: state.search,
		document: state.document,
		annotations: state.annotations
    };
}

export default connect(mapStateToProps)(SearchResultView);
