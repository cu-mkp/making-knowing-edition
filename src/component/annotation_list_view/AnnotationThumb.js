import React, {Component} from 'react';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { CardActionArea } from '@material-ui/core';
import CardMedia from '@material-ui/core/CardMedia';
import Parser from 'html-react-parser';

class AnnotationThumb extends Component {

    render() {
        const { annotation } = this.props
        const title = annotation.name.length > 0 ? annotation.name : `No Title (${annotation.id})`
        const thumbnailURL = annotation.thumbnail ? `${process.env.REACT_APP_EDITION_DATA_URL}/annotations-thumbnails/${annotation.thumbnail}` : "/img/watermark.png"

        const cardMedia = (
            <CardMedia className="thumb-media" image={thumbnailURL}>
                <Typography className="title">{Parser(title)}</Typography>
            </CardMedia>
        )

        return (
            <Card className='annothumb'>
                { annotation.contentURL ? 
                    <CardActionArea 
                        onClick={ e => {this.props.history.push(`/essays/${annotation.id}`)}}
                    >
                        { cardMedia }
                    </CardActionArea>
                : cardMedia }
            </Card>
        );
    }
}

function mapStateToProps(state) {
    return {
        authors: state.authors
    };
}

export default connect(mapStateToProps)(AnnotationThumb);
