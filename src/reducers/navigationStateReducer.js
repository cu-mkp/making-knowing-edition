import initialState from './initialState';
import {
	CHANGE_TRANSCRIPTION_TYPE,
	CHANGE_CURRENT_FOLIO,
	UPDATE_FOLIO_INDEX,
	UPDATE_FOLIO_NAME_INDEX,
	SET_DRAWER_MODE,
	SET_LINKED_MODE
} from '../actions/allActions';

export default function navigationState(state = initialState, action) {
	switch (action.type) {

		case CHANGE_TRANSCRIPTION_TYPE:

			let label = 'Unknown';
			if (action.payload === 'tl') {
				label = 'English Translation';
			} else if (action.payload === 'tc') {
				label = 'French Original';
			} else if (action.payload === 'tcn') {
				label = 'French Standard';
			}

			return Object.assign({}, state, {
				transcriptionType: action.payload,
				transcriptionTypeLabel: label
			})

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

			//console.log(current_hasPrev +"-"+ prevID +"-("+ shortID +")-"+ nextID +"-"+ current_hasNext);

			return Object.assign({}, state, {
				currentFolioID: action.payload.id,
				currentFolioShortID: shortID,
				currentFolioName: state.folioNameIndex[shortID].padStart(4, "0"),

				hasPrevious: current_hasPrev,
				hasNext: current_hasNext,
				previousFolioShortID: prevID,
				nextFolioShortID: nextID

			})

		case UPDATE_FOLIO_INDEX:
			return Object.assign({}, state, {
				folioIndex: action.payload
			})

		case UPDATE_FOLIO_NAME_INDEX:
			return Object.assign({}, state, {
				folioNameIndex: action.payload
			})

		case SET_DRAWER_MODE:
			return Object.assign({}, state, {
				drawerMode: action.payload
			})

		case SET_LINKED_MODE:
			return Object.assign({}, state, {
				linkedMode: action.payload
			})

		default:
			return state;
	}
}
