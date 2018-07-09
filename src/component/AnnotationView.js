import React, {Component} from 'react';
import {connect} from 'react-redux';
import Parser from 'html-react-parser';

import { dispatchAction } from '../model/ReduxStore';

class AnnotationView extends Component {

    constructor(props,context) {
        super(props,context);

        this.state = { 
            annoID: props.match.params.annoID
        };
    }

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
    }

    componentDidMount() {
        let anno = this.getAnnotation();
        if( !annotationLoaded(anno) ) {
            dispatchAction( this.props, 'AnnotationActions.requestAnnotation', anno.id );
        }
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

    getAnnotation() {
        return this.props.annotations.loaded ? this.props.annotations.annotations[this.state.annoID] : null;
    }
    
	render() {
        let anno = this.getAnnotation();
        if( !annotationLoaded(anno) ) return null;
        
        let htmlToReactParserOptions = this.htmlToReactParserOptions();

        return (
            <div id="annotation-view">
                {Parser(anno.content,htmlToReactParserOptions)}
            </div>
        );
	}
}

function annotationLoaded(anno) {
    return ( anno && anno.loaded );
}

function mapStateToProps(state) {
    return {
        annotations: state.annotations
    };
}

export default connect(mapStateToProps)(AnnotationView);
