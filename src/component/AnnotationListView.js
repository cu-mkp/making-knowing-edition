import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom'
import Parser from 'html-react-parser';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { CardContent, CardActionArea } from '@material-ui/core';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';

import { dispatchAction } from '../model/ReduxStore';
import CustomizedTooltops from './CustomizedTooltops';

const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porttitor tincidunt nunc vel pellentesque. In sagittis, nunc a luctus molestie, diam justo finibus tortor, ut rutrum nisi mauris ut elit. Morbi lorem urna, rhoncus eu venenatis at, varius quis mauris. Quisque pellentesque orci a libero malesuada, id semper sem dignissim. Duis dolor purus, rutrum et dictum id, laoreet vel nulla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Ut sed nibh libero. Integer gravida ut ipsum a pretium. Integer id libero ex."

class AnnotationListView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
    }

    renderEntryLinks(entryIDs) {
        let links = [];
        let idList = entryIDs.split(';');
        let lastID = idList.length > 0 ? idList[idList.length-1] : null
        for( let entryID of idList ) {
            let folioID = sliceZeros( entryID.split('_')[0].slice(1) );
            const comma = (entryID !== lastID) ? ',' : ''
            links.push(<Link key={entryID} to={`/folios/${folioID}`}>{entryID}{comma}</Link>);
        }
        return links;        
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

    renderAnnotation(annotation) {
        let abstract = (!annotation.abstract || annotation.abstract.length === 0 ) ? lorem : annotation.abstract;

        return (
        <Card className='anno' key={`anno-${annotation.id}`}>
            <CardActionArea 
                onClick={e => {this.props.history.push(`/annotations/${annotation.id}`)}}
            >
                <CardHeader 
                    title={annotation.name} 
                    subheader={this.renderByline(annotation.authors)}
                >            
                </CardHeader>
                <CardMedia style={{height: 200}} image="/bnf-ms-fr-640/images/ann_015_sp_15/0B33U03wERu0ea3I1REx5ek1Yb00.jpg">
                </CardMedia>
                </CardActionArea>
                <CardContent>
                    <Typography className='abstract'>{Parser(abstract)}</Typography>
                    <div className='details'>
                        {/* <Link to={`/annotations/${annotation.id}`}>View</Link> */}
                        <Typography className='entries'>(<i>{this.renderEntryLinks(annotation.entryIDs)}</i>)<span className='status-indicator icon fa fa-circle'></span></Typography>      
                        <Typography className='metadata'>{annotation.theme}, {annotation.semester} {annotation.year}</Typography>
                    </div>
                </CardContent>
        </Card>
        );
    }

    renderAnnotationList() {
        let annoList = [];
        for( let annotation of Object.values(this.props.annotations.annotations) ) {
            annoList.push( this.renderAnnotation(annotation) );
        }

        return (
            <div className="annotationList">
                { annoList }
            </div>
        );
    }

	render() {
        if( !this.props.annotations.loaded ) return null;
    
        return (
            <div id="annotation-list-view">
                <Typography variant='h3' gutterBottom>Annotations of BnF Ms. Fr. 640</Typography>
                <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porttitor tincidunt nunc vel pellentesque.</Typography>
                { this.renderAnnotationList() }
            </div>
        );
	}
}

function mapStateToProps(state) {
    return {
        annotations: state.annotations,
        authors: state.authors
    };
}

function sliceZeros(paddedID) {
    if( paddedID[0] && paddedID[0] === '0' ) {
        return sliceZeros(paddedID.slice(1))
    } else {
        return paddedID;
    }
}


// export default connect(mapStateToProps)(withStyles(AnnotationListView));
export default connect(mapStateToProps)(AnnotationListView);
