import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactList from 'react-list';
import {Typography, Card, Chip, Avatar } from '@material-ui/core';
import { CardContent, Link } from '@material-ui/core';

import { dispatchAction } from '../model/ReduxStore';

class EntryListView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
    }

    renderEntryCard = (index, key) => {        
        const { entryList, tagNameMap } = this.props.entries
        const entry = entryList[index]

        let tags = [];
        for( let tagID of Object.keys(tagNameMap) ) {
            if( entry.mentions[tagID] > 0 ) {
                tags.push({ id: tagID, name: tagNameMap[tagID], count: entry.mentions[tagID]})
            }
        }
        let mentionRow = ( tags.length > 0 ) ? this.renderCardChips(tags) : '';

        const folioURL = `/folios/${entry.folio.replace(/^[0|\D]*/,'')}`

        return(
            <Card className="entry" key={key}>
                <CardContent>
                    <Link onClick={e => {this.props.history.push(folioURL)}} ><Typography variant="h6">{`${entry.displayHeading} - ${entry.folio}`}</Typography></Link>
                    <Typography>Moldmaking and Metalworking</Typography>
                    <Typography>Annotations: <i>Too thin things, fol. 142v (Fu, Zhang)</i></Typography>
                    <div className="entry-chips">{mentionRow}</div>
                </CardContent>
            </Card>
        )
    }

    onClickNavigationChip = (e) => {
        const tagID = e.currentTarget.getAttribute('tagid')
        dispatchAction( this.props, 'EntryActions.toggleFilter', tagID );
    }

    onClickCardChip = (e) => {
        const tagID = e.currentTarget.getAttribute('tagid')
        // dispatchAction( this.props, 'EntryActions.toggleFilter', tagID );
    }

    renderCardChips(tags) {
        const { filterTags } = this.props.entries

        // need to display toggle state
        let chips = []
        for( let tag of tags) {
            chips.push(<Chip
                className="tag-nav-item"
                tagid={tag.id}
                key={`chip-${tag.id}`}
                color= { filterTags.includes(tag.id) ? "primary" : "default"}
                avatar={ tag.count > 0 ? <Avatar>{tag.count}</Avatar> : null }
                onClick={this.onClick}
                variant="outlined"
                label={tag.name}
            />)
        }

        return(
           chips
        )
    }

    renderNavigationChips(tags) {
        const { filterTags } = this.props.entries

        // need to display toggle state
        let chips = []
        for( let tag of tags) {
            chips.push(<Chip
                className="tag-nav-item"
                tagid={tag.id}
                key={`chip-${tag.id}`}
                color= { filterTags.includes(tag.id) ? "primary" : "default"}
                avatar={ tag.count > 0 ? <Avatar>{tag.count}</Avatar> : null }
                onClick={this.onClickNavigationChip}
                label={tag.name}
            />)
        }

        return(
           chips
        )
    }

	render() {
        if( !this.props.entries.loaded ) return null;

        const { entryList, tagNameMap } = this.props.entries
    
        const tagIDs = Object.keys(tagNameMap)
        let tags = []
        for( let tagID of tagIDs ) {
            tags.push({ id: tagID, name: tagNameMap[tagID] })
        }

        return (
            <div id="entry-list-view">
                <div className='entries'>
                    <Typography variant='h3' gutterBottom>Entries ({entryList.length})</Typography>
                    { this.renderNavigationChips(tags) }
                    <ReactList
                        itemRenderer={this.renderEntryCard}
                        length={entryList.length}
                        type='uniform'
                    />
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
