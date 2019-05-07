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
    
	render() {
        let transcriptionTypeLabel = DocumentHelper.transcriptionTypeLabels[this.props.documentView[this.props.side].transcriptionType];

        return (
            <div>
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
                <div>
                    <p>THIS IS THE GLOSSARY</p>
                </div>
            </div>
        );

	}
}


function mapStateToProps(state) {
	return {
		// document: state.document
    };
}

export default connect(mapStateToProps)(GlossaryView);
