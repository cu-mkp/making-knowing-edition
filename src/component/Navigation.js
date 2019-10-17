import React from 'react';
import {connect} from 'react-redux';
import {Icon} from "react-font-awesome-5";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import JumpToFolio from './JumpToFolio';
import DocumentHelper from '../model/DocumentHelper';
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

class Navigation extends React.Component {

	constructor(props,context){
		super(props,context);
		this.changeType = this.changeType.bind(this);
		this.revealJumpBox = this.revealJumpBox.bind(this);
		this.onJumpBoxBlur = this.onJumpBoxBlur.bind(this);
		this.toggleLockmode = this.toggleLockmode.bind(this);
		this.toggleBookmode = this.toggleBookmode.bind(this);
		this.toggleXMLMode = this.toggleXMLMode.bind(this);
		this.toggleColumns = this.toggleColumns.bind(this);
		this.changeCurrentFolio = this.changeCurrentFolio.bind(this);

		this.state={
			popoverVisible:false,
			popoverX:-1,
                  popoverY:-1,
                  anchorEl:null,
                  openHelp: false,
		}
      }
      
	onJumpBoxBlur = function(event){
		this.setState({popoverVisible:false})
	}

	changeType = (event) =>{
		this.props.documentViewActions.changeTranscriptionType(
			this.props.side,
			event.target.value
            );
      }
      
      toggleHelp=(event)=>{
            this.setState({
                  anchorEl:event.currentTarget,
                  openHelp:!this.state.openHelp
            })
      }

	toggleBookmode = function(event){
		if(!this.props.documentView.bookMode === true){
			this.props.documentViewActions.changeCurrentFolio(
				this.props.documentView.left.iiifShortID,
				'left',
				this.props.documentView.left.transcriptionType		
			);

			this.props.documentViewActions.changeCurrentFolio(
				this.props.documentView.left.nextFolioShortID,
				'right',
				this.props.documentView.left.transcriptionType	
			);
		}

		this.props.documentViewActions.setBookMode(
			this.props.documentView.left.iiifShortID, 
			!this.props.documentView.bookMode
		);
	}

	toggleXMLMode = function(event){
		this.props.documentViewActions.setXMLMode(
			this.props.side, 
			!this.props.documentView[this.props.side].isXMLMode
		);
	}

	// aka gridMode
	toggleColumns = function(event){
		this.props.documentViewActions.setGridMode(
			this.props.side, 
			!this.props.documentView[this.props.side].isGridMode			
		);
	}

	toggleLockmode = function(event){
		if(this.props.documentView.bookMode){
			this.toggleBookmode();
			return;
		}

		// If we are transitioning from unlocked to locked, synch up the panes
		if(this.props.documentView.linkedMode === false){
			if(this.props.side === 'left'){
				this.props.documentViewActions.changeCurrentFolio(
					this.props.documentView.left.iiifShortID,
					'right',
					this.props.documentView.right.transcriptionType			
				);
			}else{
				this.props.documentViewActions.changeCurrentFolio(
					this.props.documentView.right.iiifShortID,
					'left',
					this.props.documentView.left.transcriptionType			
				);
			}
		}

		// Set lock
		this.props.documentViewActions.setLinkedMode(
			!this.props.documentView.linkedMode
		);
	}

	changeCurrentFolio = (event) => {
		if(typeof event.currentTarget.dataset.id === 'undefined' || event.currentTarget.dataset.id.length === 0){
			return;
		}
		console.log(event.currentTarget.dataset.id);
		let longID = DocumentHelper.folioURL(event.currentTarget.dataset.id);
		this.props.documentViewActions.changeCurrentFolio(
			longID,
			this.props.side,
			this.props.documentView[this.props.side].transcriptionType
		);
	}

	revealJumpBox = function(event){
		this.setState({
			popoverVisible:true,
			popoverX:event.clientX,
			popoverY:event.clientY
		});
	}

	renderData(item) {
        return <div key={item.id}>{item.name}</div>;
      }

