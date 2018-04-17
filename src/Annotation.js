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
		icon += this.state.visible?' open':'';
		let content_style = this.state.visible?{display: "block"}:{display: "none"};
		return (
			  <div className="annotation">
			  	<div className="header">
			  		<div className="title"><h2>{this.props.headerContent}</h2></div>
			  		<div className={icon} onClick={this.toggleAnnotation}/>
				</div>
			  	<div className="content" style={content_style}>
			  		{this.props.children}

					<iframe title="x" className="videoEmbed" src="https://player.vimeo.com/video/129811219" frameBorder="0" webkitallowfullscreen="true" mozallowfullscreen="true" allowFullScreen="true"></iframe>
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
