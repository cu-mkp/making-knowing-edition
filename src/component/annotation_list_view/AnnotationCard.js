import React, {Component} from 'react';
import {connect} from 'react-redux';
import Parser from 'html-react-parser';
import {Typography, Button} from '@material-ui/core';
import Card from '@material-ui/core/Card';
import { CardContent } from '@material-ui/core';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';

import CustomizedTooltops from '../CustomizedTooltops';

const comingSoon = "This essay is under revision."

class AnnotationCard extends Component {

    constructor() {
        super()

        this.state = {
            anchorEl: null
        }
    }

    renderByline( annotationAuthors ) {
        const { authors } = this.props.authors
        let authorInfos = []
        for( let authorID of annotationAuthors ) {
            authorInfos.push(authors[authorID])
        }

        let lastID = authorInfos.length > 0 ? authorInfos[authorInfos.length-1].id : null
        let authorInfoDivs = []
        for( let author of authorInfos ) {
            const frag = (
                <div>
                    <Typography><b>{author.fullName}</b></Typography>
                    <Typography>{author.semester} {author.year}</Typography>
                    <Typography>{author.authorType}</Typography>
                    <Typography>{author.degree} {author.yearAtTime}</Typography>
                    <Typography>{author.department} {author.subField}</Typography>
                </div>
            )

            authorInfoDivs.push(
                <CustomizedTooltops key={author.id} 
                    htmlFragment={frag}
                    inner={<span>{author.fullName}{ (author.id !== lastID) ? ', ' : '' }</span>}
                >                    
                </CustomizedTooltops>                  
            )
        }
        return authorInfoDivs
    }

    handleClick = (event) => {
        this.setState({ ...this.state, anchorEl: event.currentTarget })
    }
    
    handleClose = () => {
        this.setState({ ...this.state, anchorEl: null })
    }

    render() {
        const { annotation, diplomatic } = this.props

        const { releaseMode } = diplomatic
        const abstract = (!annotation.abstract || annotation.abstract.length === 0 ) ? comingSoon : annotation.abstract;
        const title = annotation.name.length > 0 ? annotation.name : `No Title (${annotation.id})`
        const thumbnailURL = annotation.thumbnail ? `${process.env.REACT_APP_EDITION_DATA_URL}/annotations-thumbnails/${annotation.thumbnail}` : "/img/watermark.png"

        return (
            <Card className='anno'>
                <CardHeader 
                    title={title} 
                    subheader={annotation.authors ? this.renderByline(annotation.authors) : ""}
                >            
                </CardHeader>
                <CardMedia style={{height: 200}} image={thumbnailURL}>
                </CardMedia>
                <CardContent>
                    <span className='abstract'>{Parser(abstract)}</span>
                    { (annotation.status === 'staging' && releaseMode !== 'production') ? 
                        <span style={{color: 'green'}}><b>** IN STAGING **</b></span>                    
                    : null }
                    { (annotation.contentURL && ( releaseMode !== 'production' || ( releaseMode === 'production' && annotation.status === 'published' ))) ? 
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
