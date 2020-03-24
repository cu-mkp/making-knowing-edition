import React, {Component} from 'react';
import {connect} from 'react-redux';
import {dispatchAction} from '../model/ReduxStore';
import Parser from 'html-react-parser';
import domToReact from 'html-react-parser/lib/dom-to-react';
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
                // Puts wrapper around iframe (so vimeo video embeds can be styled for responsivness)
                if( domNode.name === 'iframe' ) {
                    domNode.attribs['frameBorder'] = domNode.attribs['frameborder']
                    delete domNode.attribs['frameborder']
                    domNode.attribs['allowFullScreen'] = domNode.attribs['allowfullscreen']
                    delete domNode.attribs['allowfullscreen']
                    return(
                        <div className="video-iframe-wrapper">
                            {React.createElement(domNode.name, domNode.attribs, domNode.children)}
                        </div>
                    )
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
                    <CardMedia className={"homepage-card-image"} image={graphic}/>
                    <CardHeader title={title} />
                </CardActionArea>
            </Card>
        )
    }

    renderHomePage() {
        const {imagesBaseURL} = this.props.contents
        const introVideoURL = 'https://player.vimeo.com/video/389763699' 
        return (
            <div id="content-view" className='home-page'>
                <div className="homepage-header" >
                    <div className="intro">
                        <h1>Secrets of Craft and Nature in Renaissance France</h1>
                        <h2>A Digital Critical Edition and English Translation of BnF Ms. Fr. 640</h2>
                        <p>A production of the Making and Knowing Project, this edition provides a transcription and English translation of Ms. Fr. 640, composed by an anonymous “author-practitioner” in 1580s Toulouse and now held by the Bibliothèque nationale de France. This manuscript offers unique firsthand insight into making and materials from a time when artists were scientists. The research resources in this edition explore the manuscript’s context and diverse topics. For tips, please see <a href="#/content/how-to-use">How to Use</a>. <i>Check back over the coming months as we add new content and features.</i></p>                        
                    </div>
                    <div className="video-iframe-wrapper">
                        <iframe className="homepage-intro-video"
                            title="Introduction Video"
                            src={introVideoURL}
                            frameBorder="0"
                            allow="autoplay; fullscreen"
                            allowFullScreen>
                        </iframe>
                    </div>

                </div>
                <div className="homepage-grid">
                    { this.renderGridCard('READ',`${imagesBaseURL}/homepage-read.jpeg`, '/folios')}
                    { this.renderGridCard('STUDY',`${imagesBaseURL}/homepage-study-tiles.PNG`, '/essays')}
                    { this.renderGridCard('EXPLORE',`${imagesBaseURL}/homepage-filter.png`, '/content/resources/overview')}
                    { this.renderGridCard('ABOUT',`${imagesBaseURL}/homepage-about.jpg`, '/content/about/overview')}
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
        
        if( !content ) {
            return (
                <div id="content-view">
                    <div className="loading" >
                        <img alt="Loading, please wait." src="/img/spinner.gif"></img>
                    </div>
                </div>
            )     
        } else if( content === 404 ) {
            return (
                <div id="content-view">
                    <h1>Content Not Found</h1>
                    <p>Unable to load content for route: <b>/content/{contentID}</b></p>
                </div>
            )
        } else {
            return (
                <div id="content-view">
                    {Parser(content,this.htmlToReactParserOptions())}
                </div>
            )    
        }
    }

}

function mapStateToProps(state) {
    return {
        contents: state.contents
    };
}

export default connect(mapStateToProps)(ContentView);
