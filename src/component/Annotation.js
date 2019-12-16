import React from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom';
import Parser from 'html-react-parser';

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
				icon = 'anno-btn icon fa fa-flask';
				tooltip = "Field Note";
				break;

			case 'annotation':
				icon = 'anno-btn icon fa fa-flask';
				tooltip = "Annotation";
				break;

			case 'video':
				icon = 'anno-btn icon fa fa-video';
				tooltip = "Video Annotation";
				break;

			default:
				icon = 'anno-btn icon fa fa-question';
				tooltip = "Question";
				break;

		}
		icon += this.state.visible?' open':'';
		let content_style = this.state.visible?{display: "block"}:{display: "none"};
		const {annotation} = this.props;

		const comingSoon = "This essay is under revision."
        const abstract = (!annotation.abstract || annotation.abstract.length === 0 ) ? comingSoon : annotation.abstract;
        const thumbnailURL = annotation.thumbnail ? `${process.env.REACT_APP_EDITION_DATA_URL}/annotations-thumbnails/${annotation.thumbnail}` : "/img/watermark.png"
		const annotationLink = annotation.status ? <Link to={`/essays/${annotation.id}`}>{annotation.name}</Link> : annotation.name

		return (
			  <div className="annotation">
			  	<div className="header">
			  		<div className="title"><h2>{this.props.headerContent}</h2></div>
			  		<div title = {tooltip} className={icon} onClick={this.toggleAnnotation}/>
				</div>
			  	<div className="content" style={content_style}>
					<h2>{annotationLink}</h2>
					<div className='thumbnail' ><img alt={`Thumbnail for ${annotation.name}`} style={{height: 200}} src={thumbnailURL}></img></div>
					<div className='abstract'>{Parser(abstract)}</div>
				</div>
			  </div>
		);
		// For video:
		// 	<iframe title="x" className="videoEmbed" src="https://player.vimeo.com/video/129811219" frameBorder="0" webkitallowfullscreen="true" mozallowfullscreen="true" allowFullScreen="true"></iframe>

	}
}

function mapStateToProps(state) {
	return {
		documentView: state.documentView
	};
}

export default connect(mapStateToProps)(Annotation);
