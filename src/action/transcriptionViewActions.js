var TranscriptionViewActions = {};

// SET_XML_MODE 
TranscriptionViewActions.setXMLMode = function( state, side, newState ) {
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

// SET_COLUMN_MODE_FOR_SIDE
TranscriptionViewActions.setColumnModeForSide = function( state, side, newState ) {
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
TranscriptionViewActions.updateFolioIndex = function( state, folioIndex, folioNameByIDIndex, folioIDByNameIndex ) {
	return {
		...state,
		folioIndex,
		folioNameByIDIndex,
		folioIDByNameIndex
	}
};

// CHANGE_TRANSCRIPTION_TYPE
TranscriptionViewActions.changeTranscriptionType = function( state, side, transcriptionType ) {
	let xmlMode = state[side].isXMLMode;
	let viewType = xmlMode ? 'XMLView' : 'TranscriptionView';

	let label = state.uiLabels.transcriptionType[transcriptionType];

	if (transcriptionType === 'f'){
		viewType = 'ImageView';
		xmlMode = false;
	}

	// transcriptionType (tc,tcn, tl)
	let typeDisplayOrder = 'tc,tcn,tcl';
	if(transcriptionType === 'tc'){
		typeDisplayOrder = 'tc,tcn,tcl';
	}else if(transcriptionType === 'tcn'){
		typeDisplayOrder = 'tcn,tc,tcl';
	}else if(transcriptionType === 'tcl'){
		typeDisplayOrder = 'tcl,tc,tcn';
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
			},
			search:{
				...state.search,
				typeDisplayOrder: typeDisplayOrder
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
			},
			search:{
				...state.search,
				typeDisplayOrder: typeDisplayOrder
			}
		};
	}
};
		
// CHANGE_CURRENT_FOLIO
// TranscriptionViewActions.changeCurrentFolio = function( state, id, direction, side, matched, transcriptionType ) {
// 	if(state.folioIndex.length === 0){
// 		console.log("WARNING: CHANGE_CURRENT_FOLIO reducer - folio index not defined, cannot change folio, leaving state alone");
// 		return state;
// 	}

// 	// Lookup prev/next
// 	let shortID = id.substr(id.lastIndexOf('/') + 1);

// 	// Book mode? (recto/verso)
// 	if(state.bookMode && !state.search.inSearchMode){
// 		let versoID=findNearestVerso(state, shortID, direction);
// 		let current_idx = state.folioIndex.indexOf(versoID);
// 		let nextID = '';
// 		let prevID = '';
// 		let nextNextID='';
// 		let current_hasPrev = false;
// 		let current_hasNext = false;
// 		let current_hasNextNext = false;
// 		if (current_idx > -1) {
// 			current_hasNext = (current_idx < (state.folioIndex.length - 1));
// 			nextID = current_hasNext ? state.folioIndex[current_idx + 1] : '';
// 			current_hasNextNext = (current_idx < (state.folioIndex.length - 2));
// 			nextNextID = current_hasNextNext ? state.folioIndex[current_idx + 2] : '';
// 			current_hasPrev = (current_idx > 0 && state.folioIndex.length > 1);
// 			prevID = current_hasPrev ? state.folioIndex[current_idx - 1] : '';
// 		}
// 		return {
// 			...state,
// 			left:{
// 				...state.left,
// 				currentFolioID: state.folioIDPrefix+versoID,
// 				currentFolioShortID: versoID,
// 				currentFolioName: state.folioNameByIDIndex[versoID],
// 				hasPrevious: current_hasPrev,
// 				hasNext: current_hasNextNext,
// 				previousFolioShortID: prevID,
// 				nextFolioShortID: nextNextID
// 			},
// 			right:{
// 				...state.right,
// 				currentFolioID: state.folioIDPrefix+nextID,
// 				currentFolioShortID: nextID,
// 				currentFolioName: state.folioNameByIDIndex[nextID],
// 				hasPrevious: current_hasPrev,
// 				hasNext: current_hasNextNext,
// 				previousFolioShortID: prevID,
// 				nextFolioShortID: nextNextID
// 			}
// 		};
// 	}

