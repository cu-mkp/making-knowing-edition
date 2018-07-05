import React from 'react';
import {connect} from 'react-redux';
import {Icon} from "react-font-awesome-5";
import {dispatchAction} from '../model/ReduxStore';

class navigation extends React.Component {

	constructor(props,context){
		super(props,context);
		this.changeCurrentFolio = this.changeCurrentFolio.bind(this);
	}

	changeCurrentFolio = function(event){
		if(typeof event.currentTarget.dataset.id === 'undefined' || event.currentTarget.dataset.id.length === 0){
			return;
		}

		let longID = this.props.documentView.folioIDPrefix+event.currentTarget.dataset.id;
		dispatchAction(
			this.props,
			'DocumentViewActions.changeCurrentFolio',
			longID,
			this.props.side,
			this.props.documentView[this.props.side].transcriptionType,
			event.currentTarget.dataset.direction			
		);
	}


    render() {
		return (
			<div className="paginationComponent">
				<div className="paginationControl">

					<span	title = "Go back"
							onClick={this.changeCurrentFolio}
							data-direction="back"
							data-id={this.props.documentView[this.props.side].previousFolioShortID}
							className={(this.props.documentView[this.props.side].hasPrevious)?'arrow':'arrow disabled'}><Icon.ArrowCircleLeft/> </span>

					<span className="folioName">Folio {this.props.documentView[this.props.side].currentFolioName}</span>

					<span 	title = "Go forward"
							onClick={this.changeCurrentFolio}
							data-direction="forward"
							data-id={this.props.documentView[this.props.side].nextFolioShortID}
							className={(this.props.documentView[this.props.side].hasNext)?'arrow':'arrow disabled'}> <Icon.ArrowCircleRight/></span>
				</div>
			</div>
		)
    }
}

function mapStateToProps(state) {
	return {
        documentView: state.documentView
    };
}


export default connect(mapStateToProps)(navigation);
