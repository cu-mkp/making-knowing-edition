import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactList from 'react-list';
import {Typography, Card, Chip, Avatar, FormLabel, RadioGroup, Radio, FormControlLabel} from '@material-ui/core';
import { CardContent, Link } from '@material-ui/core';
import  copyObject  from './../lib/copyObject'

import { dispatchAction } from '../model/ReduxStore';

function isValidChar( str) {
      let code = str.charCodeAt(0)
      if (!(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
      }else
      return true;

}
function stripNonAlphaNumeric( strInput){
      if(!strInput)
      return strInput;
     while ( ! isValidChar(strInput)) {
       strInput = strInput.substring(1);
     }
      return strInput;
}

class EntryListView extends Component {

      state={
            sortBy: 'alpha'
      }

      handleSelectSort =( event, orderBy )=>{
            this.setState({sortBy: orderBy})
      }

    

      sortEntryList = ( listToSort )=>{
            let unsorted = copyObject(listToSort)
            let trimmed = unsorted.map( item =>{
                  item.heading_tl = stripNonAlphaNumeric(item.heading_tl)
                 return item;
            })

            function compareHeaders(a, b ) {
                 
                  if(a.heading_tl.toUpperCase()> b.heading_tl.toUpperCase())
                        return 1;
                  else if ( a.heading_tl.toUpperCase() < b.heading_tl.toUpperCase())
                        return -1;
                  else 
                        return 0;
            }
            function compareFolios(a, b) {
                  if(a.folio > b.folio)
                        return 1;
                  else if ( a.folio < b.folio)
                        return -1;
                  else 
                        return 0;
            }

            switch( this.state.sortBy) {
                  case "alpha":
                        return trimmed.sort(compareHeaders)
                  case "folio":
                        return trimmed.sort(compareFolios)
                  default:
                        return trimmed.sort(compareHeaders)

            }
      }

      componentWillMount() {
            dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
      }

      renderEntryCard = (index, key) => {        
            const { entryList, tagNameMap } = this.props.entries
            const sortedList = this.sortEntryList(entryList);
            const entry = sortedList[index]
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
            // const tagID = e.currentTarget.getAttribute('tagid')
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
            if( !this.props.entries.loaded ) 
                  return null;

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
                              <div className="sort-container">
                                   <FormLabel className="sort-label">Sorted:</FormLabel>
                                    <RadioGroup  row aria-label="Sort By" value={this.state.sortBy} onChange={this.handleSelectSort} >
                                          <FormControlLabel value="alpha" control={<Radio className="sort-radio" />} label="Alphabetically" />
                                          <FormControlLabel value="folio" control={<Radio className="sort-radio"  />} label="By Folio Number" />
                                    </RadioGroup>
                              </div> 
                              { this.renderNavigationChips(tags) }
                              <ReactList
                                    itemRenderer={this.renderEntryCard}
                                    length={entryList.length}
                                    type='variable'
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
