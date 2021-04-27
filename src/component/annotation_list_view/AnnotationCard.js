import React, {Component} from 'react';
import {connect} from 'react-redux';
import Parser from 'html-react-parser';
import Card from '@material-ui/core/Card';
import { CardActionArea, Link } from '@material-ui/core';
import CardMedia from '@material-ui/core/CardMedia';
import AnnotationByLine from '../AnnotationByLine';

const comingSoon = "This essay is under revision."
class AnnotationCard extends Component {

    constructor() {
        super()

        this.state = {
            anchorEl: null,
            isExpanded: false,
        }
    }

    handleClick = (event) => {
        event.preventDefault();
        this.setState({ ...this.state, anchorEl: event.currentTarget });
    }
    
    handleClose = () => {
        this.setState({ ...this.state, anchorEl: null })
    }
    handleExpandCollapse = () => this.setState({ ...this.state, isExpanded: !this.state.isExpanded})

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
        const theme = annotation.theme.length > 0 ? `${annotation.theme}` : `No Theme (${annotation.id})`
        const truncateByWordCount = (str, maxWords) => str.split(" ").splice(0,maxWords).join(" ") + '...';

        function removeTags(str) {
            if ((str===null) || (str===''))
                return false;
            else
                str = str.toString();
                  
            // Regular expression to identify HTML tags in 
            // the input string. Replacing the identified 
            // HTML tag with a null string.
            return str.replace( /(<([^>]+)>)/ig, '');
        }

        const goToEssay = e => this.props.history.push(`/essays/${annotation.id}`);
        const essayIsReadable = (annotation.contentURL && ( releaseMode !== 'production' || ( releaseMode === 'production' && (annotation.status === 'published' || annotation.status === 'done') )))
        return (
            <Card 
                className={`annotation-card ${this.state.isExpanded ? 'expanded' : ''}`}
            >
                <div className='bg-maroon-gradient accent-bar'/>
                <CardActionArea
                    onClick={goToEssay}
                    disabled={!essayIsReadable}
                >
                    <CardMedia style={{height: 200}} image={thumbnailUrl}/>
                    <div className='card-lr-padding theme-title-container'>
                        <p className='anno-theme'>{theme}</p>
                        <p className='anno-title'>{(Parser(title))}</p>
                        { (annotation.status === 'staging' && releaseMode !== 'production') ? 
                            <span style={{color: 'green'}}>
                                <b>** IN STAGING **</b>
                            </span>                    
                            : null 
                        }
                        <p className='anno-byline'>
                            {annotation.authors && 
                                <AnnotationByLine 
                                    annoAuthors={annotation.authors} 
                                    authors={authors.authors} 
                                />
                            }
                        </p>
                    </div>
                </CardActionArea>
                <div className='card-lr-padding abstract-container'>
                    {this.state.isExpanded ?
                        <span className='anno-abstract'>
                            {Parser(abstract)}
                        </span> :
                        <span className='anno-abstract'>
                            {abstract.length > 30 ?  truncateByWordCount(removeTags(abstract), 15) : abstract}
                        </span>
                    }
                    {abstract.length > 30 &&
                        <Link onClick={this.handleExpandCollapse} className='expand-collapse-toggle'>({this.state.isExpanded ? 'Collapse' : 'Expand'})</Link>
                    }
                    <div className='read-essay-link'>
                        { essayIsReadable && 
                            <Link 
                                style={{color: "#444444", textDecoration: "none"}} 
                                className='cta-link with-icon light' 
                                onClick={goToEssay}
                            >
                                Read Essay
                            </Link>
                        }
                    </div>
                </div>
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