      render() {

            if(!this.props.documentView){
                  return (
                  <div>
                        Unknown Transcription Type
                  </div>
                  )
            }else{
                        let recommendedWidth=(this.props.documentView[this.props.side].width-8);// the divder is 16 px wide so each side is minus 8
                        let widthStyle = {'width':recommendedWidth,'maxWidth':recommendedWidth};
                        let selectContainerStyle  = (this.props.documentView[this.props.side].width<500)? {display:'none'} : {display:'flex'}
                        let selectColorStyle = this.props.documentView[this.props.side].transcriptionType === "f" ? {color: 'white'}:{color:'black'};
                        let showButtonsStyle = this.props.documentView[this.props.side].transcriptionType === "glossary" ? {visibility:'hidden'} : {visibility:'visible'}

                        let lockIconClass = (this.props.documentView.linkedMode)?'fa fa-lock':'fa fa-lock-open';
                        if(!this.props.documentView.bookMode){
                              lockIconClass +=" active";
                        }
                        let imageViewActive = this.props.documentView[this.props.side].transcriptionType === 'f';
                        let bookIconClass = (this.props.documentView.bookMode)?'fa fa-book active':'fa fa-book';
                        let xmlIconClass = (this.props.documentView[this.props.side].isXMLMode)?'fa fa-code active':'fa fa-code';
                        let columnIconClass = (this.props.documentView[this.props.side].isGridMode)?'fa fa-columns active':'fa fa-columns';
                              columnIconClass += (imageViewActive)?' hidden':'';
                        let folioName = this.props.document.folioNameByIDIndex[this.props.documentView[this.props.side].iiifShortID];
                        let jumpToIconStyle = (imageViewActive) ? { color: 'white'} : { color: 'black' };
                        return (
                              <div className="navigationComponent" style={widthStyle}>
                                    <div id="navigation-row" className="navigationRow">

                                          <div id="tool-bar-buttons" className="breadcrumbs" style={showButtonsStyle}> 
                                                <span title="Toggle coordination of views" onClick={this.toggleLockmode} 
                                                      className={(this.props.documentView.inSearchMode)?'invisible':lockIconClass}></span>
                                                &nbsp;
                                                <span title="Toggle book mode" onClick={this.toggleBookmode} 
                                                      className={(this.props.documentView.inSearchMode)?'invisible':bookIconClass}></span>
                                                &nbsp;
                                                <span title="Toggle XML mode" onClick={this.toggleXMLMode} 
                                                      className={(this.props.documentView.inSearchMode || imageViewActive )?'invisible':xmlIconClass}></span>
                                                &nbsp;
                                                <span title="Toggle single column mode"  onClick={this.toggleColumns} 
                                                      className={(this.props.documentView.inSearchMode)?'invisible':columnIconClass}></span>
                                                &nbsp;
                                                <span 	title = "Go back"
                                                            onClick={this.changeCurrentFolio}
                                                            data-id={this.props.documentView[this.props.side].previousFolioShortID}
                                                            className={(this.props.documentView[this.props.side].hasPrevious)?'arrow':'arrow disabled'}> <Icon.ArrowCircleLeft/> </span>

                                                <span 	title = "Go forward"
                                                            onClick={this.changeCurrentFolio}
                                                            data-id={this.props.documentView[this.props.side].nextFolioShortID}
                                                            className={(this.props.documentView[this.props.side].hasNext)?'arrow':'arrow disabled'}> <Icon.ArrowCircleRight/></span>
                                                &nbsp;&nbsp;
                                                {this.props.documentView[this.props.side].currentDocumentName} / Folios / <div onClick={this.revealJumpBox} 
                                                      className="folioName">{folioName} <span style={jumpToIconStyle} className="fa fa-hand-point-right"></span></div> 
                                          
                                                <JumpToFolio side={this.props.side}
                                                            isVisible={this.state.popoverVisible}
                                                            positionX={this.state.popoverX}
                                                            positionY={this.state.popoverY}
                                                            submitHandler={this.props.documentViewActions.jumpToFolio}
                                                            blurHandler={this.onJumpBoxBlur}/>
                                          </div>
                                          
                                          <div id="doc-type-help" style={selectContainerStyle}>
                                                <Select className="dropdownV2" style={selectColorStyle} 
                                                      value={this.props.documentView[this.props.side].transcriptionType} id="doc-type" onClick={this.changeType}>
                                                      <MenuItem value="tl">{DocumentHelper.transcriptionTypeLabels['tl']}</MenuItem>
                                                      <MenuItem value="tc">{DocumentHelper.transcriptionTypeLabels['tc']}</MenuItem>
                                                      <MenuItem value="tcn">{DocumentHelper.transcriptionTypeLabels['tcn']}</MenuItem>
                                                      <MenuItem value="f">{DocumentHelper.transcriptionTypeLabels['f']}</MenuItem>
                                                      <MenuItem value="glossary">{DocumentHelper.transcriptionTypeLabels['glossary']}</MenuItem>
                                                </Select>

                                                <Popper  anchorEl={this.state.anchorEl} open={this.state.openHelp}>
                                                      <Fade in={this.state.openHelp}>
                                                                  <Paper className="helpContainer">
                                                                        <div onClick={this.toggleHelp} className="closeX">
                                                                              <span className="fa fa-window-close" ></span>
                                                                        </div>
                                                                  <div className="helpHeader">
                                                                        <Typography variant="subtitle1">Toolbar Buttons</Typography>
                                                                  </div>
                                                                  <div>
                                                                        <List>
                                                                                    <ListItem button>
                                                                                          <span class='fa fa-lock active'></span>
                                                                                          <ListItemText primary="Toggle Sync Views" />
                                                                                    </ListItem>
                                                                                    <ListItem button>
                                                                                          <span class='fa fa-book active'></span>
                                                                                          <ListItemText primary="Toggle Book Mode" />
                                                                                    </ListItem>
                                                                                    <ListItem button>
                                                                                          <span class='fa fa-code active'></span>
                                                                                          <ListItemText primary="Toggle XML Mode" />
                                                                                    </ListItem>
                                                                                    <ListItem button>
                                                                                          <span class='fa fa-columns active'></span>
                                                                                          <ListItemText primary="Toggle Single Column Mode" />
                                                                                    </ListItem>
                                                                                    <ListItem button>
                                                                                    <span><Icon.ArrowCircleLeft/><Icon.ArrowCircleRight/></span>
                                                                                          <ListItemText primary="Go Forward / Back" />
                                                                                    </ListItem>
                                                                                    <ListItem button>
                                                                                          <span class='fa fa-hand-point-right active'></span>
                                                                                          <ListItemText primary="Jump to folio" />
                                                                                    </ListItem>
                                                                              </List>
                                                                        </div>
                                                                  </Paper>
                                                      </Fade>      
                                                </Popper>

                                                <span title="Toggle folio help" onClick={this.toggleHelp} className="helpIcon" >
                                                      <i class="fas fa-question-circle"></i>
                                                </span> 
      
                                          </div>
                                    </div>
                                    
                              </div>
                        )

            }
      }
}


function mapStateToProps(state) {
	return {
		document: state.document
    };
}


export default connect(mapStateToProps)(Navigation);
