import React, { Component } from 'react';
import {connect} from 'react-redux';
import DocumentHelper from '../model/DocumentHelper';

class GlossaryView extends Component {

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
            const meaning = entry.meanings[i]
            const refString = meaning.references ? `[${meaning.references}]` : ''
            const numString = (entry.meanings.length > 1) ? `${i+1}. ` : ''
            const key = `gloss-${entry.headWord}-${i}`
            meaningList.push( 
                <span key={key}>{numString} {meaning.partOfSpeech} {meaning.meaning} {refString} </span>
            )
        }
        return meaningList
    }

    renderGlossary() {
        const {glossary} = this.props.glossary
        const entryList = Object.values(glossary)

        // {head-word}, {alternate-spelling}: {meaning-number}. {part-of-speech} {meaning} [{references}]

        const glossaryEntries = []
        for( let entry of entryList ) {
            const meanings = this.renderMeanings(entry)
            const altString = entry.alternateSpellings ? `, ${entry.alternateSpellings}` : ''
            glossaryEntries.push( 
                <p key={`gloss-${entry.headWord}`} >{entry.headWord}{altString}: {meanings}</p>
            )
        }

        return glossaryEntries
    }

    renderTranscriptionTypeDropDown() {
        let transcriptionTypeLabel = DocumentHelper.transcriptionTypeLabels[this.props.documentView[this.props.side].transcriptionType];

        return (
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
        )
    }
    
	render() {
        if( !this.props.glossary.loaded ) return null;

        return (
            <div className="glossaryView">
                { this.renderTranscriptionTypeDropDown() }
                <div className="glossaryContent">
                    <h2 className="title">Glossary of Terms</h2>
                    { this.renderGlossary() }
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
