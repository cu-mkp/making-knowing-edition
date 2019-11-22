import React, {Component} from 'react';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { CardActionArea } from '@material-ui/core';
import CardMedia from '@material-ui/core/CardMedia';

class AnnotationThumb extends Component {

    render() {
        const { annotation } = this.props
        const title = annotation.name.length > 0 ? annotation.name : `No Title (${annotation.id})`
        
        const cardMedia = (
            <CardMedia className="thumb-media" image="/img/watermark.png">
                <Typography className="title">{title}</Typography>
            </CardMedia>
        )

        return (
            <Card className='annothumb'>
                { annotation.contentURL ? 
                    <CardActionArea 
                        onClick={ e => {this.props.history.push(`/annotations/${annotation.id}`)}}
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
