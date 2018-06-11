import initialState from './initialState';
import {
	CHANGE_TRANSCRIPTION_TYPE,
	CHANGE_CURRENT_FOLIO,
	UPDATE_SEARCH_INDEX,
	UPDATE_FOLIO_INDEX,
	UPDATE_GLOSSARY,
	ENTER_SEARCH_MODE,
	EXIT_SEARCH_MODE,
	CACHE_SEARCH_RESULTS,
	SET_DRAWER_MODE,
	SET_XML_MODE,
	SET_LINKED_MODE,
	SET_BOOK_MODE,
	SET_PANE_SIZES,
	SET_PANE_VIEWTYPE,
	SET_COLUMN_MODE_FOR_SIDE,
	SET_STATE_FROM_HASH,
	HIDE_SEARCH_TYPE
} from '../actions/allActions';

export default function navigationState(state = initialState, action) {
	switch (action.type) {

		case SET_STATE_FROM_HASH:
			if(state.folioNameByIDIndex.length === 0){
				//console.log("WARNING: SET_STATE_FROM_HASH reducer - folioNameByIDIndex not defined, cannot change folio, leaving state alone");
				return state;
			}

			if(typeof action.payload.newState.left.folioShortID === 'undefined' || typeof action.payload.newState.right.folioShortID === 'undefined'){
				//console.log("WARNING: SET_STATE_FROM_HASH reducer - cannot work without specifying both left and right pane folio IDs, leaving state alone");
				return state;
			}

			// FIXME: this should be factored out into a helper method
			let current_idx = state.folioIndex.indexOf(action.payload.newState.left.folioShortID);
			let nextID = '';
			let prevID = '';
			let current_hasPrev = false;
			let current_hasNext = false;
			let left_current_hasNext,left_nextID,left_current_hasPrev,left_prevID;
			if (current_idx > -1) {
				 left_current_hasNext = (current_idx < (state.folioIndex.length - 1));
				 left_nextID = left_current_hasNext ? state.folioIndex[current_idx + 1] : '';
				 left_current_hasPrev = (current_idx > 0 && state.folioIndex.length > 1);
				 left_prevID = left_current_hasPrev ? state.folioIndex[current_idx - 1] : '';
			}

			 current_idx = state.folioIndex.indexOf(action.payload.newState.right.folioShortID);
			 nextID = '';
			 prevID = '';
			 current_hasPrev = false;
			 current_hasNext = false;
			 let right_current_hasNext,right_nextID,right_current_hasPrev,right_prevID;
			if (current_idx > -1) {
				 right_current_hasNext = (current_idx < (state.folioIndex.length - 1));
				 right_nextID = right_current_hasNext ? state.folioIndex[current_idx + 1] : '';
				 right_current_hasPrev = (current_idx > 0 && state.folioIndex.length > 1);
				 right_prevID = right_current_hasPrev ? state.folioIndex[current_idx - 1] : '';
			}
			return {
				...state,
				bookMode: action.payload.newState.bookMode,
				linkedMode: action.payload.newState.linkedMode,
				left:{
					...state.left,
					width: action.payload.newState.left.width,
					currentFolioID: action.payload.newState.left.folioID,
					currentFolioName: (typeof state.folioNameByIDIndex[action.payload.newState.left.folioShortID] !== 'undefined')?state.folioNameByIDIndex[action.payload.newState.left.folioShortID] :'',
					currentFolioShortID: action.payload.newState.left.folioShortID,
					viewType: action.payload.newState.left.viewType,
					transcriptionType: action.payload.newState.left.transcriptType,
			  	  	transcriptionTypeLabel: state.uiLabels.transcriptionType[action.payload.newState.left.transcriptType],
					isGridMode: action.payload.newState.left.isGridMode,

					hasPrevious: left_current_hasPrev,
					hasNext: left_current_hasNext,
					previousFolioShortID: left_prevID,
					nextFolioShortID: left_nextID
				},
				right:{
					...state.right,
					width: action.payload.newState.right.width,
					currentFolioID: action.payload.newState.right.folioID,
					currentFolioName: (typeof state.folioNameByIDIndex[action.payload.newState.right.folioShortID] !== 'undefined')?state.folioNameByIDIndex[action.payload.newState.right.folioShortID] :'',
					currentFolioShortID: action.payload.newState.right.folioShortID,
					viewType: action.payload.newState.right.viewType,
					transcriptionType: action.payload.newState.right.transcriptType,
			  	  	transcriptionTypeLabel: state.uiLabels.transcriptionType[action.payload.newState.right.transcriptType],
					isGridMode: action.payload.newState.right.isGridMode,

					hasPrevious: right_current_hasPrev,
					hasNext: right_current_hasNext,
					previousFolioShortID: right_prevID,
					nextFolioShortID: right_nextID
				}
			};

		case CHANGE_TRANSCRIPTION_TYPE:
			let xmlMode = state[action.payload.side].isXMLMode;
			let viewType = xmlMode ? 'XMLView' : 'TranscriptionView';

			let label = state.uiLabels.transcriptionType[action.payload.transcriptionType];

			if (action.payload.transcriptionType === 'f'){
				viewType = 'ImageView';
				xmlMode = false;
			}

			// action.payload.transcriptionType (tc,tcn, tl)
			let typeDisplayOrder = 'tc,tcn,tcl';
			if(action.payload.transcriptionType === 'tc'){
				typeDisplayOrder = 'tc,tcn,tcl';
			}else if(action.payload.transcriptionType === 'tcn'){
				typeDisplayOrder = 'tcn,tc,tcl';
			}else if(action.payload.transcriptionType === 'tcl'){
				typeDisplayOrder = 'tcl,tc,tcn';
			}


			if(action.payload.side === 'left'){
				return {
                	...state,
					left:{
						...state.left,
						transcriptionType: action.payload.transcriptionType,
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
						transcriptionType: action.payload.transcriptionType,
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

		case CHANGE_CURRENT_FOLIO:

			if(state.folioIndex.length === 0){
				console.log("WARNING: CHANGE_CURRENT_FOLIO reducer - folio index not defined, cannot change folio, leaving state alone");
				return state;
			}

			// Lookup prev/next
			let shortID = action.payload.id.substr(action.payload.id.lastIndexOf('/') + 1);

			// Book mode? (recto/verso)
			if(state.bookMode && !state.search.inSearchMode){
				let versoID=findNearestVerso(state, shortID, action.payload.direction);
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
					bookMode: action.payload,
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
			 current_idx = state.folioIndex.indexOf(shortID);
			 nextID = '';
			 prevID = '';
			 current_hasPrev = false;
			 current_hasNext = false;
			if (current_idx > -1) {
				current_hasNext = (current_idx < (state.folioIndex.length - 1));
				nextID = current_hasNext ? state.folioIndex[current_idx + 1] : '';

				current_hasPrev = (current_idx > 0 && state.folioIndex.length > 1);
				prevID = current_hasPrev ? state.folioIndex[current_idx - 1] : '';
			}
			if(state.linkedMode && !state.search.inSearchMode){


				return {
					...state,
					left:{
						...state.left,
						currentFolioID: action.payload.id,
						currentFolioShortID: shortID,
						currentFolioName: state.folioNameByIDIndex[shortID],
						hasPrevious: current_hasPrev,
						hasNext: current_hasNext,
						previousFolioShortID: prevID,
						nextFolioShortID: nextID
					},
					right:{
						...state.right,
						currentFolioID: action.payload.id,
						currentFolioShortID: shortID,
						currentFolioName: state.folioNameByIDIndex[shortID],
						hasPrevious: current_hasPrev,
						hasNext: current_hasNext,
						previousFolioShortID: prevID,
						nextFolioShortID: nextID
					}
				};
			}else{
				// Includes searchmode

				//console.log("Setting "+action.payload.side+" to: "+action.payload.id);
				//console.log("Search:"+state.search.inSearchMode+" Type:"+action.payload.transcriptionType);
				let searchMatched =  (typeof action.payload.matched === 'undefined')?state.search.matched:action.payload.matched;

				if(action.payload.side === 'left'){
					let type = (typeof action.payload.transcriptionType === 'undefined')?state[action.payload.side].transcriptionType:action.payload.transcriptionType;
					return {
	                	...state,
						search:{
							...state.search,
							matched:searchMatched
						},
						left:{
							...state.left,
							currentFolioID: action.payload.id,
							transcriptionType: type,
							transcriptionTypeLabel: state.uiLabels.transcriptionType[type],
							currentFolioShortID: shortID,
							currentFolioName: state.folioNameByIDIndex[shortID],
							hasPrevious: current_hasPrev,
							hasNext: current_hasNext,
							previousFolioShortID: prevID,
							nextFolioShortID: nextID
						}
	            	};

				}else{
					let type = (typeof action.payload.transcriptionType === 'undefined')?state[action.payload.side].transcriptionType:action.payload.transcriptionType;

					return {
	                	...state,
						search:{
							...state.search,
							matched:searchMatched
						},
						right:{
							...state.right,
							currentFolioID: action.payload.id,
							transcriptionType: type,
							transcriptionTypeLabel: state.uiLabels.transcriptionType[type],
							currentFolioShortID: shortID,
							currentFolioName: state.folioNameByIDIndex[shortID],
							hasPrevious: current_hasPrev,
							hasNext: current_hasNext,
							previousFolioShortID: prevID,
							nextFolioShortID: nextID
						}
	            	};
				}
			}

		case UPDATE_GLOSSARY:
			if(action.payload.transcriptionType === 'tc'){
				return {
					...state,
					glossary:{
						...state.glossary,
						tc: action.payload.glossaryData
					}
				}

			}else if(action.payload.transcriptionType === 'tl'){
				return {
					...state,
					glossary:{
						...state.glossary,
						tl: action.payload.glossaryData
					}
				}

			}else if(action.payload.transcriptionType === 'tcn'){
				return {
					...state,
					glossary:{
						...state.glossary,
						tcn: action.payload.glossaryData
					}
				}
			}else{
				return state;
			}

		case UPDATE_FOLIO_INDEX:
			return {
				...state,
				folioIndex: action.payload.folioIndex,
				folioNameByIDIndex: action.payload.folioNameByIDIndex,
				folioIDByNameIndex: action.payload.folioIDByNameIndex
			}

		case UPDATE_SEARCH_INDEX:
			return {
				...state,
				search:{
					...state.search,
					index:action.payload.searchIndex
				}
			}

		case ENTER_SEARCH_MODE:

			let results = {};
			results['tc'] = state.search.index.searchEdition(action.payload.searchTerm,'tc');
			results['tcn'] = state.search.index.searchEdition(action.payload.searchTerm,'tcn');
			results['tl'] = state.search.index.searchEdition(action.payload.searchTerm,'tl');

			return {
				...state,
				linkedMode: false,
				bookMode: false,
				search:{
					...state.search,
					term:action.payload.searchTerm,
					inSearchMode:true,
					results:results
				},

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

		case EXIT_SEARCH_MODE:
				return {
					...state,
					linkedMode: true,
					search:{
						...state.search,
						term:'',
						inSearchMode:false,
						results:''
					},

					left: {
						...state.left,
						viewType: 'ImageGridView',
						currentFolioName: '',
						currentFolioID: '',
						currentFolioShortID: '',
						hasPrevious: false,
						hasNext: false,
						nextFolioShortID: '',
						previousFolioShortID: ''
					},

					right:{
						...state.right,
					}
				}

		case HIDE_SEARCH_TYPE:
			if(action.payload.type === 'tc'){
				return {
					...state,
					search:{
						...state.search,
						typeHidden:{
							...state.search.typeHidden,
							tc:action.payload.value
						}
					}
				}
			}else if(action.payload.type === 'tcn'){
				return {
					...state,
					search:{
						...state.search,
						typeHidden:{
							...state.search.typeHidden,
							tcn:action.payload.value
						}
					}
				}
			}else if(action.payload.type === 'tl'){
				return {
					...state,
					search:{
						...state.search,
						typeHidden:{
							...state.search.typeHidden,
							tl:action.payload.value
						}
					}
				}
			}
			return state;


		case CACHE_SEARCH_RESULTS:
			return{
				...state,
				search:{
					...state.search,
					results:action.payload.results
				}
			}

		case SET_DRAWER_MODE:
			return Object.assign({}, state, {
				drawerMode: action.payload
			})

		case SET_LINKED_MODE:
			return Object.assign({}, state, {
				linkedMode: action.payload
			})

		case SET_XML_MODE:
			if(action.payload.side === 'left'){
				return {
					...state,
					left:{
						...state.left,
						viewType: action.payload.newState ? 'XMLView' : 'TranscriptionView',
						isXMLMode: action.payload.newState
					}
				};
			}else{
				return {
					...state,
					right:{
						...state.right,
						viewType: action.payload.newState ? 'XMLView' : 'TranscriptionView',
						isXMLMode: action.payload.newState
					}
				};
			}

		case SET_BOOK_MODE:

			// Missing index warning
			if(state.folioIndex.length === 0){
				console.log("WARNING: SET_BOOK_MODE reducer - folio index not defined, cannot determine next/previous, leaving state alone");
				return state;
			}

			// Exiting bookmode
			if(!action.payload.status){
				return {
					...state,
					bookMode: action.payload.status
				}

			// Entering bookmode
			}else{

				let versoID=findNearestVerso(state, action.payload.shortid);
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
					bookMode: action.payload.status,
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

		case SET_COLUMN_MODE_FOR_SIDE:
			if(action.payload.side === 'left'){
				return {
					...state,
					left:{
						...state.left,
						isGridMode: action.payload.newState
					}
				};
			}else{
				return {
					...state,
					right:{
						...state.right,
						isGridMode: action.payload.newState
					}
				};
			}

		case SET_PANE_SIZES:
			return {
				...state,
				left:{	...state.left,
						width: action.payload.left},
				right:{	...state.right,
						width: action.payload.right}
			};

		case SET_PANE_VIEWTYPE:
			let typelabel = (action.payload.viewType === 'ImageView')?"Facsimile":state[action.payload.side].transcriptionTypeLabel;
			if(action.payload.side === 'left'){
				return {
					...state,
					left:{
						...state.left,
						viewType: action.payload.viewType,
						transcriptionTypeLabel: typelabel
					}
				};
			}else{
				return {
					...state,
					right:{
						...state.right,
						viewType: action.payload.viewType,
						transcriptionTypeLabel: typelabel
					}
				};
			}

		default:
			return state;
	}
}

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
