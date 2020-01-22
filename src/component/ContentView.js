import React, {Component} from 'react';
import {connect} from 'react-redux';
import {dispatchAction} from '../model/ReduxStore';
import Parser from 'html-react-parser';
import domToReact from 'html-react-parser/lib/dom-to-react';

class ContentView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
    }


    // Configure parser to replace certain tags with components
    htmlToReactParserOptions() {
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

                return domNode
			 }
		 };
		 return parserOptions;
    }

    render() {
        const {contentID} = this.props
        const {contents} = this.props.contents
        const content = contents[contentID]
        if( !content ) return null;
        
        // if( !content ) {
        //     return (
        //         <div id="content-view">
        //             <h1>Content Not Found</h1>
        //             <p>Unable to load content for route: <b>/content/{contentID}</b></p>
        //         </div>
        //     )
        // } else {
            return (
                <div id="content-view">
                    {Parser(content,this.htmlToReactParserOptions)}
                </div>
            )    
        // }
    }

}

function mapStateToProps(state) {
    return {
        contents: state.contents
    };
}

export default connect(mapStateToProps)(ContentView);
