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

	toggleColumns = function(event){
		// Toggle toggleColumns
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
			let thisStyle = {width:(this.props.navigationState[this.props.side].width-3)};
			let thisClass = "navigationComponent "+this.props.side;
			let dropdownClass  = "dropdown";
				dropdownClass += (this.props.navigationState[this.props.side].width<460)?' hidden':'';
 			let lockIconClass = (this.props.navigationState.linkedMode)?'fa fa-lock':'fa fa-lock-open';
			if(!this.props.navigationState.bookMode){
				lockIconClass +=" active";
			}
			let bookIconClass = (this.props.navigationState.bookMode)?'fa fa-book active':'fa fa-book';
			let columnIconClass = (this.props.navigationState[this.props.side].isGridMode)?'fa fa-columns active':'fa fa-columns';
			 	columnIconClass += (this.props.navigationState[this.props.side].viewType === 'ImageView')?' hidden':'';
			return (
				<div className={thisClass} style={thisStyle}>
						<div className={dropdownClass}>
							<button className="dropbtn">
								{this.props.navigationState[this.props.side].transcriptionTypeLabel} <span className="fa fa-caret-down"></span>
							</button>
							<div className="dropdown-content">
								<span data-id='tl' onClick={this.changeType}>English Translation</span>
								<span data-id='tc' onClick={this.changeType}>French Original</span>
								<span data-id='tcn' onClick={this.changeType}>French Standard</span>
								<span data-id='facsimile' onClick={this.changeType}>Facsimile</span>
							</div>
						</div>
						<div className="breadcrumbs" style={thisStyle}>
							<span onClick={this.toggleLockmode} className={lockIconClass}></span>
							&nbsp;
							<span onClick={this.toggleBookmode} className={bookIconClass}></span>
							&nbsp;
							<span onClick={this.toggleColumns} className={columnIconClass}></span>
							&nbsp;
							<span 	onClick={this.changeCurrentFolio}
									data-id={this.props.navigationState[this.props.side].previousFolioShortID}
									data-direction="back"
									className={(this.props.navigationState[this.props.side].hasPrevious)?'arrow':'arrow disabled'}> <Icon.ArrowCircleLeft/> </span>

							<span 	onClick={this.changeCurrentFolio}
									data-id={this.props.navigationState[this.props.side].nextFolioShortID}
									data-direction="forward"
									className={(this.props.navigationState[this.props.side].hasNext)?'arrow':'arrow disabled'}> <Icon.ArrowCircleRight/></span>
							&nbsp;&nbsp;
							{this.props.navigationState[this.props.side].currentDocumentName} / Folios / <span className="folioName">{this.props.navigationState[this.props.side].currentFolioName}</span>
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
