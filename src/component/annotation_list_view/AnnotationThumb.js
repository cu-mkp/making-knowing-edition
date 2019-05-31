import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { CardContent, CardActionArea } from '@material-ui/core';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';

class AnnotationThumb extends Component {


    render() {
        const { annotation } = this.props

        return (
            <Card className='annothumb'>
                <CardActionArea 
                    onClick={e => {this.props.history.push(`/annotations/${annotation.id}`)}}
                >
                    <CardMedia className="thumb-media" image="/bnf-ms-fr-640/images/ann_015_sp_15/0B33U03wERu0ea3I1REx5ek1Yb00.jpg">
                        <Typography className="title">{annotation.name}</Typography>
                    </CardMedia>
                </CardActionArea>
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
