import React, {Component} from 'react';
import {connect} from 'react-redux';

import SplitPaneView from './SplitPaneView';
import HashParser from '../component/HashParser';
import {dispatchAction} from '../model/ReduxStore';

class DocumentView extends Component {
	
	componentDidMount() {
        dispatchAction( this.props, 'DocumentActions.loadDocument', process.env.REACT_APP_IIIF_MANIFEST );
    }

    render() {
        if( !this.props.document.loaded ) { return null; }
		// window.loadingModal_stop();

        // Store an ordered array of folio ids, used for next/prev navigation purposes later
        if (this.props.documentView.folioIndex.length === 0) {
            let folioIndex = [];
            let nameByID = {};
            let idByName = {};
            for (let idx = 0; idx < this.props.document.folios.length; idx++) {
                let shortID = this.props.document.folios[idx].id.substr(this.props.document.folios[idx].id.lastIndexOf('/') + 1);
                folioIndex.push(shortID);
                nameByID[shortID] = this.props.document.folios[idx].name;
                idByName[this.props.document.folios[idx].name] = shortID;
            }
            dispatchAction(
                this.props,
                'DocumentViewActions.updateFolioIndex',
                folioIndex,
                nameByID,
                idByName
            );
        }

        return (
            <div>
                <HashParser history={this.props.history}/>
                <SplitPaneView 
                    history={this.props.history}
                    document={this.props.document} 
                />
            </div>
        );
    }

}

function mapStateToProps(state) {
	return {
        document: state.document,
        documentView: state.documentView
	};
}

export default connect(mapStateToProps)(DocumentView);
