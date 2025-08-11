import { Button, Dialog, Fab, isWidthUp, withWidth } from '@material-ui/core';
import Parser from 'html-react-parser';
import domToReact from 'html-react-parser/lib/dom-to-react';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { dispatchAction } from '../model/ReduxStore';
import AnnotationCard from './annotation_list_view/AnnotationCard';
import ContentPage from './ContentPage';
import { Link } from 'react-router-dom';

class ContentView extends Component {

    constructor(props, context) {
		super(props, context);
		this.state = {
            isVideoDialogOpen: false
        };
	}

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
    }

    onVideoDialogOpen = () => {
        this.setState({isVideoDialogOpen: true})
    };

    
    // Configure parser to replace certain tags with components
    htmlToReactParserOptions() {
        const scrollWithOffset = (el) => {
            const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
            const yOffset = -120; 
            window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' }); 
        };
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
                        <div className='video-iframe-wrapper'>
                            {React.createElement(domNode.name, domNode.attribs, domNode.children)}
                        </div>
                    )
                }

                if( // change anchor tag to react router link if href is relative (does not start w/ "http")
                    domNode.name === 'a'
                    && !domNode.attribs.href.match(/^http/)
                ){
                    return(
                        <Link
                            to={domNode.attribs.href}
                            scroll={el => scrollWithOffset(el)}
                        >
                            {domToReact(domNode.children, parserOptions)}
                        </Link>
                    )
                }

                return domNode
			 }
        };
		 return parserOptions;
    }

    renderHomePage({ essaysEnabled, manuscriptEnabled }) {
        const imagesBaseURL = `${process.env.PUBLIC_URL}/img`;
        const bookBackgroundStyle = {
            backgroundColor: 'transparent', 
            backgroundImage: `url(${imagesBaseURL}/book-open-cropped.png)`,
            backgroundSize: 'cover'
        };
        const heroWidthStyle = {
            width: isWidthUp('sm', this.props.width) ? '50%' : '100%',
        }
        const featuredEssayIds = [
            'ann_300_ie_19',
            'ann_336_ie_19',
            'ann_329_ie_19',
            'ann_321_ie_19',
            'ann_022_sp_15',
            'ann_308_ie_19',
        ]
        const annotationsArray = Object.values(this.props.annotations.annotations);

        return (
            <div id="content-view">
                <div className='bg-maroon-gradient accent-bar'/>
                <div id='hero' className='flex-parent bg-light-gradient-tb'>
                    <div 
                        className='flex-parent column hero-left'
                        style={ isWidthUp('sm', this.props.width) 
                            ? heroWidthStyle 
                            : {
                                ...heroWidthStyle,
                                background: `linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), url(${imagesBaseURL}/book-open-cropped.png)`,
                                backgroundSize: 'cover',
                            }
                        }
                    >
                        <img className='mk-logo' src={`${imagesBaseURL}/mk-homepage-logo.png`} alt='Making and Knowing Secrets of Craft and Nature Logo'/>
                        <div className='hero-text'>
                            <p className='subtext'>Ms. Fr. 640 is a unique manuscript composed in 1580s Toulouse. It offers firsthand insight into making and materials from a time when artists were scientists.</p>
                        </div>
                        <div className='flex-parent jc-space-around'>
                            <a className='cta-link with-icon video-link' onClick={this.onVideoDialogOpen}>Watch Video</a>
                            <a className='cta-link with-icon' href='/content/about'>Learn More</a>
                        </div>
                    </div>
                    {isWidthUp('sm', this.props.width) &&
                        <div style={{width: '50%', ...bookBackgroundStyle}}/>
                    }
                </div>
                <div id='about-panel' className='column flex-parent text-bg-gradient-dark-bt'>
                    <div className='flex-parent'>

                        <div className='about-left jc-center flex-parent'>
                            <img className='about-image spine' src={`${imagesBaseURL}/book-spine.png`} alt='manuscript spine'/>
                            <img className='about-image cover' src={`${imagesBaseURL}/bookcover-cropped.png`} alt='manuscript cover'/>
                        </div>
                        <div className='about-right flex-parent column jc-center '>
                            <h3 className='title'>Created by the Making and Knowing Project</h3>
                            <p>
                                <strong>
                                    <i>Secrets of Craft and Nature in Renaissance France{' '}</i>
                                </strong>
                                offers a transcription and an English translation of the manuscript, and provides many research resources to explore its content and context.
                            </p>
                            {manuscriptEnabled && isWidthUp('sm', this.props.width) &&
                                <div className='flex-parent links-container full-width'>
                                    <a className='cta-link with-icon' href='/folios'>Read the Edition</a>
                                    <a className='cta-link with-icon' href='/content/resources'>Resources</a>
                                </div>
                            }
                        </div>
                    </div>
                    {manuscriptEnabled && !isWidthUp('sm', this.props.width) &&
                        <div className='flex-parent links-container full-width'>
                            <a className='cta-link with-icon' href='/folios'>Read the Edition</a>
                            <a className='cta-link with-icon' href='/content/resources'>Resources</a>
                        </div>
                    }
                </div>
                {essaysEnabled && (
                    <div id='featured-essays-panel' className='flex-parent column bg-light-gradient-tb'>
                        <h2 className='title'>Featured Essays</h2>
                        {annotationsArray.length &&
                            <div id='essay-card-container' className='flex-parent wrap'>
                                {featuredEssayIds.map(annoId => {
                                    const anno = annotationsArray.find(a => a.id === annoId);
                                    return <AnnotationCard annotation={anno} key={`featured-anno-${anno.id}`} history={this.props.history} />
                                })}
                            </div>
                        }
                        <div className='flex-parent jc-center'>
                            <Button 
                                variant='contained' 
                                color='primary' 
                                className='cta-button'
                                href='/#/essays'
                            >
                                VIEW ALL ESSAYS
                            </Button>
                        </div>
                    </div>
                )}

                <Dialog 
                    onClose={() => this.setState({isVideoDialogOpen: false})} 
                    open={this.state.isVideoDialogOpen}
                    fullWidth
                    maxWidth='lg'
                    PaperProps={{
                        style: {
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                        },
                    }}
                >
                    <Fab
                        size='small'
                        style={{alignSelf: 'flex-end'}}
                        onClick={() => this.setState({isVideoDialogOpen: false})}
                    >
                        <i className='fas fa-times'></i>
                    </Fab>
                    <iframe 
                        className='videoEmbed' 
                        src='https://player.vimeo.com/video/389763699' 
                        frameBorder='0' 
                        allowFullScreen
                        autoPlay
                        width={'100%'}
                        height={'600'}
                    />
                </Dialog>
            </div>
        )
    }

    render() {
        const {contentID} = this.props
        const {contents} = this.props.contents
        const { essaysEnabled, manuscriptEnabled } = this.props.diplomatic;
        if( contentID === 'index' ) {
            return this.renderHomePage({ essaysEnabled, manuscriptEnabled })
        }

        const content = contents[contentID]
        const menuNode = this.props.contents.menuStructure
            ? this.props.contents.menuStructure.find(n => n.content_id === contentID)
            : false;

        if( !content ) {
            return (
                <div id='content-view'>
                    <div className='loading' >
                        <img alt='Loading, please wait.' src='/img/spinner.gif'></img>
                    </div>
                </div>
            )
        } else if( content === 404 || !menuNode ) {
            return (
                <div id='content-view' className='not-found'>
                    <h1>Content Not Found</h1>
                    <p>Unable to load content for route: <b>/content/{contentID}</b></p>
                </div>
            )
        } else {
            return (
                <div id='content-view' >
                    <ContentPage
                        menuNode={menuNode}
                        contentId={this.props.contentID}
                    >
                        {Parser(content,this.htmlToReactParserOptions())}
                    </ContentPage>
                </div>
            )
        }
    }

}

function mapStateToProps(state) {
    return {
        contents: state.contents,
        annotations: state.annotations,
        diplomatic: state.diplomatic
    };
}

export default withWidth() (connect(mapStateToProps)(ContentView));
