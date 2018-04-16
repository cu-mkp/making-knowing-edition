import React from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from './actions/navigationStateActions';


class Annotation extends React.Component {

	constructor(props, context) {
		super(props, context);
		this.navigationStateActions = navigationStateActions;
		this.toggleAnnotation = this.toggleAnnotation.bind(this);
		this.state = {visible: false};
	}

	toggleAnnotation = function(event){
		this.setState({visible: !this.state.visible});
	}



	render() {

		let icon = '';
		switch (this.props.type) {
			case 'fieldNotes':
				icon = 'icon fa fa-flask';
				break;

			case 'annotation':
				icon = 'icon fa fa-search';
				break;

			case 'video':
				icon = 'icon fa fa-video';
				break;

			default:
				icon = 'icon fa fa-question';
				break;

		}

		let style = this.state.visible?{display: "block"}:{display: "none"};
		return (
			  <div className="annotation">
			  	<h2>{this.props.headline}</h2>
			  	<div onClick={this.toggleAnnotation} className={icon}/>
			  	<div className="content" style={style}>
			  		{this.props.children}
				</div>
			  </div>
		);
	}
}

function mapStateToProps(state) {
	return {
		navigationState: state.navigationState
	};
}

export default connect(mapStateToProps)(Annotation);
