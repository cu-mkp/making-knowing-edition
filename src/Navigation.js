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

		let longID = 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/'+event.currentTarget.dataset.id;
		this.props.dispatch(this.navigationStateActions.changeCurrentFolio({id:longID}));
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

			switch (this.props.context) {

				// Image view navigation
				case 'image-view':
					return (
						<div className="navigationComponent">
							<div>
								<div className="breadcrumbs">
									{this.props.navigationState.currentDocumentName} / Folios / <span className="folioName">{this.props.navigationState.currentFolioName}</span>
									<span onClick={this.changeCurrentFolio} data-id={this.props.navigationState.previousFolioShortID} className={(this.props.navigationState.hasPrevious)?'arrow':'arrow disabled'}> <Icon.ArrowCircleLeft/> </span>
									<span onClick={this.changeCurrentFolio} data-id={this.props.navigationState.nextFolioShortID} className={(this.props.navigationState.hasNext)?'arrow':'arrow disabled'}> <Icon.ArrowCircleRight/></span>
								</div>
								<div className="dropdown">
									<button className="dropbtn">
										Facsimile <span className="fa fa-caret-down"></span>
									</button>
								</div>
							</div>
						</div>
					)

				// Transcript view navigation
				case 'transcription-view':
				default:
					return (
						<div className="navigationComponent">
							<div>
								<div className="breadcrumbs">{this.props.navigationState.currentDocumentName} / Folios / <span className="folioName">{this.props.navigationState.currentFolioName}</span></div>
								<div className="dropdown">
									<button className="dropbtn">
										{this.props.navigationState.transcriptionTypeLabel} <span className="fa fa-caret-down"></span>
									</button>
									<div className="dropdown-content">
										<span data-id='tl' onClick={this.changeType}>English Translation</span>
										<span data-id='tc' onClick={this.changeType}>French Original</span>
										<span data-id='tcn' onClick={this.changeType}>French Standard</span>
									</div>
								</div>
							</div>
							<div className="pageNavigation">
								<span onClick={this.changeCurrentFolio} data-id={this.props.navigationState.previousFolioShortID} className={(this.props.navigationState.hasPrevious)?'arrow':'arrow disabled'}><Icon.ArrowCircleLeft/> </span>
								<span className="folioName">Folio {this.props.navigationState.currentFolioName}</span>
								<span onClick={this.changeCurrentFolio} data-id={this.props.navigationState.nextFolioShortID} className={(this.props.navigationState.hasNext)?'arrow':'arrow disabled'}> <Icon.ArrowCircleRight/></span>
							</div>
						</div>
					)

			}

        }
    }
}

function mapStateToProps(state) {
	return {
        navigationState: state.navigationState
    };
}


export default connect(mapStateToProps)(navigation);
