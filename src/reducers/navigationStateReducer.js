import initialState from './initialState';
import {
	CHANGE_TRANSCRIPTION_TYPE,
	CHANGE_CURRENT_FOLIO,
	UPDATE_FOLIO_INDEX,
	UPDATE_FOLIO_NAME_INDEX,
	SET_DRAWER_MODE,
	SET_LINKED_MODE,
	SET_BOOK_MODE,
	SET_PANE_SIZES,
	SET_PANE_VIEWTYPE
} from '../actions/allActions';

export default function navigationState(state = initialState, action) {
	switch (action.type) {

		case CHANGE_TRANSCRIPTION_TYPE:
			let label = 'Unknown';
			let viewType = 'TranscriptionView';
			if (action.payload.transcriptionType === 'tl') {
				label = 'English Translation';
			} else if (action.payload.transcriptionType === 'tc') {
				label = 'French Original';
			} else if (action.payload.transcriptionType === 'tcn') {
				label = 'French Standard';
			}else if (action.payload.transcriptionType === 'facsimile'){
				label = 'Facsimile';
				viewType = 'ImageView';
			}

			if(action.payload.side === 'left'){
				return {
                	...state,
					left:{
						...state.left,
						transcriptionType: action.payload.transcriptionType,
						transcriptionTypeLabel: label,
						viewType:viewType
					}
            	};
			}else{
				return {
                	...state,
					right:{
						...state.left,
						transcriptionType: action.payload.transcriptionType,
						transcriptionTypeLabel: label,
						viewType:viewType
					}
            	};
			}

		case CHANGE_CURRENT_FOLIO:

			// Lookup prev/next
			let shortID = action.payload.id.substr(action.payload.id.lastIndexOf('/') + 1);

			// Book mode? (recto/verso)
			if(state.bookMode){
				let versoID=findNearestVerso(state, shortID);
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
						currentFolioID: 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/'+versoID,
						currentFolioShortID: versoID,
						currentFolioName: state.folioNameIndex[versoID].padStart(4, "0"),
						hasPrevious: current_hasPrev,
						hasNext: current_hasNextNext,
						previousFolioShortID: prevID,
						nextFolioShortID: nextNextID
					},
					right:{
						...state.right,
						currentFolioID: 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/'+nextID,
						currentFolioShortID: nextID,
						currentFolioName: state.folioNameIndex[nextID].padStart(4, "0"),
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
						currentFolioID: action.payload.id,
						currentFolioShortID: shortID,
						currentFolioName: state.folioNameIndex[shortID].padStart(4, "0"),
						hasPrevious: current_hasPrev,
						hasNext: current_hasNext,
						previousFolioShortID: prevID,
						nextFolioShortID: nextID
					},
					right:{
						...state.right,
						currentFolioID: action.payload.id,
						currentFolioShortID: shortID,
						currentFolioName: state.folioNameIndex[shortID].padStart(4, "0"),
						hasPrevious: current_hasPrev,
						hasNext: current_hasNext,
						previousFolioShortID: prevID,
						nextFolioShortID: nextID
					}
				};
			}else{
				if(action.payload.side === 'left'){
					return {
	                	...state,
						left:{
							...state.left,
							currentFolioID: action.payload.id,
							currentFolioShortID: shortID,
							currentFolioName: state.folioNameIndex[shortID].padStart(4, "0"),
							hasPrevious: current_hasPrev,
							hasNext: current_hasNext,
							previousFolioShortID: prevID,
							nextFolioShortID: nextID
						}
	            	};

				}else{
					return {
	                	...state,
						right:{
							...state.right,
							currentFolioID: action.payload.id,
							currentFolioShortID: shortID,
							currentFolioName: state.folioNameIndex[shortID].padStart(4, "0"),
							hasPrevious: current_hasPrev,
							hasNext: current_hasNext,
							previousFolioShortID: prevID,
							nextFolioShortID: nextID
						}
	            	};
				}
			}


		case UPDATE_FOLIO_INDEX:
			return Object.assign({}, state, {
				folioIndex: action.payload.folioIndex
			})


		case UPDATE_FOLIO_NAME_INDEX:
			return Object.assign({}, state, {
				folioNameIndex: action.payload.folioNameIndex
			})


		case SET_DRAWER_MODE:
			return Object.assign({}, state, {
				drawerMode: action.payload
			})

		case SET_LINKED_MODE:
			return Object.assign({}, state, {
				linkedMode: action.payload
			})

		case SET_BOOK_MODE:

			// Exiting bookmode
			if(!action.payload){
				return {
					...state,
					bookMode: action.payload
				}

			// Entering bookmode
			}else{
				let versoID=findNearestVerso(state, state.left.currentFolioShortID);
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
						currentFolioID: 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/'+versoID,
						currentFolioShortID: versoID,
						currentFolioName: state.folioNameIndex[versoID].padStart(4, "0"),
						hasPrevious: current_hasPrev,
						hasNext: current_hasNextNext,
						previousFolioShortID: prevID,
						nextFolioShortID: nextNextID
					},
					right:{
						...state.right,
						currentFolioID: 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/'+nextID,
						currentFolioShortID: nextID,
						currentFolioName: state.folioNameIndex[nextID].padStart(4, "0"),
						hasPrevious: current_hasPrev,
						hasNext: current_hasNextNext,
						previousFolioShortID: prevID,
						nextFolioShortID: nextNextID
					}
				};
			}

		case SET_PANE_SIZES:
			return {
				...state,
				left:{...state.left,width: action.payload.left},
				right:{...state.right,width: action.payload.right}
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

function findNearestVerso(state, id){
	let found=false;
	let versoID=id;
	let lookLeft=true;

	while(!found){
		// Look to see if this name is "verso" or ends in "v"
		let candidateName = state.folioNameIndex[versoID];
		if(candidateName.endsWith("v") || candidateName.endsWith("verso")){
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
