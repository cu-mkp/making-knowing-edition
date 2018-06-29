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

// case SET_STATE_FROM_HASH:
DocumentViewActions.setStateFromHash = function setStateFromHash( state, newState ) {

	if(state.folioNameByIDIndex.length === 0){
		//console.log("WARNING: SET_STATE_FROM_HASH reducer - folioNameByIDIndex not defined, cannot change folio, leaving state alone");
		return state;
	}

	if(typeof newState.left.folioShortID === 'undefined' || typeof newState.right.folioShortID === 'undefined'){
		//console.log("WARNING: SET_STATE_FROM_HASH reducer - cannot work without specifying both left and right pane folio IDs, leaving state alone");
		return state;
	}

	// FIXME: this should be factored out into a helper method
	let current_idx = state.folioIndex.indexOf(newState.left.folioShortID);
	let left_current_hasNext,left_nextID,left_current_hasPrev,left_prevID;
	if (current_idx > -1) {
		 left_current_hasNext = (current_idx < (state.folioIndex.length - 1));
		 left_nextID = left_current_hasNext ? state.folioIndex[current_idx + 1] : '';
		 left_current_hasPrev = (current_idx > 0 && state.folioIndex.length > 1);
		 left_prevID = left_current_hasPrev ? state.folioIndex[current_idx - 1] : '';
	}

	 current_idx = state.folioIndex.indexOf(newState.right.folioShortID);

	 let right_current_hasNext,right_nextID,right_current_hasPrev,right_prevID;
	if (current_idx > -1) {
		 right_current_hasNext = (current_idx < (state.folioIndex.length - 1));
		 right_nextID = right_current_hasNext ? state.folioIndex[current_idx + 1] : '';
		 right_current_hasPrev = (current_idx > 0 && state.folioIndex.length > 1);
		 right_prevID = right_current_hasPrev ? state.folioIndex[current_idx - 1] : '';
	}
	return {
		...state,
		bookMode: newState.bookMode,
		linkedMode: newState.linkedMode,
		left:{
			...state.left,
			width: newState.left.width,
			currentFolioID: newState.left.folioID,
			currentFolioName: (typeof state.folioNameByIDIndex[newState.left.folioShortID] !== 'undefined')?state.folioNameByIDIndex[newState.left.folioShortID] :'',
			currentFolioShortID: newState.left.folioShortID,
			viewType: newState.left.viewType,
			transcriptionType: newState.left.transcriptType,
				transcriptionTypeLabel: state.uiLabels.transcriptionType[newState.left.transcriptType],
			isGridMode: newState.left.isGridMode,

			hasPrevious: left_current_hasPrev,
			hasNext: left_current_hasNext,
			previousFolioShortID: left_prevID,
			nextFolioShortID: left_nextID
		},
		right:{
			...state.right,
			width: newState.right.width,
			currentFolioID: newState.right.folioID,
			currentFolioName: (typeof state.folioNameByIDIndex[newState.right.folioShortID] !== 'undefined')?state.folioNameByIDIndex[newState.right.folioShortID] :'',
			currentFolioShortID: newState.right.folioShortID,
			viewType: newState.right.viewType,
			transcriptionType: newState.right.transcriptType,
				transcriptionTypeLabel: state.uiLabels.transcriptionType[newState.right.transcriptType],
			isGridMode: newState.right.isGridMode,

			hasPrevious: right_current_hasPrev,
			hasNext: right_current_hasNext,
			previousFolioShortID: right_prevID,
			nextFolioShortID: right_nextID
		}
	};
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
DocumentViewActions.setBookMode = function setBookMode( state, shortid, status ) {
	// Missing index warning
	if(state.folioIndex.length === 0){
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

		let versoID=findNearestVerso(state, shortid);
		let current_idx = state.folioIndex.indexOf(versoID);
		let nextID = '';
		let prevID = '';
		let nextNextID='';
		let current_hasPrev = false;
		let current_hasNext = false;
		let current_hasNextNext = false;
		if (current_idx > -1) {
			current_hasNext = (current_idx < (state.folioIndex.length - 1));
			nextID = current_hasNext ? state.folioIndex[current_idx + 1] : '';
			current_hasNextNext = (current_idx < (state.folioIndex.length - 2));
			nextNextID = current_hasNextNext ? state.folioIndex[current_idx + 2] : '';
			current_hasPrev = (current_idx > 0 && state.folioIndex.length > 1);
			prevID = current_hasPrev ? state.folioIndex[current_idx - 1] : '';
		}
		return {
			...state,
			bookMode: status,
			left:{
				...state.left,
				currentFolioID: state.folioIDPrefix+versoID,
				currentFolioShortID: versoID,
				currentFolioName: state.folioNameByIDIndex[versoID],
				hasPrevious: current_hasPrev,
				hasNext: current_hasNextNext,
				previousFolioShortID: prevID,
				nextFolioShortID: nextNextID,
				transcriptionTypeLabel: 'Facsimile',
				viewType:'ImageView'
			},
			right:{
				...state.right,
				currentFolioID: state.folioIDPrefix+nextID,
				currentFolioShortID: nextID,
				currentFolioName: state.folioNameByIDIndex[nextID],
				hasPrevious: current_hasPrev,
				hasNext: current_hasNextNext,
				previousFolioShortID: prevID,
				nextFolioShortID: nextNextID,
				transcriptionTypeLabel: 'Facsimile',
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
	let typelabel = (viewType === 'ImageView')?"Facsimile":state[side].transcriptionTypeLabel;
	if(side === 'left'){
		return {
			...state,
			left:{
				...state.left,
				viewType: viewType,
				transcriptionTypeLabel: typelabel
			}
		};
	}else{
		return {
			...state,
			right:{
				...state.right,
				viewType: viewType,
				transcriptionTypeLabel: typelabel
			}
		};
	}
};

// SET_COLUMN_MODE_FOR_SIDE
DocumentViewActions.setColumnModeForSide = function setColumnModeForSide( state, side, newState ) {
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

// UPDATE_FOLIO_INDEX
DocumentViewActions.updateFolioIndex = function updateFolioIndex( state, folioIndex, folioNameByIDIndex, folioIDByNameIndex ) {
	return {
		...state,
		folioIndex,
		folioNameByIDIndex,
		folioIDByNameIndex
	}
};

// CHANGE_TRANSCRIPTION_TYPE
DocumentViewActions.changeTranscriptionType = function changeTranscriptionType( state, side, transcriptionType ) {
	let xmlMode = state[side].isXMLMode;
	let viewType = xmlMode ? 'XMLView' : 'TranscriptionView';

	let label = state.uiLabels.transcriptionType[transcriptionType];

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
				transcriptionTypeLabel: label,
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
				transcriptionTypeLabel: label,
				viewType:viewType,
				isXMLMode: xmlMode
			}
		};
	}
};
		
// CHANGE_CURRENT_FOLIO
DocumentViewActions.changeCurrentFolio = function changeCurrentFolio( state, id, side, transcriptionType, direction ) {
	if(state.folioIndex.length === 0){
		console.log("WARNING: DocumentViewActions.changeCurrentFolio - folio index not defined, cannot change folio, leaving state alone");
		return state;
	}

	// Lookup prev/next
	let shortID = id.substr(id.lastIndexOf('/') + 1);

	// Book mode? (recto/verso)
	if(state.bookMode ){
		let versoID=findNearestVerso(state, shortID, direction);
		let current_idx = state.folioIndex.indexOf(versoID);
		let nextID = '';
		let prevID = '';
		let nextNextID='';
		let current_hasPrev = false;
		let current_hasNext = false;
		let current_hasNextNext = false;
		if (current_idx > -1) {
			current_hasNext = (current_idx < (state.folioIndex.length - 1));
			nextID = current_hasNext ? state.folioIndex[current_idx + 1] : '';
			current_hasNextNext = (current_idx < (state.folioIndex.length - 2));
			nextNextID = current_hasNextNext ? state.folioIndex[current_idx + 2] : '';
			current_hasPrev = (current_idx > 0 && state.folioIndex.length > 1);
			prevID = current_hasPrev ? state.folioIndex[current_idx - 1] : '';
		}
		return {
			...state,
			left:{
				...state.left,
				currentFolioID: state.folioIDPrefix+versoID,
				currentFolioShortID: versoID,
				currentFolioName: state.folioNameByIDIndex[versoID],
				hasPrevious: current_hasPrev,
				hasNext: current_hasNextNext,
				previousFolioShortID: prevID,
				nextFolioShortID: nextNextID
			},
			right:{
				...state.right,
				currentFolioID: state.folioIDPrefix+nextID,
				currentFolioShortID: nextID,
				currentFolioName: state.folioNameByIDIndex[nextID],
				hasPrevious: current_hasPrev,
				hasNext: current_hasNextNext,
				previousFolioShortID: prevID,
				nextFolioShortID: nextNextID
			}
		};
	}

	// Not book mode
	let current_idx = state.folioIndex.indexOf(shortID);
	let nextID = '';
	let prevID = '';
	let current_hasPrev = false;
	let current_hasNext = false;
	if (current_idx > -1) {
		current_hasNext = (current_idx < (state.folioIndex.length - 1));
		nextID = current_hasNext ? state.folioIndex[current_idx + 1] : '';

		current_hasPrev = (current_idx > 0 && state.folioIndex.length > 1);
		prevID = current_hasPrev ? state.folioIndex[current_idx - 1] : '';
	}
	if(state.linkedMode){
		return {
			...state,
			left:{
				...state.left,
				currentFolioID: id,
				currentFolioShortID: shortID,
				currentFolioName: state.folioNameByIDIndex[shortID],
				hasPrevious: current_hasPrev,
				hasNext: current_hasNext,
				previousFolioShortID: prevID,
				nextFolioShortID: nextID
			},
			right:{
				...state.right,
				currentFolioID: id,
				currentFolioShortID: shortID,
				currentFolioName: state.folioNameByIDIndex[shortID],
				hasPrevious: current_hasPrev,
				hasNext: current_hasNext,
				previousFolioShortID: prevID,
				nextFolioShortID: nextID
			}
		};
	}

	console.log("WARNING: DocumentViewActions.changeCurrentFolio called to no effect.");
	return state;
};


function findNearestVerso(state, id, direction){
	let found=false;
	let versoID=id;
	let lookLeft=(typeof direction === undefined || direction === 'back');

	while(!found){
		// Look to see if this name ends in "v"
		let candidateName = state.folioNameByIDIndex[versoID];
		if(candidateName.endsWith("v")){
			found=true;

		// No, so keep looking
		}else{
			if(lookLeft && state.folioIndex.indexOf(versoID) > 0){
				versoID=state.folioIndex[state.folioIndex.indexOf(versoID) - 1];
			}else{
				lookLeft=false;
				if(state.folioIndex.indexOf(versoID) < state.folioIndex.length){
					versoID=state.folioIndex[state.folioIndex.indexOf(versoID) + 1];
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
    
        left: {
            ...state.left,
            viewType: 'SearchResultView'
        },
    
        right:{
            ...state.right,
            isGridMode: false,
            viewType: 'TranscriptionView',
            transcriptionType: 'tc',
            transcriptionTypeLabel: 'Transcription',
            currentFolioName: '',
            currentFolioID: '-1',
            currentFolioShortID: '',
            hasPrevious: false,
            hasNext: false,
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
    if(parseInt(state.right.currentFolioID,10) === -1){
        leftState = {
            ...state.left,
            viewType: 'ImageGridView',
            currentFolioName: '',
            currentFolioID: '',
            currentFolioShortID: '',
            hasPrevious: false,
            hasNext: false,
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
        left: leftState,
        right:{
            ...state.right,
        }
    }
};

export default DocumentViewActions;