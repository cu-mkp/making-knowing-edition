import React, { Component } from 'react';
import {connect} from 'react-redux';
import DocumentHelper from '../model/DocumentHelper';
import { Link } from 'react-scroll';
import { Typography } from '@material-ui/core';
import Parser from 'html-react-parser';


const alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'Z' ]

class GlossaryView extends Component {

    constructor() {
        super()
        this.state = { filterTerm: '' }
    }

	changeType = (event) => {
		// Change viewtype
		this.props.documentViewActions.changeTranscriptionType(
			this.props.side,
			event.currentTarget.dataset.id
		);
    }

    renderMeanings(entry) {
        const meaningList = []
        for( let i=0; i < entry.meanings.length; i++ ) { 
            const meaning = entry.meanings[i];
           
            const refString = meaning.references ? `[${meaning.references}]` : ''
            const numString = (entry.meanings.length > 1) ? `${i+1}. ` : ''
            meaningList.push( 
                `${numString} ${meaning.partOfSpeech} ${meaning.meaning} ${refString}`
            )
        }
        return meaningList
    }

    renderGlossary() {
        const {glossary} = this.props.glossary
        const filterTerm = this.state.filterTerm.toLowerCase()
        const entryList = Object.values(glossary)

        // {head-word}, {alternate-spelling}: {meaning-number}. {part-of-speech} {meaning} [{references}]        
        const glossaryEntries = []
        let alphaIndex = 0
        for( let entry of entryList ) {
            // render alphabetic header if we have started the next letter
            if( filterTerm.length === 0 && entry.headWord[0] === alpha[alphaIndex] ) {
                const alphaHeadingID = `alpha-${alphaIndex}` 
                glossaryEntries.push(
                    <Typography variant='h4' key={`gloss-heading-${alpha[alphaIndex]}`} id={alphaHeadingID}>&mdash; {alpha[alphaIndex]} &mdash;</Typography>
                )
                alphaIndex++
            }
            const lowerCaseHeadword = entry.headWord.toLowerCase()
            if( filterTerm.length === 0 || (filterTerm.length !== 0 && lowerCaseHeadword.startsWith(filterTerm)) ) {
                const meanings = this.renderMeanings(entry)
                const altString = entry.alternateSpellings ? `, ${entry.alternateSpellings}` : ''
                glossaryEntries.push( 
                    <Typography gutterBottom key={`gloss-${entry.headWord}`} ><u>{entry.headWord}</u>{altString}: {
                          meanings.map(meaningful=>{
                                return Parser(meaningful)
                          })}</Typography>
                )    
            }
        }

        return glossaryEntries
    }

    onFilterChange = (event) => {
        const filterTerm = event.target.value;
		this.setState( { ...this.state, filterTerm })
    }

    renderAlphaLinks() {
        let letterLinks = []
        for( let i=0; i < alpha.length; i++ ) {
            const letter = alpha[i]
            const alphaID = `alpha-${i}`
            letterLinks.push(
                <span key={`link-${alphaID}`}><Link to={alphaID} offset={-120} containerId="glossaryViewInner" smooth="true">{letter}</Link> </span> 
            )
        }

        return (
            <div style={{display: 'inline'}}>
                <input id="glossary-filter"
                    className="searchBox" 
                    placeholder="Filter by Entry"
                    onChange={this.onFilterChange}
                    value={this.state.filterTerm}
                />
                <span>Go to: </span>
                <div className='alphaNav'>
                    { letterLinks }
                </div>
            </div>
        )
    }

    renderToolbar() {
        let transcriptionTypeLabel = DocumentHelper.transcriptionTypeLabels[this.props.documentView[this.props.side].transcriptionType];

        return (
            <div className='glossaryNav'>
                { this.renderAlphaLinks() }
                <div className="dropdown">
                    <button className="dropbtn">
                        {transcriptionTypeLabel} <span className="fa fa-caret-down"></span>
                    </button>
                    <div className="dropdown-content">
                        <span data-id='tl' onClick={this.changeType}>{DocumentHelper.transcriptionTypeLabels['tl']}</span>
                        <span data-id='tc' onClick={this.changeType}>{DocumentHelper.transcriptionTypeLabels['tc']}</span>
                        <span data-id='tcn' onClick={this.changeType}>{DocumentHelper.transcriptionTypeLabels['tcn']}</span>
                        <span data-id='f' onClick={this.changeType}>{DocumentHelper.transcriptionTypeLabels['f']}</span>
                        <span data-id='glossary' onClick={this.changeType}>{DocumentHelper.transcriptionTypeLabels['glossary']}</span>
                    </div>
                </div>
            </div>
        )
    }
    
	render() {
        if( !this.props.glossary.loaded ) return null;

        return (
            <div id="glossaryView">
                { this.renderToolbar() }
                <div id="glossaryViewInner">
                    <div id="glossaryContent">
                        <Typography variant='h2' className="title">Glossary</Typography>
                        { this.renderGlossary() }
                    </div>
                </div>
            </div>
        );

	}
}


function mapStateToProps(state) {
	return {
		glossary: state.glossary
    };
}

export default connect(mapStateToProps)(GlossaryView);
