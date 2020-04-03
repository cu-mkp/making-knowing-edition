import React, {Component} from 'react';
import {connect} from 'react-redux';

import SplitPaneView from './SplitPaneView';
import {dispatchAction} from '../model/ReduxStore';

import SearchResultView from './SearchResultView';
import TranscriptionView from './TranscriptionView';
import AnnotationView from './AnnotationView';
import { withWidth } from '@material-ui/core';
import { isWidthUp } from '@material-ui/core/withWidth';

class SearchView extends Component {

    constructor(props) {
        super(props)

        this.state = {
            leftWidth: 0,
            rightWidth: 0
        }

        this.searchActions = {
            changeTranscriptionType: this.changeTranscriptionType.bind(this),
            changeCurrentFolio: this.changeCurrentFolio.bind(this),
            changeCurrentAnnotation: this.changeCurrentAnnotation.bind(this),
            exitSearch: this.exitSearch.bind(this)
        }
    }

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', true );
    }

    onWidth = ( left, right ) => {
        this.setState({
            leftWidth: left,
            rightWidth: right
        });
    }

    exitSearch() {
        if( this.props.folioID ) {
            const folioID = this.props.folioID;
            const transcriptionType = this.props.transcriptionType;
            this.props.history.push(`/folios/${folioID}/${transcriptionType}`);    
        } else if( this.props.annotationID ) {
            const annotationID = this.props.annotationID
            this.props.history.push(`/essays/${annotationID}`);    
        } else {
            this.props.history.push(`/folios`);    
        }
    }

    changeTranscriptionType( side, transcriptionType ) {   
        const folioID = this.props.folioID; 
        const searchQuery = this.props.search.results.searchQuery;
        this.props.history.push(`/search/folio/${folioID}/${transcriptionType}?q=${searchQuery}`);    
    }

    changeCurrentFolio( id, side, transcriptionType ) {
        let iiifShortID = id.substr(id.lastIndexOf('/') + 1);
        const folioID = this.props.document.folioNameByIDIndex[iiifShortID];
        const searchQuery = this.props.search.results.searchQuery;
        const url = encodeURI(`/search/folio/${folioID}/${transcriptionType}?q=${searchQuery}`);
        this.props.history.push(url);
    }

    changeCurrentAnnotation( annotationID ) {
        const searchQuery = this.props.search.results.searchQuery;
        const url = encodeURI(`/search/annotation/${annotationID}?q=${searchQuery}`);
        this.props.history.push(url);
    }

    renderSearchResultView() {
        return (
            <SearchResultView 
                history={this.props.history}
                searchActions={this.searchActions}>
            </SearchResultView>
        );
    }

    transcriptionViewState() {
        const doc = this.props.document;
        const shortID = this.props.document.folioIDByNameIndex[this.props.folioID];

        let nextID = '';
        let prevID = '';
        let current_hasPrev = false;
        let current_hasNext = false;
        let current_idx = doc.folioIndex.indexOf(shortID);
        if (current_idx > -1) {
            current_hasNext = (current_idx < (doc.folioIndex.length - 1));
            nextID = current_hasNext ? doc.folioIndex[current_idx + 1] : '';
    
            current_hasPrev = (current_idx > 0 && doc.folioIndex.length > 1);
            prevID = current_hasPrev ? doc.folioIndex[current_idx - 1] : '';
        }

        return {
            iiifShortID: shortID,
            transcriptionType: this.props.transcriptionType,
            width: this.state.rightWidth,
            hasPrevious: current_hasPrev,
            hasNext: current_hasNext,
            previousFolioShortID: prevID,
            nextFolioShortID: nextID
        };
    }

    renderSearchDetail() {
        if( this.props.folioID ) {
            // combine component state with state from props
            const docView = {
                inSearchMode: true,
                left: {
                    width: this.state.leftWidth
                },
                right: this.transcriptionViewState()
            };

            return (
                <TranscriptionView
                        documentView={docView}
                        documentViewActions={this.searchActions}
                        key={`search-folio-${this.props.folioID}`}
                        side='right'
                />
            );
        } else {
            return (
                <AnnotationView 
                    key={`search-anno-${this.props.annotationID}`}
                    inSearchMode={true}
                    annoID={this.props.annotationID} 
                />
            );
        }
    }

    render() {
        if( !this.props.document.loaded || 
            !this.props.search.index ||
            !this.props.search.index.loaded ||
            !this.props.search.results ) { 
                return (
                    <div style={{display: "flex", justifyContent: "center", padding: "150px 0 150px 0"}}>
                        <div className="loading" style={{width: "fit-content"}}>
                            <img alt="Loading, please wait." src="/img/spinner.gif"></img>
                        </div>
                    </div>
                ); 
            }
        if(isWidthUp('md', this.props.width)){
            return(
                <div>
                    <SplitPaneView
                        leftPane={this.renderSearchResultView()}
                        rightPane={this.renderSearchDetail()}
                        inSearchMode={true}
                    />
                </div>
            )
        } else {
            return(
                <div>
                    {this.renderSearchResultView()}
                </div>
            )
        }
    }

}

function mapStateToProps(state) {
	return {
        search: state.search,
        document: state.document
	};
}

export default withWidth() (connect(mapStateToProps)(SearchView));
