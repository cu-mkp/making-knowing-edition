import React from 'react';
import {connect} from 'react-redux';

class Annotation extends React.Component {

	constructor(props, context) {
		super(props, context);
		this.toggleAnnotation = this.toggleAnnotation.bind(this);
		this.state = {visible: false};
	}

	toggleAnnotation = function(event){
		this.setState({visible: !this.state.visible});
	}

	render() {

		let icon = '';
		let tooltip = '';
		switch (this.props.type) {
			case 'fieldNotes':
				icon = 'icon fa fa-flask';
				tooltip = "Field Note";
				break;

			case 'annotation':
				icon = 'icon fa fa-search';
				tooltip = "Annotation";
				break;

			case 'video':
				icon = 'icon fa fa-video';
				tooltip = "Video Annotation";
				break;

			default:
				icon = 'icon fa fa-question';
				tooltip = "Question";
				break;

		}
		icon += this.state.visible?' open':'';
		let content_style = this.state.visible?{display: "block"}:{display: "none"};
		return (
			  <div className="annotation">
			  	<div className="header">
			  		<div className="title"><h2>{this.props.headerContent}</h2></div>
			  		<div title = {tooltip} className={icon} onClick={this.toggleAnnotation}/>
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
		documentView: state.documentView
	};
}

export default connect(mapStateToProps)(Annotation);
