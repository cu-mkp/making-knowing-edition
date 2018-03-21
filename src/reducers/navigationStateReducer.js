import initialState from './initialState';
import {
	CHANGE_TRANSCRIPTION_TYPE,
	CHANGE_CURRENT_FOLIO,
	UPDATE_FOLIO_INDEX
} from '../actions/allActions';

export default function navigationState(state = initialState, action) {
	switch (action.type) {

		case CHANGE_TRANSCRIPTION_TYPE:
			return Object.assign({}, state, {
				transcriptionType: action.payload
			})

		case CHANGE_CURRENT_FOLIO:

			// Lookup prev/next
			let shortID=action.payload.id.substr(action.payload.id.lastIndexOf('/')+1);
			let current_idx = state.folioIndex.indexOf(shortID);
			let nextID='';
			let prevID='';
			let current_hasPrev=false;
			let current_hasNext=false;
			if(current_idx > -1){
				current_hasNext = (current_idx<(state.folioIndex.length-1));
				nextID = current_hasNext?state.folioIndex[current_idx+1]:'';

				current_hasPrev = (current_idx>0 && state.folioIndex.length>1);
				prevID = current_hasPrev?state.folioIndex[current_idx-1]:'';
			}

			//console.log(current_hasPrev +"-"+ prevID +"-("+ shortID +")-"+ nextID +"-"+ current_hasNext);

			return Object.assign({}, state, {
				currentFolioID: action.payload.id,
				currentFolioShortID: shortID,
				currentFolioName: action.payload.name,

				hasPrevious: current_hasPrev,
				hasNext: current_hasNext,
				previousFolioShortID: prevID,
				nextFolioShortID: nextID

			})

		case UPDATE_FOLIO_INDEX:
			return Object.assign({}, state, {
				folioIndex: action.payload
			})

		default:
			return state;
	}
}
