import React, {Component} from 'react';
import {connect} from 'react-redux';

import SplitPaneView from './SplitPaneView';
import {dispatchAction} from '../model/ReduxStore';

import SearchResultView from './SearchResultView';
import TranscriptionView from './TranscriptionView';
import AnnotationView from './AnnotationView';

class SearchView extends Component {

    constructor(props) {
        super(props)

        this.state = {
            inSearchMode: true,
            detailView: 'TranscriptionView',
            annotationID: '',
            left: {
                width: 0
            },
            right: {
                iiifShortID: '',
                transcriptionType: 'tc',
                width: 0
            }
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
        this.setState((state) => {
            let nextState = {...state};
            nextState['left'].width = left;
            nextState['right'].width = right;
            return nextState;
        });
    }

    exitSearch() {
        const iiifShortID = this.state.right.iiifShortID;
        const folioID = this.props.document.folioNameByIDIndex[iiifShortID];
        const transcriptionType = this.state.right.transcriptionType;
        this.props.history.push(`/folios/${folioID}/${transcriptionType}`);
    }

    changeTranscriptionType( side, transcriptionType ) {        
        this.setState( (state) => {
            return {
                ...state,
                right: {
                    ...state.right,
                    transcriptionType
                }
            }
        });
    }

    changeCurrentFolio( id, side, transcriptionType ) {
        let iiifShortID = id.substr(id.lastIndexOf('/') + 1);

        this.setState( (state) => {
            return {
                ...state,
                detailView: 'TranscriptionView',
                right: {
                    ...state.right,
                    iiifShortID,
                    transcriptionType    
                }
            }
        });
        const folioID = this.props.document.folioNameByIDIndex[iiifShortID];
        this.props.history.push(`/search/folio/${folioID}/${transcriptionType}`);
    }

    changeCurrentAnnotation( annotationID ) {
        this.setState( (state) => {
            return {
                ...state,
                detailView: 'AnnotationView',
                annotationID
            }
        });
        this.props.history.push(`/search/annotation/${annotationID}`);
    }

    renderSearchResultView() {
        return (
            <SearchResultView searchActions={this.searchActions}></SearchResultView>
        );
    }

    transcriptionViewState() {
        const doc = this.props.document;
        const shortID = this.state.right.iiifShortID;
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
            ...this.state['right'],
            hasPrevious: current_hasPrev,
            hasNext: current_hasNext,
            previousFolioShortID: prevID,
            nextFolioShortID: nextID
        };
    }

    renderSearchDetail() {
        if( this.state.detailView === 'TranscriptionView' ) {
            // combine component state with state from props
            const docView = {
                ...this.state,
                right: this.transcriptionViewState()
            };

            return (
                <TranscriptionView
                        documentView={docView}
                        documentViewActions={this.searchActions}
                        key={`search-folio-${this.state.right.iiifShortID}`}
                        side='right'
                />
            );
        } else {
            return (
                <AnnotationView 
                    key={`search-anno-${this.state.annotationID}`}
                    inSearchMode={true}
                    annoID={this.state.annotationID} 
                />
            );
        }
    }

    render() {
        if( !this.props.document.loaded || !this.props.search.loaded ) { return null; }

        return (
            <div>
                <SplitPaneView 
                    leftPane={this.renderSearchResultView()} 
                    rightPane={this.renderSearchDetail()} 
                    inSearchMode={true}
                />
            </div>
        );
    }

}

function mapStateToProps(state) {
	return {
        search: state.search,
        document: state.document
	};
}

export default connect(mapStateToProps)(SearchView);
