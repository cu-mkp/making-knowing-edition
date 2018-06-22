import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom'

class ContentView extends Component {

	render() {
        return (
            <div id="content-view">
                This is a test 1.
                <Link to='/folios'>Folios</Link>
            </div>
        );
	}
}

function mapStateToProps(state) {
    return {
        navigationState: state.navigationState
    };
}

export default connect(mapStateToProps)(ContentView);
