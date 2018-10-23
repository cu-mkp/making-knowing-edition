import React, {Component} from 'react';
import {connect} from 'react-redux';

import SplitPaneView from './SplitPaneView';
import {dispatchAction} from '../model/ReduxStore';

class DocumentView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', true );
    }
	      
    render() {
        if( !this.props.document.loaded ) { return null; }
        
        return (
            <div>
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
