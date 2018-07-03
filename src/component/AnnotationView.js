import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom'

class AnnotationView extends Component {

	render() {
        return (
            <div id="annotation-view">
                <h1>Annotations</h1>
                This is a list of the annotations.
                <ul>
                    <li><Link to='/annotations/1'>Annotation One</Link></li>
                </ul>                
            </div>
        );
	}
}

function mapStateToProps(state) {
    return {
        // TODO
    };
}

export default connect(mapStateToProps)(AnnotationView);
