import React from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from './actions/navigationStateActions';
import {Icon} from "react-font-awesome-5";


class navigation extends React.Component {

	constructor(props,context){
		super(props,context);
		this.changeCurrentFolio = this.changeCurrentFolio.bind(this);
		this.navigationStateActions=navigationStateActions;
	}

	changeCurrentFolio = function(event){
		if(typeof event.currentTarget.dataset.id === 'undefined' || event.currentTarget.dataset.id.length === 0){
			return;
		}

		let longID = 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/'+event.currentTarget.dataset.id;
		this.props.dispatch(this.navigationStateActions.changeCurrentFolio({id:longID}));
	}


    render() {
		return (
			<div className="paginationComponent">
				<div className="paginationControl">
					<span onClick={this.changeCurrentFolio} data-id={this.props.navigationState.previousFolioShortID} className={(this.props.navigationState.hasPrevious)?'arrow':'arrow disabled'}><Icon.ArrowCircleLeft/> </span>
					<span className="folioName">Folio {this.props.navigationState.currentFolioName}</span>
					<span onClick={this.changeCurrentFolio} data-id={this.props.navigationState.nextFolioShortID} className={(this.props.navigationState.hasNext)?'arrow':'arrow disabled'}> <Icon.ArrowCircleRight/></span>
				</div>
			</div>
		)
    }
}

function mapStateToProps(state) {
	return {
        navigationState: state.navigationState
    };
}


export default connect(mapStateToProps)(navigation);
