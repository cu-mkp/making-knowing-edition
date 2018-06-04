import React from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from './actions/navigationStateActions';
import {Icon} from "react-font-awesome-5";

class navigation extends React.Component {

	constructor(props,context){
		super(props,context);
		this.changeType = this.changeType.bind(this);
		this.toggleLockmode = this.toggleLockmode.bind(this);
		this.toggleBookmode = this.toggleBookmode.bind(this);
		this.toggleXMLMode = this.toggleXMLMode.bind(this);
		this.toggleColumns = this.toggleColumns.bind(this);
		this.changeCurrentFolio = this.changeCurrentFolio.bind(this);
		this.navigationStateActions=navigationStateActions;
	}


	// Onclick event handlers, bound to "this" via constructor above
	changeType = function (event) {
		// Change viewtype
		this.props.dispatch(this.navigationStateActions.changeTranscriptionType({side:this.props.side,transcriptionType:event.currentTarget.dataset.id}));
	}

	toggleBookmode = function(event){

		// If we are transitioning into bookmode, synch up the panes
		if(!this.props.navigationState.bookMode === true){
			this.props.dispatch(this.navigationStateActions.changeCurrentFolio({side:'left',id:this.props.navigationState.left.currentFolioID,direction:event.currentTarget.dataset.direction}));

			let longID = this.props.navigationState.folioIDPrefix+this.props.navigationState.right.nextFolioShortID;
			this.props.dispatch(this.navigationStateActions.changeCurrentFolio({side:'left',id:longID,direction:event.currentTarget.dataset.direction}));

		}

		// Toggle bookmode
		this.props.dispatch(this.navigationStateActions.setBookMode({shortid:this.props.navigationState.left.currentFolioShortID, status:!this.props.navigationState.bookMode}));

	}

	toggleXMLMode = function(event){
		this.props.dispatch(this.navigationStateActions.setXMLMode({side:this.props.side, newState:!this.props.navigationState[this.props.side].isXMLMode}));
	}

	// aka gridMode
	toggleColumns = function(event){
		this.props.dispatch(this.navigationStateActions.setColumnModeForSide({side:this.props.side, newState:!this.props.navigationState[this.props.side].isGridMode}));
	}

	toggleLockmode = function(event){

		// If we are currently in bookmode, we toggle that instead
		if(this.props.navigationState.bookMode){
			this.toggleBookmode();
			return;
		}

		// If we are transitioning from unlocked to locked, synch up the panes
		if(!this.props.navigationState.linkedMode === true){
			if(this.props.side === 'left'){
				this.props.dispatch(this.navigationStateActions.changeCurrentFolio({side:'right',id:this.props.navigationState.left.currentFolioID,direction:event.currentTarget.dataset.direction}));
			}else{
				this.props.dispatch(this.navigationStateActions.changeCurrentFolio({side:'left',id:this.props.navigationState.right.currentFolioID,direction:event.currentTarget.dataset.direction}));
			}
		}

		// Set lock
		this.props.dispatch(this.navigationStateActions.setLinkedMode(!this.props.navigationState.linkedMode));

	}

	changeCurrentFolio = function(event){
		if(typeof event.currentTarget.dataset.id === 'undefined' || event.currentTarget.dataset.id.length === 0){
			return;
		}
		let longID = this.props.navigationState.folioIDPrefix+event.currentTarget.dataset.id;
		this.props.dispatch(this.navigationStateActions.changeCurrentFolio({side:this.props.side,id:longID,direction:event.currentTarget.dataset.direction}));

	}

    renderData(item) {
        return <div key={item.id}>{item.name}</div>;
    }


    render() {

        if(!this.props.navigationState){
            return (
                <div>
                    Unknown Transcription Type
                </div>
            )
        }else{
			let recommendedWidth=(this.props.navigationState[this.props.side].width-7);
			let thisStyle = {'width':recommendedWidth,'maxWidth':recommendedWidth};
			let thisClass = "navigationComponent "+this.props.side;
			let dropdownClass  = "dropdown";
				dropdownClass += (this.props.navigationState[this.props.side].width<500)?' invisible':'';
 			let lockIconClass = (this.props.navigationState.linkedMode)?'fa fa-lock':'fa fa-lock-open';
			if(!this.props.navigationState.bookMode){
				lockIconClass +=" active";
			}
			let imageViewActive = this.props.navigationState[this.props.side].viewType === 'ImageView';
			let bookIconClass = (this.props.navigationState.bookMode)?'fa fa-book active':'fa fa-book';
			let xmlIconClass = (this.props.navigationState[this.props.side].isXMLMode)?'fa fa-code active':'fa fa-code';
			let columnIconClass = (this.props.navigationState[this.props.side].isGridMode)?'fa fa-columns active':'fa fa-columns';
			 	columnIconClass += (imageViewActive)?' hidden':'';
			return (
				<div className={thisClass} style={thisStyle}>
						<div className={dropdownClass}>
							<button className="dropbtn">
								{this.props.navigationState[this.props.side].transcriptionTypeLabel} <span className="fa fa-caret-down"></span>
							</button>
							<div className="dropdown-content">
								<span data-id='tl' onClick={this.changeType}>{this.props.navigationState.uiLabels.transcriptionType['tl']}</span>
								<span data-id='tc' onClick={this.changeType}>{this.props.navigationState.uiLabels.transcriptionType['tc']}</span>
								<span data-id='tcn' onClick={this.changeType}>{this.props.navigationState.uiLabels.transcriptionType['tcn']}</span>
								<span data-id='f' onClick={this.changeType}>{this.props.navigationState.uiLabels.transcriptionType['f']}</span>
							</div>
						</div>
						<div className="breadcrumbs" style={thisStyle}>
							<span title="Lock/Unlock" onClick={this.toggleLockmode} className={(this.props.navigationState.search.inSearchMode)?'invisible':lockIconClass}></span>
							&nbsp;
							<span title="Toggle book mode" onClick={this.toggleBookmode} className={(this.props.navigationState.search.inSearchMode)?'invisible':bookIconClass}></span>
							&nbsp;
							<span title="Toggle XML mode" onClick={this.toggleXMLMode} className={(this.props.navigationState.search.inSearchMode || imageViewActive )?'invisible':xmlIconClass}></span>
							&nbsp;
							<span title="Toggle single column mode"  onClick={this.toggleColumns} className={(this.props.navigationState.search.inSearchMode)?'invisible':columnIconClass}></span>
							&nbsp;
							<span 	title = "Go back"
									onClick={this.changeCurrentFolio}
									data-id={this.props.navigationState[this.props.side].previousFolioShortID}
									data-direction="back"
									className={(this.props.navigationState[this.props.side].hasPrevious)?'arrow':'arrow disabled'}> <Icon.ArrowCircleLeft/> </span>

							<span 	title = "Go forward"
									onClick={this.changeCurrentFolio}
									data-id={this.props.navigationState[this.props.side].nextFolioShortID}
									data-direction="forward"
									className={(this.props.navigationState[this.props.side].hasNext)?'arrow':'arrow disabled'}> <Icon.ArrowCircleRight/></span>
							&nbsp;&nbsp;
							{this.props.navigationState[this.props.side].currentDocumentName} / Folios / <div className="folioName">{this.props.navigationState[this.props.side].currentFolioName}</div>
						</div>
				</div>
			)

        }
    }
}

function mapStateToProps(state) {
	return {
        navigationState: state.navigationState
    };
}


export default connect(mapStateToProps)(navigation);
