import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Paper, Typography, IconButton } from '@material-ui/core';
import { Icon } from "react-font-awesome-5";
import { Link } from 'react-scroll';
import { dispatchAction } from '../../model/ReduxStore';

import AnnotationCard from './AnnotationCard';
import AnnotationThumb from './AnnotationThumb';

class AnnotationListView extends Component {

    constructor() {
        super()

        this.state = {
            listMode: 'cards'
        }
    }

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', true );
    }

    renderTableOfContents(sectionList) {
        
        const sectionHeadings = []
        for( let section of sectionList ) {
            sectionHeadings.push( 
                <Link key={`link-to-${section.id}`} to={section.id} activeClass="active-section" spy={true} containerId="sections-area" smooth="true" offset={-175}>
                    <Typography key={`nav-${section.id}`}  className="category" >
                        {section.name}              
                    </Typography> 
                </Link>      
            )
        }

        return (
            <Paper className="tocbar">
                <Typography variant='h6' gutterBottom>Making &amp; Knowing Workshop Themes</Typography>
                <div>
                    { sectionHeadings }
                </div>
            </Paper>
        );
    }

    onDisplayCards = () => {
        this.setState( { ...this.state, listMode: 'cards' } )
    }

    onDisplayThumbs = () => {
        this.setState( { ...this.state, listMode: 'thumbs' } )
    }

    renderSection(section) {
        let annoComponents = []
        for( let annotation of section.annotations ) {
            if( this.state.listMode === 'cards' ) {
                annoComponents.push(<AnnotationCard history={this.props.history} key={`anno-${annotation.id}`} annotation={annotation}></AnnotationCard>);            
            }
            else {
                annoComponents.push(<AnnotationThumb history={this.props.history} key={`anno-${annotation.id}`} annotation={annotation}></AnnotationThumb>)
            }     
        }

        return (
            <div id={section.id} key={section.id} className="section">
                <div className="section-header">
                    <Typography className="title">{section.name}</Typography>
                </div>
                <div className="annotations">
                    { annoComponents }
                </div>
            </div> 
        )
    }

    renderSections(sectionList) {
        let sectionComponents = []
        for( let section of sectionList ) {
            const sectionComponent = this.renderSection(section)
            sectionComponents.push(sectionComponent)
        }

        return (
            <div id="sections-area" className="sections">
                { sectionComponents }
            </div>
        )
    }

	render() {
        if( !this.props.annotations.loaded ) return null;

        const {annotationSections} = this.props.annotations
        
        return (
            <div id="annotation-list-view">
                <Paper className="titlebar">
                    <div className="list-mode-buttons">
                        <IconButton onClick={this.onDisplayCards}><span title="Display Cards" ><Icon.ThLarge /></span></IconButton>   
                        <div className="seperator"></div>
                        <IconButton onClick={this.onDisplayThumbs}><span title="Display Thumbnails" ><Icon.Th /></span></IconButton>   
                    </div>
                    <Typography variant='h4' gutterBottom>Research Essays for BnF Ms. Fr. 640</Typography>
                </Paper>
                <div className="contentArea">
                    { this.renderTableOfContents(annotationSections) }
                    { this.renderSections(annotationSections) }
                </div>
            </div>
        );
	}
}

function mapStateToProps(state) {
    return {
        annotations: state.annotations
    };
}

export default connect(mapStateToProps)(AnnotationListView);
