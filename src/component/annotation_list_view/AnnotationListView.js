import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Paper, Typography } from '@material-ui/core';
import { Icon } from "react-font-awesome-5";
import { dispatchAction } from '../../model/ReduxStore';

import AnnotationCard from './AnnotationCard';
import AnnotationThumb from './AnnotationThumb';

class AnnotationListView extends Component {

    constructor() {
        super()

        this.state = {
            listMode: 'thumbs'
        }
    }

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', true );
    }

    renderTableOfContents() {
        return (
            <Paper className="tocbar">
                <Typography variant='h6' gutterBottom>Making &amp; Knowing Workshops</Typography>
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

	render() {
        if( !this.props.annotations.loaded ) return null;

        let annoList = [];
        for( let annotation of Object.values(this.props.annotations.annotations) ) {
            if( this.state.listMode === 'cards' ) {
                annoList.push(<AnnotationCard history={this.props.history} key={`anno-${annotation.id}`} annotation={annotation}></AnnotationCard>);            
            }
            else {
                annoList.push(<AnnotationThumb history={this.props.history} key={`anno-${annotation.id}`} annotation={annotation}></AnnotationThumb>)
            }     
        }

        return (
            <div id="annotation-list-view">
                <Paper className="titlebar">
                    <div className="list-mode-buttons">
                        <span title="Display Cards" onClick={this.onDisplayCards}><Icon.ThLarge size="2x"/></span>
                        <span className="seperator"> | </span>
                        <span title="Display Thumbnails" onClick={this.onDisplayThumbs}><Icon.Th size="2x"/></span>
                    </div>
                    <Typography variant='h4' gutterBottom>Annotations of BnF Ms. Fr. 640</Typography>
                </Paper>
                <div className="contentArea">
                    { this.renderTableOfContents() }
                    <Paper className="anno-list">
                        { annoList }
                    </Paper>   
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
