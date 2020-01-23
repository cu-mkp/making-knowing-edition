import React, {Component} from 'react';
import {connect} from 'react-redux';
import {dispatchAction} from '../model/ReduxStore';
import Parser from 'html-react-parser';
import domToReact from 'html-react-parser/lib/dom-to-react';
import {Typography} from '@material-ui/core';
import Card from '@material-ui/core/Card';
import { CardActionArea } from '@material-ui/core';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';

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

    renderGridCard(title, graphic, link) {
        return (
            <Card className="homepage-grid-item">
                <CardActionArea 
                    onClick={ e => {this.props.history.push(link)}}
                >
                    <CardMedia style={{width: 360, height: 350}} image={graphic}>
                    </CardMedia>
                    <CardHeader 
                        title={title} 
                    >            
                    </CardHeader>
                </CardActionArea>
            </Card>
        )
    }

    renderHomePage() {
        const {imagesBaseURL} = this.props.contents
        const introVideoURL = 'https://player.vimeo.com/video/384070384'
        return (
            <div id="content-view" className='home-page'>
                <div className="homepage-header" >
                    <iframe className="homepage-intro-video" title="Introduction Video" src={introVideoURL} width="426" height="240" frameBorder="0" allow="autoplay; fullscreen" allowFullScreen></iframe>
                    <Typography>This edition and translation of the ms. offers unique firsthand insight in making and materials from a time when artists were scientists. Brought to you by the Making and Knowing Project.</Typography>
                    <Typography>For tips, please see How to Use.</Typography>
                    <Typography>Check back over the coming months as we add new content and features.</Typography>
                </div>
                <div className="homepage-grid">
                    { this.renderGridCard('READ',`${imagesBaseURL}/homepage-read.jpeg`, '/folios')}
                    { this.renderGridCard('STUDY',`${imagesBaseURL}/homepage-study.PNG`, '/essays')}
                    { this.renderGridCard('EXPLORE',`${imagesBaseURL}/homepage-filter.png`, '/content/research+resources/overview')}
                    { this.renderGridCard('ABOUT',`${imagesBaseURL}/homepage-about.jpg`, '/content/about/m-k-project')}
                </div>
            </div>
        )
    }

    render() {
        const {contentID} = this.props
        const {contents} = this.props.contents

        if( contentID === 'index') {
            return this.renderHomePage()
        }

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
