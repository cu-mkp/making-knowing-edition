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
        dispatchAction( 
            this.props, 
            'DocumentActions.requestDocument', 
            'BnF Ms. Fr. 640',
            'https://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/',
            process.env.REACT_APP_IIIF_MANIFEST 
        );
    }
      
    render() {
        if( !this.props.document.loaded ) { return null; }
        // window.loadingModal_stop();
        
        return (
            <div>
                <HashParser history={this.props.history} />
                <SplitPaneView history={this.props.history} />
            </div>
        );
    }

}

function mapStateToProps(state) {
	return {
        document: state.document
	};
}

export default connect(mapStateToProps)(DocumentView);
