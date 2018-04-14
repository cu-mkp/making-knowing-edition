import React from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from './actions/navigationStateActions';

class annotation extends React.Component {

	constructor(props,context){
		super(props,context);
		this.navigationStateActions=navigationStateActions;
	}



    render() {
      return(
          <span style={{color:'red'}}>{this.props.children}</span>
        );
    }
}

function mapStateToProps(state) {
	return {
        navigationState: state.navigationState
    };
}


export default connect(mapStateToProps)(annotation);
