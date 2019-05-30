import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Paper, Typography } from '@material-ui/core';
import { dispatchAction } from '../../model/ReduxStore';
import AnnotationCard from './AnnotationCard';
import {Icon} from "react-font-awesome-5";

class AnnotationListView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
    }

	render() {
        if( !this.props.annotations.loaded ) return null;

        let annoList = [];
        for( let annotation of Object.values(this.props.annotations.annotations) ) {
            annoList.push(<AnnotationCard key={`anno-${annotation.id}`} annotation={annotation}></AnnotationCard>);
        }

        return (
            <div id="annotation-list-view">
                <Paper className="titlebar">
                    <div className="list-mode-buttons">
                        <Icon.ThLarge size="2x"/> | <Icon.Th size="2x"/>
                    </div>
                    <Typography variant='h4' gutterBottom>Annotations of BnF Ms. Fr. 640</Typography>
                </Paper>
                <div className="contentArea">
                    <Paper className="tocbar">
                        <Typography variant='h6' gutterBottom>Making &amp; Knowing Workshops</Typography>
                        <Typography>Metal Working and Moldmaking</Typography>
                        <Typography>Colormaking</Typography>
                        <Typography>Practical Knowledge</Typography>
                        <Typography>Ephemeral Art</Typography>
                        <Typography>Print and Impression</Typography>
                    </Paper>
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
