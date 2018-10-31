
var DocumentViewActions = {};

// SET_XML_MODE 
DocumentViewActions.setXMLMode = function setXMLMode( state, side, newState ) {
	if(side === 'left'){
		return {
			...state,
			left:{
				...state.left,
				viewType: newState ? 'XMLView' : 'TranscriptionView',
				isXMLMode: newState
			}
		};
	} else {
		return {
			...state,
			right:{
				...state.right,
				viewType: newState ? 'XMLView' : 'TranscriptionView',
				isXMLMode: newState
			}
		};
	}
};

// SET_DRAWER_MODE
DocumentViewActions.setDrawerMode = function setDrawerMode( state, drawerMode ) {
	return Object.assign({}, state, {
		drawerMode: drawerMode
	});
};

// SET_LINKED_MODE
DocumentViewActions.setLinkedMode = function setLinkedMode( state, linkedMode ) {
	return Object.assign({}, state, {
		linkedMode: linkedMode
	})
};

// SET_BOOK_MODE
DocumentViewActions.setBookMode = function setBookMode( state, doc, shortid, status ) {
	// Missing index warning
	if(doc.folioIndex.length === 0){
		console.log("WARNING: SET_BOOK_MODE reducer - folio index not defined, cannot determine next/previous, leaving state alone");
		return state;
	}

	// Exiting bookmode
	if(!status){
		return {
			...state,
			bookMode: status
		}

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
};

// SET_PANE_SIZES
DocumentViewActions.setwidths = function setwidths( state, left, right ) {
	return {
		...state,
		left:{	...state.left,
				width: left},
		right:{	...state.right,
				width: right}
	};
};

// SET_PANE_VIEWTYPE
DocumentViewActions.setPaneViewtype = function setPaneViewtype( state, side, viewType ) {
	if(side === 'left'){
		return {
			...state,
			left:{
				...state.left,
				viewType: viewType
			}
		};
	}else{
		return {
			...state,
			right:{
				...state.right,
				viewType: viewType
			}
		};
	}
};

// SET_COLUMN_MODE_FOR_SIDE
DocumentViewActions.setGridMode = function setGridMode( state, side, newState ) {
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
};

// CHANGE_TRANSCRIPTION_TYPE
DocumentViewActions.changeTranscriptionType = function changeTranscriptionType( state, side, transcriptionType ) {
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
};
		
// CHANGE_CURRENT_FOLIO
DocumentViewActions.changeCurrentFolio = function changeCurrentFolio( state, doc, shortID, side, transcriptionType, direction ) {
	if(doc.folioIndex.length === 0){
		console.log("WARNING: DocumentViewActions.changeCurrentFolio - folio index not defined, cannot change folio, leaving state alone");
		return state;
	}

	// Book mode? (recto/verso)
	if(state.bookMode ){
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
};

DocumentViewActions.gotoSearchResult = function gotoSearchResult( state, doc, id, side, transcriptionType ) {

	let shortID = id.substr(id.lastIndexOf('/') + 1);
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
};

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

// case ENTER_SEARCH_MODE:
DocumentViewActions.enterSearchMode = function enterSearchMode( state ) {    
    return {
        ...state,
        linkedMode: false,
		bookMode: false,
		inSearchMode: true,
    
        left: {
            ...state.left,
            viewType: 'SearchResultView'
        },
    
        right:{
            ...state.right,
            isGridMode: false,
            viewType: 'TranscriptionView',
            transcriptionType: 'tc',
            iiifShortID: '',
            nextFolioShortID: '',
            previousFolioShortID: ''
        }
    }
};

// case EXIT_SEARCH_MODE:
DocumentViewActions.exitSearchMode = function exitSearchMode( state ) {
    // If we have a folio selected in search results, match the left pane
    // otherwise just clear and gridview
    let leftState;
    if(parseInt(state.right.iiifShortID,10) === -1){
        leftState = {
            ...state.left,
            viewType: 'ImageGridView',
            iiifShortID: '',
            // hasPrevious: false,
            // hasNext: false,
            nextFolioShortID: '',
            previousFolioShortID: ''
        };
    }else{
        leftState = {
            ...state.right,
            viewType: 'ImageView'
        };
    }

    return {
        ...state,
        linkedMode: true,
		inSearchMode: false,
        left: leftState,
        right:{
            ...state.right,
        }
    }
};

export default DocumentViewActions;
