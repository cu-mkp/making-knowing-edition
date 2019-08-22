import React from 'react';
import {connect} from 'react-redux';
import {Icon} from "react-font-awesome-5";

import JumpToFolio from './JumpToFolio';
import DocumentHelper from '../model/DocumentHelper';

class navigation extends React.Component {

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
			popoverY:-1
		}
	}
	onJumpBoxBlur = function(event){
		this.setState({popoverVisible:false})
	}

	// Onclick event handlers, bound to "this" via constructor above
	changeType = function (event) {
		// Change viewtype
		this.props.documentViewActions.changeTranscriptionType(
			this.props.side,
			event.currentTarget.dataset.id
		);
	}

	toggleBookmode = function(event){

		// If we are transitioning into bookmode, synch up the panes
		if(!this.props.documentView.bookMode === true){
			this.props.documentViewActions.changeCurrentFolio(
				this.props.documentView.left.iiifShortID,
				'left',
				this.props.documentView.left.transcriptionType,
				event.currentTarget.dataset.direction				
			);

			this.props.documentViewActions.changeCurrentFolio(
				this.props.documentView.left.nextFolioShortID,
				'right',
				this.props.documentView.left.transcriptionType,
				event.currentTarget.dataset.direction			
			);
		}

		// Toggle bookmode
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

		// If we are currently in bookmode, we toggle that instead
		if(this.props.documentView.bookMode){
			this.toggleBookmode();
			return;
		}

		// If we are transitioning from unlocked to locked, synch up the panes
		if(!this.props.documentView.linkedMode === true){
			if(this.props.side === 'left'){
				this.props.documentViewActions.changeCurrentFolio(
					this.props.documentView.left.iiifShortID,
					'right',
					this.props.documentView.left.transcriptionType,
					event.currentTarget.dataset.direction					
				);
			}else{
				this.props.documentViewActions.changeCurrentFolio(
					this.props.documentView.right.iiifShortID,
					'left',
					this.props.documentView.right.transcriptionType,
					event.currentTarget.dataset.direction					
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
			this.props.documentView[this.props.side].transcriptionType,
			event.currentTarget.dataset.direction			
		);
	}

	// Display the jump navigation
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
			let recommendedWidth=(this.props.documentView[this.props.side].width-7);
			let thisStyle = {'width':recommendedWidth,'maxWidth':recommendedWidth};
			let thisClass = "navigationComponent "+this.props.side;
			let dropdownClass  = "dropdown";
				dropdownClass += (this.props.documentView[this.props.side].width<500)?' invisible':'';
 			let lockIconClass = (this.props.documentView.linkedMode)?'fa fa-lock':'fa fa-lock-open';
			if(!this.props.documentView.bookMode){
				lockIconClass +=" active";
			}
			let imageViewActive = this.props.documentView[this.props.side].transcriptionType === 'f';
			let bookIconClass = (this.props.documentView.bookMode)?'fa fa-book active':'fa fa-book';
			let xmlIconClass = (this.props.documentView[this.props.side].isXMLMode)?'fa fa-code active':'fa fa-code';
			let columnIconClass = (this.props.documentView[this.props.side].isGridMode)?'fa fa-columns active':'fa fa-columns';
				 columnIconClass += (imageViewActive)?' hidden':'';
			let transcriptionTypeLabel = DocumentHelper.transcriptionTypeLabels[this.props.documentView[this.props.side].transcriptionType];
			let folioName = this.props.document.folioNameByIDIndex[this.props.documentView[this.props.side].iiifShortID];
			let jumpToIconStyle = (imageViewActive) ? { color: 'white'} : { color: 'black' };
			return (
				<div className={thisClass} style={thisStyle}>
						<div className={dropdownClass}>
							<button className="dropbtn">
								{transcriptionTypeLabel} <span className="fa fa-caret-down"></span>
							</button>
							<div className="dropdown-content">
								<span data-id='tl' onClick={this.changeType}>{DocumentHelper.transcriptionTypeLabels['tl']}</span>
								<span data-id='tc' onClick={this.changeType}>{DocumentHelper.transcriptionTypeLabels['tc']}</span>
								<span data-id='tcn' onClick={this.changeType}>{DocumentHelper.transcriptionTypeLabels['tcn']}</span>
								<span data-id='f' onClick={this.changeType}>{DocumentHelper.transcriptionTypeLabels['f']}</span>
								<span data-id='glossary' onClick={this.changeType}>{DocumentHelper.transcriptionTypeLabels['glossary']}</span>
							</div>
						</div>
						<div className="breadcrumbs" style={thisStyle}>
							<span title="Toggle coordination of views" onClick={this.toggleLockmode} className={(this.props.documentView.inSearchMode)?'invisible':lockIconClass}></span>
							&nbsp;
							<span title="Toggle book mode" onClick={this.toggleBookmode} className={(this.props.documentView.inSearchMode)?'invisible':bookIconClass}></span>
							&nbsp;
							<span title="Toggle XML mode" onClick={this.toggleXMLMode} className={(this.props.documentView.inSearchMode || imageViewActive )?'invisible':xmlIconClass}></span>
							&nbsp;
							<span title="Toggle single column mode"  onClick={this.toggleColumns} className={(this.props.documentView.inSearchMode)?'invisible':columnIconClass}></span>
							&nbsp;
							<span 	title = "Go back"
									onClick={this.changeCurrentFolio}
									data-id={this.props.documentView[this.props.side].previousFolioShortID}
									data-direction="back"
									className={(this.props.documentView[this.props.side].hasPrevious)?'arrow':'arrow disabled'}> <Icon.ArrowCircleLeft/> </span>

							<span 	title = "Go forward"
									onClick={this.changeCurrentFolio}
									data-id={this.props.documentView[this.props.side].nextFolioShortID}
									data-direction="forward"
									className={(this.props.documentView[this.props.side].hasNext)?'arrow':'arrow disabled'}> <Icon.ArrowCircleRight/></span>
							&nbsp;&nbsp;
							{this.props.documentView[this.props.side].currentDocumentName} / Folios / <div onClick={this.revealJumpBox} className="folioName">{folioName} <span style={jumpToIconStyle} className="fa fa-hand-point-right"></span></div> 
						</div>
						<JumpToFolio side={this.props.side}
									 isVisible={this.state.popoverVisible}
									 positionX={this.state.popoverX}
									 positionY={this.state.popoverY}
									 submitHandler={this.props.documentViewActions.jumpToFolio}
									 blurHandler={this.onJumpBoxBlur}/>
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


export default connect(mapStateToProps)(navigation);
