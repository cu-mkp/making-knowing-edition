import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Paper, Typography, IconButton } from '@material-ui/core';
import { Icon } from "react-font-awesome-5";
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

    renderTableOfContents(sections) {
        // TODO parse sections and make links to sections
        return (
            <Paper className="tocbar">
                <Typography variant='h6' gutterBottom>Making &amp; Knowing Workshop Themes</Typography>
                <Typography className="category" >Metal Working and Moldmaking</Typography>
                <Typography className="category">Colormaking</Typography>
                <Typography className="category">Practical Knowledge</Typography>
                <Typography className="category">Ephemeral Art</Typography>
                <Typography className="category">Print and Impression</Typography>
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
            <div key={`section-${section.name}`} className="section">
                <div className="section-header">
                    <Typography className="title">{section.name}</Typography>
                </div>
                <div className="annotations">
                    { annoComponents }
                </div>
            </div> 
        )
    }

    renderSections(sections) {
        let sectionComponents = []
        for( let section of Object.values(sections) ) {
            const sectionComponent = this.renderSection(section)
            sectionComponents.push(sectionComponent)
        }

        return (
            <div className="sections">
                { sectionComponents }
            </div>
        )
    }

	render() {
        if( !this.props.annotations.loaded ) return null;
        
        const annotations = Object.values(this.props.annotations.annotations)

        let sections = {}
        for( let annotation of annotations ) {
            if( !sections[annotation.theme] ) {
                sections[annotation.theme] = { name: annotation.theme, annotations: [ annotation ] }
            } else {
                sections[annotation.theme].annotations.push( annotation )
            }
        }

        // TODO sort annotations alpabetically for each section, turn sections into a list

        return (
            <div id="annotation-list-view">
                <Paper className="titlebar">
                    <div className="list-mode-buttons">
                        <IconButton onClick={this.onDisplayCards}><span title="Display Cards" ><Icon.ThLarge /></span></IconButton>   
                        <div className="seperator"></div>
                        <IconButton onClick={this.onDisplayThumbs}><span title="Display Thumbnails" ><Icon.Th /></span></IconButton>   
                    </div>
                    <Typography variant='h4' gutterBottom>Annotations of BnF Ms. Fr. 640</Typography>
                </Paper>
                <div className="contentArea">
                    { this.renderTableOfContents(sections) }
                    { this.renderSections(sections) }
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
