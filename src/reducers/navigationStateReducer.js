import initialState from './initialState';
import {
	CHANGE_TRANSCRIPTION_TYPE,
	CHANGE_CURRENT_FOLIO,
	UPDATE_FOLIO_INDEX,
	UPDATE_FOLIO_NAME_INDEX,
	SET_DRAWER_MODE,
	SET_LINKED_MODE,
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
