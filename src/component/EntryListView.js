import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Typography, Card, Chip, Avatar } from '@material-ui/core';
import { CardContent, Link } from '@material-ui/core';

import { dispatchAction } from '../model/ReduxStore';

const tagNames = {
    "al": "animal",
    "bp": "bodypart",
    "cn": "currency",
    "env": "environment",
    "m": "material",
    "ms": "measurement",
    "pa": "place",
    "pl": "plant",
    "pn": "personal name",
    "pro": "profession",
    "sn": "sensory",
    "tl": "tool",
    "md": "medical",
    "mu": "music"
};

class EntryListView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
    }

    renderEntryCard(entry) {        
        let tags = [];
        for( let tag of Object.keys(tagNames) ) {
            if( entry.mentions[tag] > 0 ) {
                tags.push({ name: tagNames[tag], count: entry.mentions[tag]})
            }
        }
        let mentionRow = ( tags.length > 0 ) ? this.renderEntryTypes(tags) : '';

        const folioURL = `/folios/${entry.folio.replace(/^[0|\D]*/,'')}`

        return(
            <Card className="entry" key={`entry-${entry.id}`}>
                <CardContent>
                    <Link onClick={e => {this.props.history.push(folioURL)}} ><Typography variant="h6">{`${entry.displayHeading} - ${entry.folio}`}</Typography></Link>
                    <Typography>Moldmaking and Metalworking</Typography>
                    <Typography>Annotations: <i>Too thin things, fol. 142v (Fu, Zhang)</i></Typography>
                    <div className="entry-chips">{mentionRow}</div>
                </CardContent>
            </Card>
        )
    }

    onClick = () => {
        // TODO 
        // determine which tag was clicked on and toggle it
    }

    renderEntryTypes(tags) {
        // need to display toggle state
        let chips = []
        for( let tag of tags) {
            chips.push(<Chip
                className="tag-nav-item"
                key={`chip-${tag.name}`}
                avatar={ tag.count > 0 ? <Avatar>{tag.count}</Avatar> : null }
                onClick={this.onClick}
                label={tag.name}
            />)
        }

        return(
           chips
        )
    }

    renderEntryList() {
        let entryCards = [];
        for( let entry of this.props.entries.entryList ) {
            entryCards.push( this.renderEntryCard(entry) );
        }

        return (
            <ul className='entry-list'>
                { entryCards }
            </ul>
        );
    }

	render() {
        if( !this.props.entries.loaded ) return null;
    
        let tags = []
        for( let tagName of Object.values(tagNames) ) {
            tags.push({ name: tagName, count: 0 })
        }

        return (
            <div id="entry-list-view">
                <div className='entries'>
                    <Typography variant='h3' gutterBottom>Entries</Typography>
                    { this.renderEntryTypes(tags) }
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
