import React, {Component} from 'react';
import {connect} from 'react-redux';
import {dispatchAction} from '../model/ReduxStore';
import Parser from 'html-react-parser';
import domToReact from 'html-react-parser/lib/dom-to-react';
import Card from '@material-ui/core/Card';
import { CardActionArea } from '@material-ui/core';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';

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
            <Card style={{height: "100%"}}>
                <CardActionArea
                    onClick={ e => {this.props.history.push(link)}}
                    style={{height: "100%"}}
                >
                    <div className="card" style={{backgroundImage: `url("${graphic}")`}}>
                      <div className="card-title">
                        {title}
                      </div>
                    </div>
                </CardActionArea>
            </Card>
        )
    }

    renderHomePage() {
        const imagesBaseURL = `${process.env.PUBLIC_URL}/img`
        const introVideoURL = 'https://player.vimeo.com/video/389763699'

        return (
          <React.Fragment>
            <div id="banner"/>
            <div id="content-view">
              <div className="homepage-header intro">
                <h2>Secrets of Craft and Nature in Renaissance France</h2>
                <h3>A Digital Critical Edition and English Translation of BnF Ms. Fr. 640</h3>
              </div>

              <Grid container spacing={16} style={{margin: 0, marginTop: 20, width: "100%"}}>

              {/* Left column */}
                <Grid container item sm={4} xs={12}>
                  <Grid item xs={12} style={{height: "50%", marginBottom: 8}}>
                    <p>Ms. Fr. 640 is a unique manuscript composed in 1580s Toulouse. It offers firsthand insight into making and materials from a time when artists were scientists.</p>

                    <p><i>Secrets of Craft and Nature in Renaissance France</i> offers a transcription and a translation of the manuscript, and provides many research resources to explore its context.</p>
                  </Grid>
                  <Grid item id="video-grid" xs={12} style={{flexDirection: "column", marginBottom: 40, height: "50%"}}>
                    <div className="video-iframe-wrapper">
                      <iframe className="homepage-intro-video"
                      title="Introduction Video"
                      src={introVideoURL}
                      frameBorder="0"
                      allow="autoplay; fullscreen"
                      allowFullScreen>
                      </iframe>
                    </div>
                  </Grid>
                </Grid>

              {/* Middle column */}
                <Grid container item sm={4} xs={12}>
                  <Grid item xs={12} style={{height: "50%", marginBottom: 8}}>
                    { this.renderGridCard('Read',`${imagesBaseURL}/homepage-read.png`, '/folios')}
                  </Grid>
                  <Grid item xs={12} style={{height: "50%"}}>
                    { this.renderGridCard('Study',`${imagesBaseURL}/homepage-study.jpg`, '/essays')}
                  </Grid>
                </Grid>

              {/* Right column */}
                <Grid container item sm={4} xs={12}>
                  <Grid item xs={12} style={{height: "50%", marginBottom: 8}}>
                    { this.renderGridCard('Explore',`${imagesBaseURL}/homepage-explore.png`, '/content/resources/overview')}
                  </Grid>
                  <Grid item xs={12} style={{height: "50%"}}>
                    { this.renderGridCard('About',`${imagesBaseURL}/lizard.png`, '/content/about/overview')}
                  </Grid>
                </Grid>
              </Grid>

              {/* Bottom row */}
                <div className="responsive-row" style={{display: "flex", justifyContent: "space-between", paddingRight: 8, marginTop: 20}}>
                  <p>For tips, please see <a href="#/content/how-to-use">How to Use</a>.</p>
                  <p>Check back over the coming months as we add new content and features that are <a href="#/content/resources/coming-soon">coming soon</a>.</p>
                </div>

                <div id="video-div" className="video-iframe-wrapper">
                  <iframe className="homepage-intro-video"
                  title="Introduction Video"
                  src={introVideoURL}
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen>
                  </iframe>
                </div>


            </div>
          </React.Fragment>
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
