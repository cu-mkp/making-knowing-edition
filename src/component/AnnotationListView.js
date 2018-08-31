import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom'

import { dispatchAction } from '../model/ReduxStore';

class AnnotationListView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', true );
    }

    renderAnnotation(annotation) {
      return (
        <div key={`anno-${annotation.id}`}>
            <Link to={`/annotations/${annotation.id}`}><img className='thumbnail' src={annotation.thumbnail}></img></Link>
            <div className='description'> 
                <h2><Link to={`/annotations/${annotation.id}`}>{annotation.name}</Link></h2>
                <p>By: {annotation.author}</p>
                <p>{annotation.abstract}</p>
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

export default connect(mapStateToProps)(AnnotationListView);
