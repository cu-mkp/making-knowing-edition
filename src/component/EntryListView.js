import React, {Component,Fragment} from 'react';
import {connect} from 'react-redux';
import ReactList from 'react-list';
import {Typography,  Chip, Avatar } from '@material-ui/core';
import { Link } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
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
     while ( ! isValidChar(strInput)) {
      return strInput;
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
    renderEntryCard = (index, key) => {        
      const { entryList, tagNameMap } = this.props.entries
      const entry = entryList[index];
      let tags = [];
      for( let tagID of Object.keys(tagNameMap) ) {
          if( entry.mentions[tagID] > 0 ) {
              tags.push({ id: tagID, name: tagNameMap[tagID], count: entry.mentions[tagID]})
          }
      }
      let mentionRow = ( tags.length > 0 ) ? this.renderCardChips(tags) : '';
      let chips = this.renderCardChips(tags)
      
      const folioURL = `/folios/${entry.folio.replace(/^[0|\D]*/,'')}`
      return (
                  <ExpansionPanel className="entry" key={entry.id} onChange={this.toggleIconButton}>
                        <ExpansionPanelSummary   expandIcon={<div><ExpandMoreIcon className="colapse-button" /></div>}>
                              <div className={"detail-container"}>
                                    <Link onClick={e => {this.props.history.push(folioURL)}} ><Typography variant="h6">{`${entry.displayHeading} - ${entry.folio}`}</Typography></Link>
                                    <Typography>Moldmaking and Metalworking</Typography>
                                   <Typography>Annotations: <i>Too thin things, fol. 142v (Fu, Zhang)</i></Typography>
                                    <div className="entry-chips">{this.props.mentionRow}</div>
                                   
                              </div>        
                     
                      </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                       <div className={"detail-container"}>
                                   <InputLabel htmlFor="document-source">View Words Found In: </InputLabel>
                             <div style={{marginBottom:'32px'}}>
                                   <Select value={'tc'} style={{marginLeft:'12px',width:'170px'}} disabled={true}>
                                         <MenuItem value={'tc'} selected={true}>Diplomatic (FR)</MenuItem>
                                         <MenuItem value={'tcn'}>Normalized (FR)</MenuItem>
                                         <MenuItem value={'tl'}>Translation (EN)</MenuItem>
                                   </Select>
                             </div>
                             <div className={"detail-header"}> 
                                   <div className={"chip-column"}> <Typography variant="subtitle1">Word Category</Typography></div> 
                                   <div className={"reference-column"}> <Typography variant="subtitle1">References in this entry</Typography> </div>
                             </div>
                             {
                                  tags.map((tag,index)=>{
                                         return (
                                               <Fragment>
                                                    <div className={"detail-row"}> 
                                                                <div className={"chip-column"}> {chips[index]} </div> 
                                                                <div className={"reference-column"}>
                                                                      <Typography variant="subtitle2">{entry.text_references[tag.id]} </Typography>
                                                    </div>
                                                                </div>
                                                    <div className={"row-divider"} ></div>
                                               </Fragment>
                                         )
                                   })
                       </div>
                  </ExpansionPanelDetails> 
                            }
                </ExpansionPanel>
      )
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
                  else 
                        return -1;
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

      onClickCardChip = (e) => {
            // const tagID = e.currentTarget.getAttribute('tagid')
            // dispatchAction( this.props, 'EntryActions.toggleFilter', tagID );
      }

    renderNavigationChips(tags) {
        const { filterTags } = this.props.entries

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
