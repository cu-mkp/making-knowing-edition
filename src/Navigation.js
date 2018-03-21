import React from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from './actions/navigationStateActions';
import {Icon} from "react-font-awesome-5";


class navigation extends React.Component {

	constructor(props,context){
		super(props,context);
		this.changeType = this.changeType.bind(this);
		this.changeCurrentFolio = this.changeCurrentFolio.bind(this);
		this.navigationStateActions=navigationStateActions;
	}

	// Onclick event handlers, bound to "this" via constructor above
	changeType = function (event) {
		this.props.dispatch(this.navigationStateActions.changeTranscriptionType(event.currentTarget.dataset.id));
	}

	changeCurrentFolio = function(event){
		if(typeof event.currentTarget.dataset.id === 'undefined' || event.currentTarget.dataset.id.length === 0){
			return;
		}
		console.log("Moving us to:"+event.currentTarget.dataset.id);
		//this.props.dispatch(this.navigationStateActions.changeTranscriptionType(event.currentTarget.dataset.id));
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
            return (
				<div>
	                <div className="">
						<i>{this.props.navigationState.transcriptionType}</i><br/>
						<span data-id='tl' onClick={this.changeType}>English</span>
						|
						<span data-id='tc' onClick={this.changeType}>French (Original)</span>
						|
						<span data-id='tcn' onClick={this.changeType}>French (Standard)</span>
	                </div>
					<div>
						<span onClick={this.changeCurrentFolio} data-id={this.props.navigationState.previousFolioShortID} className={(this.props.navigationState.hasPrevious)?'arrow':'arrow disabled'}><Icon.ArrowCircleLeft/></span>
						<span>BnF Ms. Fr. 640 / Folios / {this.props.navigationState.currentFolioName}</span>
						<span onClick={this.changeCurrentFolio} data-id={this.props.navigationState.nextFolioShortID} className={(this.props.navigationState.hasNext)?'arrow':'arrow disabled'}><Icon.ArrowCircleRight/></span>
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
