import React, {Component} from 'react';
import {connect} from 'react-redux';
import Parser from 'html-react-parser';
import domToReact from 'html-react-parser/lib/dom-to-react';
import { Link } from 'react-scroll';
import { Link as ReactLink } from 'react-router-dom';
import { dispatchAction } from '../model/ReduxStore';
import FigureImage from './FigureImage'
import AnnotationByLine from './AnnotationByLine';

class AnnotationView extends Component {

    constructor(props,context) {
        super(props,context);

        this.state = { 
            annoID: props.annoID
        };
    }

    componentWillMount() {
        const fixedFrameMode = (this.props.inSearchMode);
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', fixedFrameMode );
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
    htmlToReactParserOptions(annoAuthors, authors) {
		var parserOptions =  {
			 replace: (domNode) => {
                // drop these
                if( domNode.name === 'body' || 
                    domNode.name === 'head' ||
                    domNode.name === 'html'     ) {
                    return ( 
                    <div className={`anno-${domNode.name}`}>
                        {domToReact(domNode.children, parserOptions)}
                    </div> 
                    );
                }
                
                if (domNode.name === 'img') {
                    if (domNode.parent.name === "figure") {
                        let imgEl = domToReact([domNode])
                        return (
                            <FigureImage img={imgEl} />                         
                        )
                    } else {
                        return;
                    }
                }

                if (domNode.name === 'iframe') {
                    let iframeEl = domToReact([domNode])
                    return (
                        <div className="video-iframe-wrapper">
                            {iframeEl}
                        </div>                        
                    )
                }
                // TODO:Commented out AnnotationByline code until docs can be update to remove the hand-type by line 
                //      (see comments in issue: https://github.com/cu-mkp/making-knowing-edition/issues/394)
                // if( domNode.name === 'h1'){
                //     return (
                //         <div className="title-byline-container">
                //             <h1>{domToReact(domNode.children, parserOptions)}</h1>
                            
                //             {
                //                 annoAuthors ?
                //                 <div>
                //                     <AnnotationByLine annoAuthors={annoAuthors} authors={authors} /> 
                //                 </div>
                //                 :
                //                 ""
                //             }
                //         </div>
                //     );
                // }

				 switch (domNode.name) {
                    case 'p':
                        // hack to pass a formatting hint for paragraphs continuing
                        // through blockquotes.
                        if (domNode.children) {
                            for( let child of domNode.children ) {
                                if( child.attribs && child.attribs['class'] === 'pull-left' ) {
                                    domNode.attribs['class'] = 'pull-left'
                                }
                            }    
                        }
                        return domNode
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

    renderAnnotationNav() {
        if( this.props.inSearchMode ) return '';
        return (
            <div className='annotation-nav'>
                <ReactLink to='/essays'>Back to List</ReactLink>
            </div>
        );
    }
    
	render() {
        let anno = this.props.annotations.loaded ? this.props.annotations.annotations[this.state.annoID] : null;
        if( !anno || !anno.loaded ) return null;
        
        let htmlToReactParserOptions = this.htmlToReactParserOptions(anno.authors, this.props.authors.authors);
        const modeClass = this.props.inSearchMode ? 'search-mode' : 'view-mode';

        // Mark any found search terms
        let content;
        if(this.props.inSearchMode) {
            const searchResults = this.props.search.results['anno'];
            content = this.props.search.index.markMatchedTerms(searchResults, 'anno', this.state.annoID, anno.content);
        } else {
            content = anno.content;
        }

        return (
            <div id="annotation-view" className={modeClass}>
                { this.renderAnnotationNav() }
                {Parser(content,htmlToReactParserOptions)}
            </div>
        );
	}
}

function mapStateToProps(state) {
    return {
        authors: state.authors,
        search: state.search,
        annotations: state.annotations
    };
}

export default connect(mapStateToProps)(AnnotationView);
