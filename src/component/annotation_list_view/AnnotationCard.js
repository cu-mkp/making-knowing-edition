import React, {Component} from 'react';
import {connect} from 'react-redux';
import Parser from 'html-react-parser';
import {Typography, Button} from '@material-ui/core';
import Card from '@material-ui/core/Card';
import { CardContent } from '@material-ui/core';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';

import CustomizedTooltops from '../CustomizedTooltops';

const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porttitor tincidunt nunc vel pellentesque. In sagittis, nunc a luctus molestie, diam justo finibus tortor, ut rutrum nisi mauris ut elit. Morbi lorem urna, rhoncus eu venenatis at, varius quis mauris. Quisque pellentesque orci a libero malesuada, id semper sem dignissim. Duis dolor purus, rutrum et dictum id, laoreet vel nulla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Ut sed nibh libero. Integer gravida ut ipsum a pretium. Integer id libero ex."

class AnnotationCard extends Component {

    constructor() {
        super()

        this.state = {
            anchorEl: null
        }
    }

    // TODO remove or refactor display of links
    // renderEntryLinks() {
    //     const {entryIDs} = this.props.annotation

    //     let links = [];
    //     let idList = entryIDs.split(';');
    //     for( let entryID of idList ) {
    //         let folioID = sliceZeros( entryID.split('_')[0].slice(1) );
    //         links.push( <MenuItem  key={entryID} onClick={this.handleClose}> <Link to={`/folios/${folioID}`}><Typography>{folioID}</Typography></Link></MenuItem>);
    //     }
    //     return links;        
    // } 

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
        const { annotation } = this.props

        let abstract = (!annotation.abstract || annotation.abstract.length === 0 ) ? lorem : annotation.abstract;

        return (
            <Card className='anno'>
                <CardHeader 
                    title={annotation.name} 
                    subheader={this.renderByline(annotation.authors)}
                >            
                </CardHeader>
                <CardMedia style={{height: 200}} image="/bnf-ms-fr-640/images/ann_015_sp_15/0B33U03wERu0ea3I1REx5ek1Yb00.jpg">
                </CardMedia>
                <CardContent>
                    <Typography className='abstract'>{Parser(abstract)}</Typography>
                    <div className='details'>
                        <Button onClick={e => {this.props.history.push(`/annotations/${annotation.id}`)}}>Read Annotation</Button>
                    </div>
                </CardContent>
            </Card>

            // <span className='status-indicator icon fa fa-circle'></span>
        );
    }
}

function mapStateToProps(state) {
    return {
        authors: state.authors
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
