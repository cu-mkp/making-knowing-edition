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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import copyObject from './../lib/copyObject';
import { dispatchAction } from '../model/ReduxStore';


class EntryListView extends Component {

      state={
            sortBy: 'folio'
      }

      componentWillMount() {
            dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
      }

      renderAnnotationList( entry ) {
            const { annotationsByEntry, annotations } = this.props.annotations
            const annotationList = []
            const entryAnnotations = annotationsByEntry[entry['div_id']]
            if( entryAnnotations ) {
                  let odd = 0
                  for( const entryAnnotation of entryAnnotations ) {
                        const annotation = annotations[entryAnnotation]

                        const key = `${entry.id}-anno-${annotation.id}`
                        const annotationURL = `/essays/${annotation.id}`

                        let annotationItem
                        if( annotation.status ) {
                              annotationItem = (
                                    <Link 
                                          key={key} 
                                          onClick={e => {this.props.history.push(annotationURL)}} 
                                    >
                                          {annotation.name}
                                    </Link>
                              )
                        } else {
                              // if it doesn't have a status, don't link to it.
                              annotationItem = <span key={key}>{annotation.name}</span>
                        }
                        annotationList.push(annotationItem)
                        if( entryAnnotations.length > 1 && !(odd++ % 2) ) {
                              annotationList.push(<span key={`${key}-comma`}>, </span>)
                        }      
                  }
            }

            if( annotationList.length === 0 ) {
                  return null 
            } else {
                  const plural = annotationList.length > 1 ? 's' : ''
                  return (
                        <Typography>Annotation{plural}: { annotationList }</Typography>
                  )      
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
            let categories = entry['categories'].replace(/;/g,', ')
            let chips = this.renderCardChips(tags)
            const folioURL = `/folios/${entry.folio.replace(/^[0|\D]*/,'')}`
            return (
                        <ExpansionPanel className="entry" key={entry.id} onChange={this.toggleIconButton}>
                              <ExpansionPanelSummary   expandIcon={ tags.length >0 ? (<div><ExpandMoreIcon className="colapse-button" /></div>):''}>
                                    <div className={"detail-container"}>
                                          <Link onClick={e => {this.props.history.push(folioURL)}} ><Typography variant="h6">{`${entry.displayHeading} - ${entry.folio_display}`}</Typography></Link>
                                          <Typography>Category: <i>{categories}</i></Typography>
                                          { this.renderAnnotationList(entry) }
                                          <div className="entry-chips">{mentionRow}</div>
                                    </div>        
                        </ExpansionPanelSummary>

                        <ExpansionPanelDetails>
                              <div className={"detail-container"}>
                                    <div style={{marginBottom:'32px'}}>
                                          <InputLabel htmlFor="document-source">View Words Found In: </InputLabel>
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
                                                            <Fragment key={`${entry.id}-frag-${index}`}>
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
                                          }
                                    </div>
                        </ExpansionPanelDetails> 
                  </ExpansionPanel>
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
            return chips;
      }

      renderReferences(tags, entry){
            let references = [];
            for( let tag of tags ){
                  references.push( <div>{entry.text_references[tag.id]}</div>)
            }
            return references;
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
            return(chips)
      }

      handleSelectSort =( event, orderBy )=>{
            this.setState({sortBy: orderBy})
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
                              <Typography>Ms. Fr. 640 consists almost entirely of units of text under titles, which the Project has called “entries.” The List of Entries forms an index in order to browse the manuscript.</Typography><br/>
                              <Typography>Relevant terms in each entry have been encoded using fourteen semantic tags that include materials, tools, and places. For a full list of the tags and their usage, see the <a href="#/content/research+resources/principles">Principles of Encoding</a>.</Typography><br/>
                              <Typography>The list can be filtered by the semantic tags found in the entries, which can be further refined by clicking on multiple tag types.</Typography><br/>
                              <div className="sort-container">
                                   <FormLabel className="sort-label">Sorted:</FormLabel>
                                    <RadioGroup  row aria-label="Sort By" value={this.state.sortBy} onChange={this.handleSelectSort} >
                                          <FormControlLabel value="folio" control={<Radio className="sort-radio"  />} label="By Folio Number" />
                                          <FormControlLabel value="alpha" control={<Radio className="sort-radio" />} label="Alphabetically" />
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
}


function mapStateToProps(state) {
    return {
        entries: state.entries,
        annotations: state.annotations
    };
}


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


export default connect(mapStateToProps)(EntryListView);
