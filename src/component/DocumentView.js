import React, {Component} from 'react';
import {connect} from 'react-redux';

import SplitPaneView from './SplitPaneView';
import HashParser from '../component/HashParser';
import {dispatchAction} from '../model/ReduxStore';

class DocumentView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', true );
    }
	
	componentDidMount() {
        dispatchAction( this.props, 'DocumentActions.requestDocument', process.env.REACT_APP_IIIF_MANIFEST );
    }
      
    render() {
        if( !this.props.document.loaded ) { return null; }
        // window.loadingModal_stop();
        
        return (
            <div>
                <HashParser 
                    history={this.props.history} 
                    document={this.props.document}
                />
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
