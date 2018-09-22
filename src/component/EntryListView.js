import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom'

import { dispatchAction } from '../model/ReduxStore';

const tagNames = {
    "al": "animal",
    "bp": "bodypart",
    "cn": "cn",
    "env": "environment",
    "m": "material",
    "ms": "measurement",
    "pa": "place",
    "pl": "plant",
    "pn": "pn",
    "pro": "profession",
    "sn": "sn",
    "tl": "tool",
    "md": "md",
    "mu": "mu"
};

class EntryListView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
    }

    renderEntry(entry) {        
        const heading = entry.heading_tl !== '' ? entry.heading_tl : 'Untitled Entry';
        let tags = [];
        for( let tag of Object.keys(tagNames) ) {
            if( entry.mentions[tag] > 0 ) {
                tags.push(tagNames[tag])
            }
        }
        let mentionRow = ( tags.length > 0 ) ? <p>Mentions: {tags.join(' ')} </p> : '';
        return (
        <li key={`entry-${entry.id}`}>
            <h3>{heading}</h3>
            <p>Folio: {entry.folio}</p>
            {mentionRow}
        </li>
        );
    }

    renderEntryList() {
        let entries = this.props.entries.entries;

        let entryList = [];
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
        if( !this.props.entries.loaded ) return null;
    
        return (
            <div id="entry-list-view">
                { this.renderEntryList() }
            </div>
        );
	}
}

function mapStateToProps(state) {
    return {
        entries: state.entries
    };
}

export default connect(mapStateToProps)(EntryListView);
