import React, {Component} from 'react';
import {connect} from 'react-redux';
import Parser from 'html-react-parser';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import { CardContent } from '@material-ui/core';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import AnnotationByLine from '../AnnotationByLine';

const comingSoon = "This essay is under revision."

class AnnotationCard extends Component {

    constructor() {
        super()

        this.state = {
            anchorEl: null
        }
    }

    handleClick = (event) => {
        this.setState({ ...this.state, anchorEl: event.currentTarget })
    }
    
    handleClose = () => {
        this.setState({ ...this.state, anchorEl: null })
    }

    render() {
        const { annotation, diplomatic, authors } = this.props
        const { releaseMode } = diplomatic
        const abstract = (!annotation.abstract || annotation.abstract.length === 0 ) ? comingSoon : annotation.abstract;
        const displayOrderReadout = releaseMode !== 'production' ? ` <small style="color: grey">(${annotation.displayOrder})</small>` : ""
        const title = annotation.name.length > 0 ? `${annotation.name}${displayOrderReadout}` : `No Title (${annotation.id})`

        const localUrl = annotation.thumbnail ? 
            `${process.env.REACT_APP_EDITION_DATA_URL}/annotations-thumbnails/${annotation.thumbnail}` 
            : "/img/watermark.png"
        const s3Url = annotation.s3ThumbUrl;
        const thumbnailUrl = annotation.dataSource === 'gh' ? s3Url : localUrl;

        return (
            <Card className='anno'>
                <CardHeader 
                    title={Parser(title)} 
                    subheader={annotation.authors ? <AnnotationByLine annoAuthors={annotation.authors} authors={authors.authors} />  : ""}
                >            
                </CardHeader>
                <CardMedia style={{height: 200}} image={thumbnailUrl}>
                </CardMedia>
                <CardContent>
                    <span className='abstract'>{Parser(abstract)}</span>
                    { (annotation.status === 'staging' && releaseMode !== 'production') ? 
                        <span style={{color: 'green'}}><b>** IN STAGING **</b></span>                    
                    : null }
                    { (annotation.contentURL && ( releaseMode !== 'production' || ( releaseMode === 'production' && (annotation.status === 'published' || annotation.status === 'done') ))) ? 
                        <div className='details'>
                            <Button onClick={e => {this.props.history.push(`/essays/${annotation.id}`)}}>Read Essay</Button>
                        </div>
                    : null }
                </CardContent>
            </Card>

            // <span className='status-indicator icon fa fa-circle'></span>
        );
    }
}

function mapStateToProps(state) {
    return {
        authors: state.authors,
        diplomatic: state.diplomatic
    };
}

// function sliceZeros(paddedID) {
//     if( paddedID[0] && paddedID[0] === '0' ) {
//         return sliceZeros(paddedID.slice(1))
//     } else {
//         return paddedID;
//     }
// }


export default connect(mapStateToProps)(AnnotationCard);