// 	// Not book mode
// 		current_idx = state.folioIndex.indexOf(shortID);
// 		nextID = '';
// 		prevID = '';
// 		current_hasPrev = false;
// 		current_hasNext = false;
// 	if (current_idx > -1) {
// 		current_hasNext = (current_idx < (state.folioIndex.length - 1));
// 		nextID = current_hasNext ? state.folioIndex[current_idx + 1] : '';

// 		current_hasPrev = (current_idx > 0 && state.folioIndex.length > 1);
// 		prevID = current_hasPrev ? state.folioIndex[current_idx - 1] : '';
// 	}
// 	if(state.linkedMode && !state.search.inSearchMode){
// 		return {
// 			...state,
// 			left:{
// 				...state.left,
// 				currentFolioID: id,
// 				currentFolioShortID: shortID,
// 				currentFolioName: state.folioNameByIDIndex[shortID],
// 				hasPrevious: current_hasPrev,
// 				hasNext: current_hasNext,
// 				previousFolioShortID: prevID,
// 				nextFolioShortID: nextID
// 			},
// 			right:{
// 				...state.right,
// 				currentFolioID: id,
// 				currentFolioShortID: shortID,
// 				currentFolioName: state.folioNameByIDIndex[shortID],
// 				hasPrevious: current_hasPrev,
// 				hasNext: current_hasNext,
// 				previousFolioShortID: prevID,
// 				nextFolioShortID: nextID
// 			}
// 		};
// 	}else{
// 		// Includes searchmode

// 		let searchMatched =  (typeof matched === 'undefined')?state.search.matched:matched;

// 		if(side === 'left'){
// 			let type = (typeof transcriptionType === 'undefined')?state[side].transcriptionType:transcriptionType;
// 			return {
// 				...state,
// 				search:{
// 					...state.search,
// 					matched:searchMatched
// 				},
// 				left:{
// 					...state.left,
// 					currentFolioID: id,
// 					transcriptionType: type,
// 					transcriptionTypeLabel: state.uiLabels.transcriptionType[type],
// 					currentFolioShortID: shortID,
// 					currentFolioName: state.folioNameByIDIndex[shortID],
// 					hasPrevious: current_hasPrev,
// 					hasNext: current_hasNext,
// 					previousFolioShortID: prevID,
// 					nextFolioShortID: nextID
// 				}
// 			};

// 		}else{
// 			let type = (typeof transcriptionType === 'undefined')?state[side].transcriptionType:transcriptionType;

// 			return {
// 				...state,
// 				search:{
// 					...state.search,
// 					matched:searchMatched
// 				},
// 				right:{
// 					...state.right,
// 					currentFolioID: id,
// 					transcriptionType: type,
// 					transcriptionTypeLabel: state.uiLabels.transcriptionType[type],
// 					currentFolioShortID: shortID,
// 					currentFolioName: state.folioNameByIDIndex[shortID],
// 					hasPrevious: current_hasPrev,
// 					hasNext: current_hasNext,
// 					previousFolioShortID: prevID,
// 					nextFolioShortID: nextID
// 				}
// 			};
// 		}
// 	}
// };


// function findNearestVerso(state, id, direction){
// 	let found=false;
// 	let versoID=id;
// 	let lookLeft=(typeof direction === undefined || direction === 'back');

// 	while(!found){
// 		// Look to see if this name ends in "v"
// 		let candidateName = state.folioNameByIDIndex[versoID];
// 		if(candidateName.endsWith("v")){
// 			found=true;

// 		// No, so keep looking
// 		}else{
// 			if(lookLeft && state.folioIndex.indexOf(versoID) > 0){
// 				versoID=state.folioIndex[state.folioIndex.indexOf(versoID) - 1];
// 			}else{
// 				lookLeft=false;
// 				if(state.folioIndex.indexOf(versoID) < state.folioIndex.length){
// 					versoID=state.folioIndex[state.folioIndex.indexOf(versoID) + 1];
// 				}else{
// 					console.log("ERROR: Couldn't find a single verso page!");
// 					return null;
// 				}
// 			}
// 		}
// 	}
// 	return versoID;
// }

export default TranscriptionViewActions;