import React, {Component} from 'react';
import {connect} from 'react-redux';
import Parser from 'html-react-parser';
import { Element, scroller } from 'react-scroll';
 

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

    scrollToAnchorTag = (e) => {                
        // Somewhere else, even another file
        scroller.scrollTo('myScrollToElement', {
            duration: 500,
            smooth: true,
            containerId: this.id,
            offset: 5 
        }); 
    }

    // Configure parser to replace certain tags with components
    htmlToReactParserOptions() {
		var parserOptions =  {
			 replace: function(domNode) {
				 switch (domNode.name) {
                    case 'a':
                        // determine tag class
                        const tagClass = null;
                        if( tagClass === 'footnote-ref' || tagClass === 'footnote-back' ) {
                            // href="#fnref32"
                            return (
                                // reconstruct the link
                                <Element name="fnref32">
                                    <a onClick={this.scrollToAnchorTag}></a>
                                </Element>
                            );
                        }
                        else {
                            return domNode;
                        }

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

function mapStateToProps(state) {
    return {
        annotations: state.annotations
    };
}

export default connect(mapStateToProps)(AnnotationView);
