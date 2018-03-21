import React from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from './actions/navigationStateActions';
//import PropTypes from 'prop-types';

class navigation extends React.Component {

	constructor(props,context){
		super(props,context);
		this.changeType = this.changeType.bind(this);
		this.navigationStateActions=navigationStateActions;
	}

	// Onclick event handler, bound to "this" via constructor above
	changeType = function (event) {
		this.props.dispatch(this.navigationStateActions.changeTranscriptionType(event.currentTarget.dataset.id));
	}


    componentWillMount() {
        //this.props.navigationStateActions.fetchtranscription();
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
						<span>BnF Ms. Fr. 640 / Folios / {this.props.navigationState.currentFolio}</span>
						|| <span>(prev)</span><span>(next)</span>
					</div>
				</div>
            )
        }
    }
}
/*
navigation.propTypes = {
    navigationStateActions: PropTypes.object,
    transcription: PropTypes.array
};
*/
function mapStateToProps(state) {
	return {
        navigationState: state.navigationState
    };
}


export default connect(mapStateToProps)(navigation);
