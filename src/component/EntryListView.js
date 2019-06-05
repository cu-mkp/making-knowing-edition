import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Typography, Card, Chip, Avatar } from '@material-ui/core';
import { CardContent, CardActionArea } from '@material-ui/core';

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

    renderEntryCard(entry) {        
        const heading = `${entry.heading_tcn} / ${entry.heading_tl}`.replace(/[@+]/g,'');

        let tags = [];
        for( let tag of Object.keys(tagNames) ) {
            if( entry.mentions[tag] > 0 ) {
                tags.push(tagNames[tag])
            }
        }
        let mentionRow = ( tags.length > 0 ) ? this.renderEntryTypes(tags) : '';

        // [title tcn]/[title tl]- [folio # start]
        // [category 1] | [category 2]
        // [term type 1 unique terms] | [term type 2 unique terms] | [term type 3 unique terms] | [term type 4 unique terms]...
        // [Annotations: [title]]

        const folioURL = `/folios/${entry.folio.replace(/^[0|\D]*/,'')}`

        return(
            <Card className="entry" key={`entry-${entry.id}`}>
                <CardActionArea
                    onClick={e => {this.props.history.push(folioURL)}}
                >
                    <CardContent>
                        <Typography><b>{`${heading} - ${entry.folio}`}</b></Typography>
                        <Typography>Moldmaking and Metalworking</Typography>
                        <Typography>Annotations: <i>Too thin things, fol. 142v (Fu, Zhang)</i></Typography>
                        <Typography>{mentionRow}</Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        )
    }

    onClick = () => {
        
    }

    renderEntryTypes(tags) {
        let chips = []
        for( let tagName of tags) {
            chips.push(<Chip
                className="tag-nav-item"
                key={`chip-${tagName}`}
                avatar={ <Avatar>55</Avatar> }
                onClick={this.onClick}
                label={tagName}
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
    
        return (
            <div id="entry-list-view">
                <div className='entries'>
                    <Typography variant='h3' gutterBottom>Entries</Typography>
                    { this.renderEntryTypes(Object.values(tagNames)) }
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
