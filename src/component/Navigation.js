import React from 'react';
import {connect} from 'react-redux';
import {dispatchAction} from '../model/ReduxStore';
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
		dispatchAction( 
			this.props,
			'DocumentViewActions.changeTranscriptionType',
			this.props.side,
			event.currentTarget.dataset.id
		);			
	}

	toggleBookmode = function(event){

		// If we are transitioning into bookmode, synch up the panes
		if(!this.props.documentView.bookMode === true){
			dispatchAction(
				this.props,
				'DocumentViewActions.changeCurrentFolio',
				this.props.document,
				this.props.documentView.left.currentFolioID,
				'left',
				this.props.documentView.left.transcriptionType,
				event.currentTarget.dataset.direction				
			)

			let longID = DocumentHelper.folioURL(this.props.documentView.right.nextFolioShortID);
			dispatchAction(
				this.props,
				'DocumentViewActions.changeCurrentFolio',
				this.props.document,
				longID,
				'left',
				this.props.documentView.left.transcriptionType,
				event.currentTarget.dataset.direction
			);
		}

		// Toggle bookmode
		dispatchAction(
			this.props,
			'DocumentViewActions.setBookMode',
			this.props.document,
			this.props.documentView.left.currentFolioShortID, 
			!this.props.documentView.bookMode
		);
	}

	toggleXMLMode = function(event){
		dispatchAction( 
			this.props, 
			'DocumentViewActions.setXMLMode', 
			this.props.side, 
			!this.props.documentView[this.props.side].isXMLMode
		)
	}

	// aka gridMode
	toggleColumns = function(event){
		dispatchAction(
			this.props,
			'DocumentViewActions.setColumnModeForSide',
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
				dispatchAction( 
					this.props,
					'DocumentViewActions.changeCurrentFolio',
					this.props.document,
					this.props.documentView.left.currentFolioID,
					'right',
					this.props.documentView.left.transcriptionType,
					event.currentTarget.dataset.direction					
				);
			}else{
				dispatchAction(
					this.props,
					'DocumentViewActions.changeCurrentFolio',
					this.props.document,
					this.props.documentView.right.currentFolioID,
					'left',
					this.props.documentView.right.transcriptionType,
					event.currentTarget.dataset.direction					
				);
			}
		}

		// Set lock
		dispatchAction(
			this.props,
			'DocumentViewActions.setLinkedMode',
			!this.props.documentView.linkedMode
		);
	}

	changeCurrentFolio = function(event){
		if(typeof event.currentTarget.dataset.id === 'undefined' || event.currentTarget.dataset.id.length === 0){
			return;
		}
		console.log(event.currentTarget.dataset.id);
		let longID = DocumentHelper.folioURL(event.currentTarget.dataset.id);
		dispatchAction(
			this.props,
			'DocumentViewActions.changeCurrentFolio',
			this.props.document,
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

	// User has requested a jump
	jumpToFolio(folioName){
		// Convert folioName to ID (and confirm it exists)
		let folioID = this.props.document.folioIDByNameIndex[folioName];
		if(typeof folioID !== 'undefined'){
			let longID = DocumentHelper.folioURL(folioID);
			dispatchAction(
				this.props,
				'DocumentViewActions.changeCurrentFolio',
				this.props.document,
				longID,
				this.props.side
			);
		}
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
			let imageViewActive = this.props.documentView[this.props.side].viewType === 'ImageView';
			let bookIconClass = (this.props.documentView.bookMode)?'fa fa-book active':'fa fa-book';
			let xmlIconClass = (this.props.documentView[this.props.side].isXMLMode)?'fa fa-code active':'fa fa-code';
			let columnIconClass = (this.props.documentView[this.props.side].isGridMode)?'fa fa-columns active':'fa fa-columns';
				 columnIconClass += (imageViewActive)?' hidden':'';
			let transcriptionTypeLabel = DocumentHelper.transcriptionTypeLabels[this.props.documentView[this.props.side].transcriptionType];
			let folioName = this.props.document.folioNameByIDIndex[this.props.documentView[this.props.side].currentFolioShortID];
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
							</div>
						</div>
						<div className="breadcrumbs" style={thisStyle}>
							<span title="Lock/Unlock" onClick={this.toggleLockmode} className={(this.props.documentView.inSearchMode)?'invisible':lockIconClass}></span>
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
							{this.props.documentView[this.props.side].currentDocumentName} / Folios / <div onClick={this.revealJumpBox} className="folioName">{folioName}</div>
						</div>
						<JumpToFolio side={this.props.side}
									 isVisible={this.state.popoverVisible}
									 positionX={this.state.popoverX}
									 positionY={this.state.popoverY}
									 submitHandler={this.jumpToFolio.bind(this)}
									 blurHandler={this.onJumpBoxBlur}/>
				</div>
			)

        }
    }
}


function mapStateToProps(state) {
	return {
		document: state.document,
		documentView: state.documentView
    };
}


export default connect(mapStateToProps)(navigation);
