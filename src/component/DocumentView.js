import React, {Component} from 'react';
import {connect} from 'react-redux';

import SplitPaneView from './SplitPaneView';
import {dispatchAction} from '../model/ReduxStore';

import ImageView from './ImageView';
import ImageGridView from './ImageGridView';
import TranscriptionView from './TranscriptionView';
import XMLView from './XMLView';

class DocumentView extends Component {

    constructor(props) {
        super(props)

        const paneDefaults = {
            isXMLMode: false,
            isGridMode: false,
            transcriptionType: 'tc',
            currentFolioShortID: '',
            hasPrevious: false,
            hasNext: false,
            nextFolioShortID: '',
            previousFolioShortID: '',
            width: 0,
            drawerOpen: false
        }

        this.state = {
            drawerMode: false,
            linkedMode: true,
            bookMode: false,
            inSearchMode:false,
            folioIndex: [],
            folioNameByIDIndex:{},
            folioIDByNameIndex:{},
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
            setDrawerMode: this.setDrawerMode.bind(this),
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

    setDrawerMode( drawerMode ) {
        this.setState((state) => {
            return Object.assign({}, state, {
                drawerMode: drawerMode
            });
        });
    }
    
    setLinkedMode( linkedMode ) {
        this.setState((state) => {
            return Object.assign({}, state, {
                linkedMode: linkedMode
            })
        });
    }
    
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
                let versoID=findNearestVerso(shortid, doc.folioNameByIDIndex, doc.folioIndex);
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
                        currentFolioShortID: versoID,
                        hasPrevious: current_hasPrev,
                        hasNext: current_hasNextNext,
                        previousFolioShortID: prevID,
                        nextFolioShortID: nextNextID,
                        viewType:'ImageView'
                    },
                    right:{
                        ...state.right,
                        currentFolioShortID: nextID,
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
                let versoID=findNearestVerso(shortID, doc.folioNameByIDIndex, doc.folioIndex, direction);
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
                        currentFolioShortID: versoID,
                        hasPrevious: current_hasPrev,
                        hasNext: current_hasNextNext,
                        previousFolioShortID: prevID,
                        nextFolioShortID: nextNextID
                    },
                    right:{
                        ...state.right,
                        currentFolioShortID: nextID,
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
                        currentFolioShortID: shortID,
                        hasPrevious: current_hasPrev,
                        hasNext: current_hasNext,
                        previousFolioShortID: prevID,
                        nextFolioShortID: nextID
                    },
                    right:{
                        ...state.right,
                        currentFolioShortID: shortID,
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
                            currentFolioShortID: shortID,
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
                            currentFolioShortID: shortID,
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
                currentFolioShortID: '',
                nextFolioShortID: '',
                previousFolioShortID: ''
            }
        });
    }

    exitSearchMode() {
        // If we have a folio selected in search results, match the left pane
        // otherwise just clear and gridview
        let leftState;
        if(parseInt(this.state.right.currentFolioShortID,10) === -1){
            leftState = {
                ...this.state.left,
                viewType: 'ImageGridView',
                currentFolioShortID: '',
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

    // TODO pull viewport construction and document view actions to here, along with 
    // parsing of the folios path - search gets a different component

    renderPane(side) {
        const pane = this.state[side];
        const key = this.viewPaneKey(side);

        if( pane.viewType === 'ImageView') {
            return (
                <ImageView
                    key={key}
                    documentView={this.state}
                    documentViewActions={this.documentViewActions}
                    history={this.props.history}
                    side={side}
                    drawerMode={this.state.drawerMode}
                    drawerOpen={pane.drawerOpen}
                />
            );
        } else if( pane.viewType === 'TranscriptionView' ) {
            return(
                <TranscriptionView
                    key={key}
                    documentView={this.state}
                    documentViewActions={this.documentViewActions}
                    history={this.props.history}
                    side={side}
                    drawerMode={this.state.drawerMode}
                    drawerOpen={pane.drawerOpen}
                />
            );
        } else if( pane.viewType === 'XMLView' ) {
            return(
                <XMLView
                    key={key}
                    documentView={this.state}
                    documentViewActions={this.documentViewActions}
                    history={this.props.history}
                    side={side}
                    drawerMode={this.state.drawerMode}
                    drawerOpen={pane.drawerOpen}
                />
            );
        } else if( pane.viewType === 'ImageGridView' ) {
            return (
                <ImageGridView
                    key = {key}
                    documentView={this.state}
                    documentViewActions={this.documentViewActions}
                    history={this.props.history}
                    side={side}
                    drawerMode={this.state.drawerMode}
                    drawerOpen={pane.drawerOpen}
                />
            );
        } else {
            return (
                <div>ERROR: Undefined split pane type.</div>
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

        const leftPane = this.renderPane( 'left' );
        const rightPane = this.renderPane( 'right' );
        
        return (
            <div>
                <SplitPaneView 
                    inSearchMode={this.state.inSearchMode}
                    leftPane={leftPane} 
                    rightPane={rightPane} 
                    documentView={this.state}
                    documentViewActions={this.documentViewActions}
                    history={this.props.history} 
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

function findNearestVerso(id, folioNameByIDIndex, folioIndex, direction){
	let found=false;
	let versoID=id;
	let lookLeft=(typeof direction === undefined || direction === 'back');

	while(!found){
		// Look to see if this name ends in "v"
		let candidateName = folioNameByIDIndex[versoID];
		if(candidateName.endsWith("v")){
			found=true;

		// No, so keep looking
		}else{
			if(lookLeft && folioIndex.indexOf(versoID) > 0){
				versoID=folioIndex[folioIndex.indexOf(versoID) - 1];
			}else{
				lookLeft=false;
				if(folioIndex.indexOf(versoID) < folioIndex.length){
					versoID=folioIndex[folioIndex.indexOf(versoID) + 1];
				}else{
					console.log("ERROR: Couldn't find a single verso page!");
					return null;
				}
			}
		}
	}
	return versoID;
}


export default connect(mapStateToProps)(DocumentView);
