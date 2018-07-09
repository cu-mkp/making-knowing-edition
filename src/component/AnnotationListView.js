import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom'

import { dispatchAction } from '../model/ReduxStore';

class AnnotationListView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', true );
    }

    componentDidMount() {
        dispatchAction( this.props, 'AnnotationActions.requestAnnotationManifest', 'http://localhost:4000/bnf-ms-fr-640/annotations/annotations.json' );
    }

	render() {
        if( !this.props.annotations.loaded ) return null;
        
        return (
            <div id="annotation-list-view">
                <Link to="/annotations/anno1">anno1</Link>
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
