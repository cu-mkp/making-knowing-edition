import React, {Component} from 'react';
import {connect} from 'react-redux';

import SplitPaneView from './SplitPaneView';
import Document from '../model/Document';
import HashParser from '../component/HashParser';
import * as navigationStateActions from '../action/navigationStateActions';

class DocumentView extends Component {

    constructor(props, context) {
        super(props, context);
        this.document = new Document();
        this.state = {
            ready: false
		}
		this.navigationStateActions = navigationStateActions;
    }

    componentDidMount() {

		// Load the document
		this.document.load().then(
			(folio) => {
				// Store an ordered array of folio ids, used for next/prev navigation purposes later
				if (this.props.navigationState.folioIndex.length === 0) {
					let folioIndex = [];
					let nameByID = {};
					let idByName = {};
					for (let idx = 0; idx < this.document.folios.length; idx++) {
						let shortID = this.document.folios[idx].id.substr(this.document.folios[idx].id.lastIndexOf('/') + 1);
						folioIndex.push(shortID);
						nameByID[shortID] = this.document.folios[idx].name;
						idByName[this.document.folios[idx].name] = shortID;
					}
					this.props.dispatch(this.navigationStateActions.updateFolioIndex({	folioIndex: folioIndex,
																						folioNameByIDIndex: nameByID,
																						folioIDByNameIndex: idByName}));
				}

				// Mark everything loaded (do this first so we don't thrash when we dispatch redux update below)
				this.setState({
					ready: true
				});				
			},
			(error) => {
				// TODO update UI
				console.log('Unable to load manifest: ' + error);
			}
		);
	}

    render() {
        if( !this.state.ready ) { return null; }
		// window.loadingModal_stop();

        return (
            <div>
                <HashParser history={this.props.history}/>
                <SplitPaneView 
                    history={this.props.history}
                    document={this.document} 
                />
            </div>
        );
    }

}

function mapStateToProps(state) {
	return {
		navigationState: state.navigationState
	};
}

export default connect(mapStateToProps)(DocumentView);
