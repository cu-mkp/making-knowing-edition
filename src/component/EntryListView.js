import React, {Component} from 'react';
import {connect} from 'react-redux';

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

    renderTagNav() {
        return ( 
            <ul className="tag-nav">
                <li className="tag-nav-item">Animal (888)</li>
                <li className="tag-nav-item">Bodypart (888)</li>
                <li className="tag-nav-item">Environment (888)</li>
                <li className="tag-nav-item">Material (888)</li>
                <li className="tag-nav-item">Measurement (888)</li>
                <li className="tag-nav-item">Place (888)</li>
                <li className="tag-nav-item">Plant (888)</li>
                <li className="tag-nav-item">Profession (888)</li>
                <li className="tag-nav-item">Tool (888)</li>
            </ul>
        );
    }

    renderEntryList() {
        let entries = this.props.entries.entries.sort(function(a, b) {
            var textA = a.heading_tl.toUpperCase();
            var textB = b.heading_tl.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });;

        let entryList = [];
        for( let entry of entries ) {
            entryList.push( this.renderEntry(entry) );
        }

        return (
            <div className='entries'>
            <h2>Entries</h2>
            <ul className='entry-list'>
                { entryList }
            </ul>
            </div>
        );
    }

	render() {
        if( !this.props.entries.loaded ) return null;
    
        return (
            <div id="entry-list-view">
                { this.renderTagNav() }
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
