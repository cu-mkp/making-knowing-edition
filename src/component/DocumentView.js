import React, {Component} from 'react';
import {connect} from 'react-redux';

import SplitPaneView from './SplitPaneView';
import {dispatchAction} from '../model/ReduxStore';
// import DocumentHelper from '../model/DocumentHelper';

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
            width: 0
        }

        this.state = {
            linkedMode: true,
            bookMode: false,
            inSearchMode:false,
            left: {
                ...paneDefaults
            },
            right: {
                ...paneDefaults
            }
        }

        this.documentViewActions = {
            setXMLMode: this.setXMLMode.bind(this),
            setLinkedMode: this.setLinkedMode.bind(this),
            setBookMode: this.setBookMode.bind(this),
            setGridMode: this.setGridMode.bind(this),
            changeTranscriptionType: this.changeTranscriptionType.bind(this),
            changeCurrentFolio: this.changeCurrentFolio.bind(this),
            // enterSearchMode: this.enterSearchMode.bind(this),
            // exitSearchMode: this.exitSearchMode.bind(this),
            setWidths: this.setWidths.bind(this)
        }
    }

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', true );
    }

    setXMLMode( side, xmlMode ) {
        this.setState((state) => {
            let nextState = { ...state };
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
        // this.setState((state) => {
        //     // Missing index warning
        //     if(doc.folioIndex.length === 0){
        //         console.log("WARNING: SET_BOOK_MODE reducer - folio index not defined, cannot determine next/previous, leaving state alone");
        //     }
        
        //     // Exiting bookmode
        //     if(!status){
        //         return {
        //             ...state,
        //             bookMode: status
        //         };    
        //     // Entering bookmode
        //     }else{    
        //         let versoID=DocumentHelper.findNearestVerso(shortid, doc.folioNameByIDIndex, doc.folioIndex);
        //         let current_idx = doc.folioIndex.indexOf(versoID);
        //         let nextID = '';
        //         let prevID = '';
        //         let nextNextID='';
        //         let current_hasPrev = false;
        //         let current_hasNext = false;
        //         let current_hasNextNext = false;
        //         if (current_idx > -1) {
        //             current_hasNext = (current_idx < (doc.folioIndex.length - 1));
        //             nextID = current_hasNext ? doc.folioIndex[current_idx + 1] : '';
        //             current_hasNextNext = (current_idx < (doc.folioIndex.length - 2));
        //             nextNextID = current_hasNextNext ? doc.folioIndex[current_idx + 2] : '';
        //             current_hasPrev = (current_idx > 0 && doc.folioIndex.length > 1);
        //             prevID = current_hasPrev ? doc.folioIndex[current_idx - 1] : '';
        //         }
        //         return {
        //             ...state,
        //             bookMode: status,
        //             left:{
        //                 ...state.left,
        //                 iiifShortID: versoID,
        //                 hasPrevious: current_hasPrev,
        //                 hasNext: current_hasNextNext,
        //                 previousFolioShortID: prevID,
        //                 nextFolioShortID: nextNextID,
        //                 viewType:'ImageView'
        //             },
        //             right:{
        //                 ...state.right,
        //                 iiifShortID: nextID,
        //                 hasPrevious: current_hasPrev,
        //                 hasNext: current_hasNextNext,
        //                 previousFolioShortID: prevID,
        //                 nextFolioShortID: nextNextID,
        //                 viewType:'ImageView'
        //             }
        //         };
        //     }
        // });
    }

    setWidths( left, right ) {
        this.setState((state) => {
            let nextState = {...state};
            nextState['left'].width = left;
            nextState['right'].width = right;
            return nextState;
        });
    }

    setGridMode( side, newState ) {
        this.setState((state) => {
            let nextState = {...state};
            nextState[side].isGridMode = newState;
            return nextState;
        });
    }

    changeTranscriptionType( side, transcriptionType ) {
        if( side === 'left' ) {
            let folioID = this.props.viewports['left'].folioID;
            let otherSide = this.props.viewports['right'];
            this.navigateFolios(
                folioID,
                transcriptionType,
                otherSide.folioID,
                otherSide.transcriptionType
            );
        } else {
            let folioID = this.props.viewports['right'].folioID;
            let otherSide = this.props.viewports['left'];
            this.navigateFolios(
                otherSide.folioID,
                otherSide.transcriptionType,
                folioID,
                transcriptionType,
            );
        }
    }

    navigateFolios( folioID, transcriptionType, folioID2, transcriptionType2 ) {

        if( !folioID ) {
            // goto grid view
    		this.props.history.push('/folios');
            return;
        }
        if( !transcriptionType ) {
            // goto folioID, tc
    		this.props.history.push(`/folios/${folioID}`);
            return;
        }
        if( !folioID2 ) {
            // goto folioID, transcriptionType
    		this.props.history.push(`/folios/${folioID}/${transcriptionType}`);
            return;
        }
        if( !transcriptionType2 ) {
            // goto folioID, transcriptionType, folioID2, tc
    		this.props.history.push(`/folios/${folioID}/${transcriptionType}/${folioID2}/tc`);
            return;
        }
        // goto folioID, transcriptionType, folioID2, transcriptionType2        
        this.props.history.push(`/folios/${folioID}/${transcriptionType}/${folioID2}/${transcriptionType2}`);
    }

    changeCurrentFolio( doc, id, side, transcriptionType, direction ) {
        // Lookup prev/next
        let iiifShortID = id.substr(id.lastIndexOf('/') + 1);
        let folioID = this.props.document.folioNameByIDIndex[iiifShortID];

        if( this.state.bookMode ) {
            // TODO
        } else {
            if( this.state.linkedMode ) {
                this.navigateFolios( folioID, transcriptionType );
            } else {
                if( side === 'left' ) {
                    let otherSide = this.props.viewports['right'];
                    this.navigateFolios( 
                        folioID, 
                        transcriptionType, 
                        otherSide.folioID,  
                        otherSide.transcriptionType
                    );    
                } else {
                    let otherSide = this.props.viewports['left'];
                    this.navigateFolios( 
                        otherSide.folioID,  
                        otherSide.transcriptionType,
                        folioID, 
                        transcriptionType 
                    );    
                }
            }
        }
    }

    // enterSearchMode() {    
    //     this.setState( {
    //         ...this.state,
    //         linkedMode: false,
    //         bookMode: false,
    //         inSearchMode: true,
        
    //         left: {
    //             ...this.state.left,
    //             viewType: 'SearchResultView'
    //         },
        
    //         right:{
    //             ...this.state.right,
    //             isGridMode: false,
    //             viewType: 'TranscriptionView',
    //             transcriptionType: 'tc',
    //             iiifShortID: '',
    //             nextFolioShortID: '',
    //             previousFolioShortID: ''
    //         }
    //     });
    // }

    // exitSearchMode() {
    //     // If we have a folio selected in search results, match the left pane
    //     // otherwise just clear and gridview
    //     let leftState;
    //     if(parseInt(this.state.right.iiifShortID,10) === -1){
    //         leftState = {
    //             ...this.state.left,
    //             viewType: 'ImageGridView',
    //             iiifShortID: '',
    //             // hasPrevious: false,
    //             // hasNext: false,
    //             nextFolioShortID: '',
    //             previousFolioShortID: ''
    //         };
    //     }else{
    //         leftState = {
    //             ...this.state.right,
    //             viewType: 'ImageView'
    //         };
    //     }
    
    //     this.setState( {
    //         ...this.state,
    //         linkedMode: true,
    //         inSearchMode: false,
    //         left: leftState,
    //         right:{
    //             ...this.state.right,
    //         }
    //     } );
    // };

    determineViewType(side) {
        const transcriptionType = this.props.viewports[side].transcriptionType;
        const xmlMode = this.state[side].isXMLMode;

        if(transcriptionType === 'g' ) {
            return 'ImageGridView';
        }
        if( transcriptionType === 'f' ) {
            return 'ImageView';
        } 
        return xmlMode ? 'XMLView' : 'TranscriptionView';
    }

    // determineNextPrevBookMode(viewport,side) {
    //     const doc = this.props.document;
    //     const shortID = doc.folioIDByNameIndex[viewport.folioID];
    //     const direction = 'back';
                
    //     let versoID=DocumentHelper.findNearestVerso(shortID, doc.folioNameByIDIndex, doc.folioIndex, direction);
    //     let current_idx = doc.folioIndex.indexOf(versoID);
    //     let prevID = '';
    //     let nextNextID='';
    //     let current_hasPrev = false;
    //     let current_hasNextNext = false;
    //     if (current_idx > -1) {
    //         current_hasNextNext = (current_idx < (doc.folioIndex.length - 2));
    //         nextNextID = current_hasNextNext ? doc.folioIndex[current_idx + 2] : '';
    //         current_hasPrev = (current_idx > 0 && doc.folioIndex.length > 1);
    //         prevID = current_hasPrev ? doc.folioIndex[current_idx - 1] : '';
    //     }
    //     if( side === 'left' ) {
    //         return {
    //             iiifShortID: shortID,
    //             transcriptionType: viewport.transcriptionType,
    //             hasPrevious: current_hasPrev,
    //             hasNext: current_hasNextNext,
    //             previousFolioShortID: prevID,
    //             nextFolioShortID: nextNextID,
    //             width: 0
    //         }
    //     } else {
    //         return {
    //             iiifShortID: shortID,
    //             transcriptionType: viewport.transcriptionType,
    //             hasPrevious: current_hasPrev,
    //             hasNext: current_hasNextNext,
    //             previousFolioShortID: prevID,
    //             nextFolioShortID: nextNextID,
    //             width: 0
    //         }
    //     }
    // }

    viewportState(side) {
        const doc = this.props.document;
        const viewport = this.props.viewports[side];
        const shortID = doc.folioIDByNameIndex[viewport.folioID];

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
            ...this.state[side],
            iiifShortID: shortID,
            transcriptionType: viewport.transcriptionType,
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

        // combine component state with state from props
        const docView = {
            ...this.state,
            left: this.viewportState('left'),
            right: this.viewportState('right')
        };
        
        return (
            <div>
                <SplitPaneView 
                    leftPane={this.renderPane( 'left', docView )} 
                    rightPane={this.renderPane( 'right', docView )} 
                    documentView={docView}
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
