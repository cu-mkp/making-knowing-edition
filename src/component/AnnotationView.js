import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom'
import Parser from 'html-react-parser';

import { dispatchAction } from '../model/ReduxStore';

class AnnotationView extends Component {

    componentDidMount() {
        dispatchAction( this.props, 'AnnotationActions.loadAnnotation' );
    }

    // Configure parser to replace certain tags with components
    htmlToReactParserOptions() {
		var parserOptions =  {
			 replace: function(domNode) {

				 switch (domNode.name) {

					 default:
						 /* Otherwise, Just pass through */
						 return domNode;
				 }
			 }
		 };
		 return parserOptions;
    }
    
	render() {
        if( this.props.annotations && this.props.annotations.loaded ) {
            let htmlToReactParserOptions = this.htmlToReactParserOptions();

            return (
                <div id="annotation-view">
                    {Parser(this.props.annotations.content,htmlToReactParserOptions)}
                </div>
            );
        } else {
            return null;
        }
	}
}

function mapStateToProps(state) {
    return {
        annotations: state.annotations
    };
}

export default connect(mapStateToProps)(AnnotationView);
