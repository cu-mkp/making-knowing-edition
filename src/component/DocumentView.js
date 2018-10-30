import React, {Component} from 'react';
import {connect} from 'react-redux';

import SplitPaneView from './SplitPaneView';
import {dispatchAction} from '../model/ReduxStore';
import DocumentHelper from '../model/DocumentHelper';

import ImageView from './ImageView';
import ImageGridView from './ImageGridView';
import TranscriptionView from './TranscriptionView';
import XMLView from './XMLView';

class DocumentView extends Component {

    constructor(props) {
        super(props)

        const paneDefaults = {
            iiifShortID: '',
            transcriptionType: 'tc',
            nextFolioShortID: '',
            previousFolioShortID: '',
            hasPrevious: false,
            hasNext: false,
            isXMLMode: false,
            isGridMode: false,
            width: 0
        }

        this.state = {
            linkedMode: true,
            bookMode: false,
            inSearchMode:false,
            left: {
                ...paneDefaults,
                viewType: 'ImageGridView'
            },
            right: {
                ...paneDefaults,
                viewType: 'TranscriptionView'
            }
        }

        this.documentViewActions = {
            setXMLMode: this.setXMLMode.bind(this),
            setLinkedMode: this.setLinkedMode.bind(this),
            setBookMode: this.setBookMode.bind(this),
            setPaneViewtype: this.setPaneViewtype.bind(this),
            setColumnModeForSide: this.setColumnModeForSide.bind(this),
            changeTranscriptionType: this.changeTranscriptionType.bind(this),
            changeCurrentFolio: this.changeCurrentFolio.bind(this),
            enterSearchMode: this.enterSearchMode.bind(this),
            exitSearchMode: this.exitSearchMode.bind(this),
            setWidths: this.setWidths.bind(this)
        }
    }

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', true );
    }

    setXMLMode( side, xmlMode ) {
        this.setState((state) => {
            let nextState = { ...state };
            nextState[side].viewType = xmlMode ? 'XMLView' : 'TranscriptionView'
            nextState[side].isXMLMode = xmlMode
            return nextState;
        });
    }
    
    setLinkedMode( linkedMode ) {
        this.setState((state) => {
            return Object.assign({}, state, {
                linkedMode: linkedMode
            })
        });
    }
    
    // TODO URL
    setBookMode( doc, shortid, status ) {
        this.setState((state) => {
            // Missing index warning
            if(doc.folioIndex.length === 0){
                console.log("WARNING: SET_BOOK_MODE reducer - folio index not defined, cannot determine next/previous, leaving state alone");
            }
        
            // Exiting bookmode
            if(!status){
                return {
                    ...state,
                    bookMode: status
                };    
            // Entering bookmode
            }else{    
                let versoID=DocumentHelper.findNearestVerso(shortid, doc.folioNameByIDIndex, doc.folioIndex);
                let current_idx = doc.folioIndex.indexOf(versoID);
                let nextID = '';
                let prevID = '';
                let nextNextID='';
                let current_hasPrev = false;
                let current_hasNext = false;
                let current_hasNextNext = false;
                if (current_idx > -1) {
                    current_hasNext = (current_idx < (doc.folioIndex.length - 1));
                    nextID = current_hasNext ? doc.folioIndex[current_idx + 1] : '';
                    current_hasNextNext = (current_idx < (doc.folioIndex.length - 2));
                    nextNextID = current_hasNextNext ? doc.folioIndex[current_idx + 2] : '';
                    current_hasPrev = (current_idx > 0 && doc.folioIndex.length > 1);
                    prevID = current_hasPrev ? doc.folioIndex[current_idx - 1] : '';
                }
                return {
                    ...state,
                    bookMode: status,
                    left:{
                        ...state.left,
                        iiifShortID: versoID,
                        hasPrevious: current_hasPrev,
                        hasNext: current_hasNextNext,
                        previousFolioShortID: prevID,
                        nextFolioShortID: nextNextID,
                        viewType:'ImageView'
                    },
                    right:{
                        ...state.right,
                        iiifShortID: nextID,
                        hasPrevious: current_hasPrev,
                        hasNext: current_hasNextNext,
                        previousFolioShortID: prevID,
                        nextFolioShortID: nextNextID,
                        viewType:'ImageView'
                    }
                };
            }
        });
    }

    setWidths( left, right ) {
        this.setState((state) => {
            return {
                ...state,
                left:{	...state.left,
                        width: left},
                right:{	...state.right,
                        width: right}
            };
        });
    }

    setPaneViewtype( side, viewType ) {
        this.setState((state) => {
            if(side === 'left'){
                return {
                    ...state,
                    left:{
                        ...state.left,
                        viewType: viewType
                    }
                };
            } else {
                return {
                    ...state,
                    right:{
                        ...state.right,
                        viewType: viewType
                    }
                };
            }
        })
    };

    setColumnModeForSide( side, newState ) {
        this.setState((state) => {
            if(side === 'left'){
                return {
                    ...state,
                    left:{
                        ...state.left,
                        isGridMode: newState
                    }
                };
            }else{
                return {
                    ...state,
                    right:{
                        ...state.right,
                        isGridMode: newState
                    }
                };
            }
        });
    }

    // TODO refactor into URL
    changeTranscriptionType( side, transcriptionType ) {
        this.setState((state) => {
            let xmlMode = state[side].isXMLMode;
            let viewType = xmlMode ? 'XMLView' : 'TranscriptionView';
        
            if (transcriptionType === 'f'){
                viewType = 'ImageView';
                xmlMode = false;
            }
        
            if(side === 'left'){
                return {
                    ...state,
                    left:{
                        ...state.left,
                        transcriptionType: transcriptionType,
                        viewType:viewType,
                        isXMLMode: xmlMode
                    }
                };
            }else{
                return {
                    ...state,
                    right:{
                        ...state.right,
                        transcriptionType: transcriptionType,
                        viewType:viewType,
                        isXMLMode: xmlMode
                    }
                };
            }
        });
    }

    // TODO refactor into URL
    changeCurrentFolio( doc, id, side, transcriptionType, direction ) {
        this.setState((state) => {
            if(doc.folioIndex.length === 0){
                console.log("WARNING: DocumentView.changeCurrentFolio - folio index not defined, cannot change folio, leaving state alone");
                return;
            }
    
            // Lookup prev/next
            let shortID = id.substr(id.lastIndexOf('/') + 1);
        
            // Book mode? (recto/verso)
            if( state.bookMode ){
                let versoID=DocumentHelper.findNearestVerso(shortID, doc.folioNameByIDIndex, doc.folioIndex, direction);
                let current_idx = doc.folioIndex.indexOf(versoID);
                let nextID = '';
                let prevID = '';
                let nextNextID='';
                let current_hasPrev = false;
                let current_hasNext = false;
                let current_hasNextNext = false;
                if (current_idx > -1) {
                    current_hasNext = (current_idx < (doc.folioIndex.length - 1));
                    nextID = current_hasNext ? doc.folioIndex[current_idx + 1] : '';
                    current_hasNextNext = (current_idx < (doc.folioIndex.length - 2));
                    nextNextID = current_hasNextNext ? doc.folioIndex[current_idx + 2] : '';
                    current_hasPrev = (current_idx > 0 && doc.folioIndex.length > 1);
                    prevID = current_hasPrev ? doc.folioIndex[current_idx - 1] : '';
                }
                return {
                    ...state,
                    left:{
                        ...state.left,
                        iiifShortID: versoID,
                        hasPrevious: current_hasPrev,
                        hasNext: current_hasNextNext,
                        previousFolioShortID: prevID,
                        nextFolioShortID: nextNextID
                    },
                    right:{
                        ...state.right,
                        iiifShortID: nextID,
                        hasPrevious: current_hasPrev,
                        hasNext: current_hasNextNext,
                        previousFolioShortID: prevID,
                        nextFolioShortID: nextNextID
                    }
                };
            }
        
            // Not book mode
            let current_idx = doc.folioIndex.indexOf(shortID);
            let nextID = '';
            let prevID = '';
            let current_hasPrev = false;
            let current_hasNext = false;
            if (current_idx > -1) {
                current_hasNext = (current_idx < (doc.folioIndex.length - 1));
                nextID = current_hasNext ? doc.folioIndex[current_idx + 1] : '';
        
                current_hasPrev = (current_idx > 0 && doc.folioIndex.length > 1);
                prevID = current_hasPrev ? doc.folioIndex[current_idx - 1] : '';
            }
            if(state.linkedMode){
                return {
                    ...state,
                    left:{
                        ...state.left,
                        iiifShortID: shortID,
                        hasPrevious: current_hasPrev,
                        hasNext: current_hasNext,
                        previousFolioShortID: prevID,
                        nextFolioShortID: nextID
                    },
                    right:{
                        ...state.right,
                        iiifShortID: shortID,
                        hasPrevious: current_hasPrev,
                        hasNext: current_hasNext,
                        previousFolioShortID: prevID,
                        nextFolioShortID: nextID
                    }
                };
            } else {
                if(side === 'left'){
                    let type = (typeof transcriptionType === 'undefined')?state[side].transcriptionType:transcriptionType;
                    return {
                        ...state,
                        left:{
                            ...state.left,
                            transcriptionType: type,
                            iiifShortID: shortID,
                            hasPrevious: current_hasPrev,
                            hasNext: current_hasNext,
                            previousFolioShortID: prevID,
                            nextFolioShortID: nextID
                        }
                    };
                }else{
                    let type = (typeof transcriptionType === 'undefined')?state[side].transcriptionType:transcriptionType;
            
                    return {
                        ...state,
                        right:{
                            ...state.right,
                            transcriptionType: type,
                            iiifShortID: shortID,
                            hasPrevious: current_hasPrev,
                            hasNext: current_hasNext,
                            previousFolioShortID: prevID,
                            nextFolioShortID: nextID
                        }
                    };
                }
            }
        });
    }

    enterSearchMode() {    
        this.setState( {
            ...this.state,
            linkedMode: false,
            bookMode: false,
            inSearchMode: true,
        
            left: {
                ...this.state.left,
                viewType: 'SearchResultView'
            },
        
            right:{
                ...this.state.right,
                isGridMode: false,
                viewType: 'TranscriptionView',
                transcriptionType: 'tc',
                iiifShortID: '',
                nextFolioShortID: '',
                previousFolioShortID: ''
            }
        });
    }

    exitSearchMode() {
        // If we have a folio selected in search results, match the left pane
        // otherwise just clear and gridview
        let leftState;
        if(parseInt(this.state.right.iiifShortID,10) === -1){
            leftState = {
                ...this.state.left,
                viewType: 'ImageGridView',
                iiifShortID: '',
                // hasPrevious: false,
                // hasNext: false,
                nextFolioShortID: '',
                previousFolioShortID: ''
            };
        }else{
            leftState = {
                ...this.state.right,
                viewType: 'ImageView'
            };
        }
    
        this.setState( {
            ...this.state,
            linkedMode: true,
            inSearchMode: false,
            left: leftState,
            right:{
                ...this.state.right,
            }
        } );
    };

    determineViewType(side) {
        const transcriptionType = this.props.viewports[side].transcriptionType;
        const gridMode = this.props.viewports[side].isGridMode;
        const xmlMode = this.state[side].isXMLMode;

        if( gridMode === true ) {
            return 'ImageGridView';
        }

        if( transcriptionType === 'f' ) {
            return 'ImageView';
        } else {
            return xmlMode ? 'XMLView' : 'TranscriptionView';
        }
    }

    determineNextPrev(folioID) {
        const doc = this.props.document;
        const shortID = doc.folioNameByIDIndex[folioID];

        // Not book mode
        let current_idx = doc.folioIndex.indexOf(shortID);
        let nextID = '';
        let prevID = '';
        let current_hasPrev = false;
        let current_hasNext = false;
        if (current_idx > -1) {
            current_hasNext = (current_idx < (doc.folioIndex.length - 1));
            nextID = current_hasNext ? doc.folioIndex[current_idx + 1] : '';
    
            current_hasPrev = (current_idx > 0 && doc.folioIndex.length > 1);
            prevID = current_hasPrev ? doc.folioIndex[current_idx - 1] : '';
        }

        return {
            hasPrevious: current_hasPrev,
            hasNext: current_hasNext,
            previousFolioShortID: prevID,
            nextFolioShortID: nextID
        };
    }

    renderPane(side,docView) {
        const viewType = this.determineViewType(side);
        const key = this.viewPaneKey(side);

        if( viewType === 'ImageView') {
            return (
                <ImageView
                    key={key}
                    documentView={docView}
                    documentViewActions={this.documentViewActions}
                    side={side}
                />
            );
        } else if( viewType === 'TranscriptionView' ) {
            return(
                <TranscriptionView
                    key={key}
                    documentView={docView}
                    documentViewActions={this.documentViewActions}
                    side={side}
                />
            );
        } else if( viewType === 'XMLView' ) {
            return(
                <XMLView
                    key={key}
                    documentView={docView}
                    documentViewActions={this.documentViewActions}
                    side={side}
                />
            );
        } else if( viewType === 'ImageGridView' ) {
            return (
                <ImageGridView
                    key = {key}
                    documentView={docView}
                    documentViewActions={this.documentViewActions}
                    side={side}
                />
            );
        } else {
            return (
                <div>ERROR: Unrecognized viewType.</div>
            );
        }
    }	      
    
    viewPaneKey(side) {
        const pane = this.state[side];

		if (pane.viewType === 'ImageGridView') {
			return `${side}-${pane.viewType}`;
		} else {
			if(typeof pane.folio !== 'undefined'){
				return `${side}-${pane.viewType}-${pane.folio.id}`;
			}else{
				return `${side}-${pane.viewType}`;
			}
		}
	}

    render() {
        if( !this.props.document.loaded ) { return null; }

        const docView = {
            linkedMode: this.state.linkedMode,
            bookMode: this.state.bookMode,
            inSearchMode: this.state.inSearchMode,
            left: {
                ...this.props.viewports['left'],
                ...this.determineNextPrev(this.props.viewports['left'].folioID)
            },
            right: {
                ...this.props.viewports['right'],
                ...this.determineNextPrev(this.props.viewports['right'].folioID)
            }
        };

        const leftPane = this.renderPane( 'left', docView );
        const rightPane = this.renderPane( 'right', docView );
        
        return (
            <div>
                <SplitPaneView 
                    leftPane={leftPane} 
                    rightPane={rightPane} 
                    documentView={this.state}
                    documentViewActions={this.documentViewActions}
                />
            </div>
        );
    }

}

function mapStateToProps(state) {
	return {
        document: state.document
	};
}

export default connect(mapStateToProps)(DocumentView);
