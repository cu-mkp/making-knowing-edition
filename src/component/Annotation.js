import React from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom';
import Parser from 'html-react-parser';

const lorem = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porttitor tincidunt nunc vel pellentesque. In sagittis, nunc a luctus molestie, diam justo finibus tortor, ut rutrum nisi mauris ut elit. Morbi lorem urna, rhoncus eu venenatis at, varius quis mauris. Quisque pellentesque orci a libero malesuada, id semper sem dignissim. Duis dolor purus, rutrum et dictum id, laoreet vel nulla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Ut sed nibh libero. Integer gravida ut ipsum a pretium. Integer id libero ex.</p>"

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
        const title = annotation.name.length > 0 ? annotation.name : `No Title (${annotation.id})`
        const thumbnailURL = annotation.thumbnail ? `${process.env.REACT_APP_EDITION_DATA_URL}/annotations-thumbnails/${annotation.thumbnail}` : "/img/watermark.png"

		return (
			  <div className="annotation">
			  	<div className="header">
			  		<div className="title"><h2>{title}</h2></div>
			  		<div title = {tooltip} className={icon} onClick={this.toggleAnnotation}/>
				</div>
			  	<div className="content" style={content_style}>
					<h2><Link to={`/essays/${annotation.id}`}>{annotation.name}</Link></h2>
					<div className='thumbnail'><img style={{height: 200}} src={thumbnailURL}></img></div>
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
