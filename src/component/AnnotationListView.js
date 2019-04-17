import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom'
import Parser from 'html-react-parser';
import Typography from '@material-ui/core/Typography';

import { dispatchAction } from '../model/ReduxStore';
import CustomizedTooltops from './CustomizedTooltops';

const lorem = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porttitor tincidunt nunc vel pellentesque. In sagittis, nunc a luctus molestie, diam justo finibus tortor, ut rutrum nisi mauris ut elit. Morbi lorem urna, rhoncus eu venenatis at, varius quis mauris. Quisque pellentesque orci a libero malesuada, id semper sem dignissim. Duis dolor purus, rutrum et dictum id, laoreet vel nulla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Ut sed nibh libero. Integer gravida ut ipsum a pretium. Integer id libero ex.</p>"

class AnnotationListView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', false );
    }

    renderEntryLinks(entryIDs) {
        let links = [];
        let idList = entryIDs.split(';');
        for( let entryID of idList ) {
            let folioID = sliceZeros( entryID.split('_')[0].slice(1) );
            links.push(<Link key={entryID} to={`/folios/${folioID}`}>{entryID}</Link>);
        }
        return links;        
    } 

    renderByline( annotationAuthors ) {
        const { authors } = this.props.authors
        let authorInfos = annotationAuthors.map( authorID => authors[authorID] )

        let lastID = authorInfos.length > 0 ? authorInfos[authorInfos.length-1].id : null
        return authorInfos.map( author => {

            const frag = (
                <div>
                    <Typography><b>{author.fullName}</b></Typography>
                    <Typography>{author.semester} {author.year}</Typography>
                    <Typography>{author.authorType}</Typography>
                    <Typography>{author.degree} {author.yearAtTime}</Typography>
                    <Typography>{author.department} {author.subField}</Typography>
                </div>
            )

            return (
                <CustomizedTooltops key={author.id} 
                    htmlFragment={frag}
                    inner={<span>{author.fullName}{ (author.id !== lastID) ? ', ' : '' }</span>}
                >                    
                </CustomizedTooltops>                  
            )
        })
    }

    renderAnnotation(annotation) {
        let abstract = (!annotation.abstract || annotation.abstract.length === 0 ) ? lorem : annotation.abstract;

        return (
        <div className='anno' key={`anno-${annotation.id}`}>
            <div className='status'>Status: <span className='status-indicator icon fa fa-circle'></span></div>
            <h2 className='title'><Link to={`/annotations/${annotation.id}`}>{annotation.name}</Link></h2>
            <div className='byline'>By: {this.renderByline(annotation.authors)}</div>
            <div>
                <div className='thumbnail'><span className='icon fa fa-10x fa-flask'></span></div>
                <div className='abstract'>{Parser(abstract)}</div>
            </div>
             <div className='details'>
                <span className='metadata'>{annotation.theme}, {annotation.semester} {annotation.year}</span>
                <span className='entries'>{this.renderEntryLinks(annotation.entryIDs)}</span>
            </div>
        </div>
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
                <h1> Annotations of BnF Ms. Fr. 640</h1>
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
