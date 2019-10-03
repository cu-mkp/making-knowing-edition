import React, {Component,Fragment, useState, useEffect} from 'react';
import {connect} from 'react-redux';
import ReactList from 'react-list';
import {Typography, Card, Chip, Avatar } from '@material-ui/core';
import { CardContent, Link } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import { dispatchAction } from '../model/ReduxStore';



const ExpandToggleButton = (props) =>{
      useEffect(()=>{
            setExpanded(props.isExpanded)
      } ,[props.isExpanded] )
      let [expanded, setExpanded] = useState(props.isExpanded);
    
   let b = expanded === false ? (<div ><div style={{float:'right',textAlign:'center',backgroundColor:'gainsboro',width:'40px',borderRadius:'20px'}}>
         <ExpandMoreIcon style={{color:'white', margin:'5px' }}/></div>
   </div>):  (<div ><ExpandMoreIcon className="colapse-button" /></div>);
    return b;
}



const EntryCard = ( props )=>{
      const[isExpanded, setIsExpanded] = useState(false)
      const entry = props.entry
      const folioURL = `/folios/${entry.folio.replace(/^[0|\D]*/,'')}`

      function toggleIconButton(event, boolExpanded){
            setIsExpanded(boolExpanded)
      }
    
      return(
                    <ExpansionPanel className="entry" key={entry.id} onChange={toggleIconButton}>
                          <ExpansionPanelSummary >
                                <div className={"detail-container"}>
                                      <Link onClick={e => {this.props.history.push(folioURL)}} ><Typography variant="h6">{`${entry.displayHeading} - ${entry.folio}`}</Typography></Link>
                                      <Typography>Moldmaking and Metalworking</Typography>
                                     <Typography>Annotations: <i>Too thin things, fol. 142v (Fu, Zhang)</i></Typography>
                                      <div className="entry-chips">{props.mentionRow}</div>
                                      <ExpandToggleButton  isExpanded={isExpanded}  />
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
                                    props.tags.map((tag,index)=>{
                                           return (
                                                 <Fragment>
                                                      <div className={"detail-row"}> 
                                                                  <div className={"chip-column"}> {props.chips[index]} </div> 
                                                                  <div className={"reference-column"}>
                                                                        <Typography variant="subtitle2">{props.entry.text_references[tag.id]} </Typography>
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


class EntryListView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
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

      return (
            <EntryCard entry={entry} tags = {tags} mentionRow = {mentionRow} chips={chips} />
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
