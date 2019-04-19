import React, {Component} from 'react';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Chip from '@material-ui/core/Chip';
import { CardContent, CardActionArea, Badge } from '@material-ui/core';
import CardHeader from '@material-ui/core/CardHeader';

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

        // [title tcn]/[title tl]- [folio # start]
        // [category 1] | [category 2]
        // [term type 1 unique terms] | [term type 2 unique terms] | [term type 3 unique terms] | [term type 4 unique terms]...
        // [Annotations: [title]]

        return(
            <Card className="entry" key={`entry-${entry.id}`}>
                <CardHeader title={`${heading} - ${entry.folio}`}>
                </CardHeader>
                <CardContent>

                </CardContent>
            </Card>
        )

        // return (
        // <li key={`entry-${entry.id}`}>
        //     <h3>{heading}</h3>
        //     <p>Folio: {entry.folio}</p>
        //     {mentionRow}
        // </li>
        // );
    }

    renderTagNav() {
        return ( 
            <div className="tag-nav">
                <Badge badgeContent={888} color="primary">
                    <Chip className="tag-nav-item" label="Animal"></Chip>
                </Badge>
                <Chip className="tag-nav-item" label="Bodypart (888)"></Chip>
                <Chip className="tag-nav-item" label="Environment (888)"></Chip>
                <Chip className="tag-nav-item" label="Material (888)"></Chip>
                <Chip className="tag-nav-item" label="Measurement (888)"></Chip>
                <Chip className="tag-nav-item" label="Place (888)"></Chip>
                <Chip className="tag-nav-item" label="Plant (888)"></Chip>
                <Chip className="tag-nav-item" label="Profession (888)"></Chip>
                <Chip className="tag-nav-item" label="Tool (888)"></Chip>
            </div>
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
            if( entry.heading_tl !== '') {
                entryList.push( this.renderEntry(entry) );
            }
        }

        return (
            <ul className='entry-list'>
                { entryList }
            </ul>
        );
    }

	render() {
        if( !this.props.entries.loaded ) return null;
    
        return (
            <div id="entry-list-view">
                <div className='entries'>
                    <Typography variant='h3' gutterBottom>Entries</Typography>
                    { this.renderTagNav() }
                    { this.renderEntryList() }
                </div>
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
