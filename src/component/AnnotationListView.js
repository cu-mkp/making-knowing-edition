import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom'
import Parser from 'html-react-parser';

import { dispatchAction } from '../model/ReduxStore';

class AnnotationListView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
    }

    renderEntryLinks(entryIDs) {
        let links = [];
        let idList = entryIDs.split(';');
        for( let entryID of idList ) {
            let folioID = sliceZeros( entryID.split('_')[0].slice(1) );
            links.push(<Link key={entryID} to={`/folios/${folioID}`}>{entryID}</Link>);
        }
        return links;        
    } 

    renderAnnotation(annotation) {
      return (
        <div key={`anno-${annotation.id}`}>
            <div className='description'> 
                <h2><Link to={`/annotations/${annotation.id}`}>{annotation.name}</Link></h2>
                {Parser(annotation.abstract)}
                <ul className='annotation-details'>
                    <li>{annotation.authors}</li>
                    <li>{annotation.theme}, {annotation.semester} {annotation.year}</li>
                    <li>{this.renderEntryLinks(annotation.entryIDs)}</li>
                </ul>
            </div>
        </div>
      );
    }

    renderAnnotationList() {
        let annoList = [];
        for( let annotation of Object.values(this.props.annotations.annotations) ) {
            annoList.push( this.renderAnnotation(annotation) );
        }

        return (
            <div className="annotationList">
                { annoList }
            </div>
        );
    }

	render() {
        if( !this.props.annotations.loaded ) return null;
    
        return (
            <div id="annotation-list-view">
                <h1> Annotations of BnF Ms. Fr. 640</h1>
                { this.renderAnnotationList() }
            </div>
        );
	}
}

function mapStateToProps(state) {
    return {
        annotations: state.annotations
    };
}

function sliceZeros(paddedID) {
    if( paddedID[0] && paddedID[0] === '0' ) {
        return sliceZeros(paddedID.slice(1))
    } else {
        return paddedID;
    }
}


export default connect(mapStateToProps)(AnnotationListView);
