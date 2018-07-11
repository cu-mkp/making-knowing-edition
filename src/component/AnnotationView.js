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
        let anno = this.props.annotations.loaded ? this.props.annotations.annotations[this.state.annoID] : null;
        if( !anno || !anno.loaded ) return null;
        
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
