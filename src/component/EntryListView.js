import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom'

import { dispatchAction } from '../model/ReduxStore';

class EntryListView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
    }

    renderEntry(entry) {
      return (
        <li key={`entry-${entry.id}`}>
            <h3>Heading Name</h3>
            <p>Found in: 144r</p>
            <p>Mentions: plants animals bodyparts </p>
        </li>
      );
    }

    renderEntryList() {
        let entryList = [];
        let entries = [{},{},{}];
        for( let entry of entries ) {
            entryList.push( this.renderEntry(entry) );
        }

        return (
            <ul>
                { entryList }
            </ul>
        );
    }

	render() {
        // if( !this.props.annotations.loaded ) return null;
    
        return (
            <div id="entry-list-view">
                { this.renderEntryList() }
            </div>
        );
	}
}

function mapStateToProps(state) {
    return {
        // annotations: state.annotations
    };
}

export default connect(mapStateToProps)(EntryListView);
