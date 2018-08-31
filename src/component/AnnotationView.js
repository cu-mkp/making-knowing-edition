import React, {Component} from 'react';
import {connect} from 'react-redux';
import Parser from 'html-react-parser';
import domToReact from 'html-react-parser/lib/dom-to-react';
import { Link } from 'react-scroll';
 

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

    // Add anchor tag navigation for footnotes
    addFootnoteLink( domNode, parserOptions ) {
        const tagClass = domNode.attribs.class;
        if( tagClass === 'footnote-ref' || tagClass === 'footnote-back' ) {
            const scrollTo = domNode.attribs.href.substr(1);
            return (
                <Link className='footnote-ref' id={domNode.attribs.id} activeClass="active" to={scrollTo} offset={-100} >
                {domToReact(domNode.children, parserOptions)}
                </Link>
            );
        }
        else {
            return domNode;
        }
    }

    // Configure parser to replace certain tags with components
    htmlToReactParserOptions() {
		var parserOptions =  {
			 replace: (domNode) => {
				 switch (domNode.name) {
                    case 'a':
                        return this.addFootnoteLink( domNode, parserOptions );
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
