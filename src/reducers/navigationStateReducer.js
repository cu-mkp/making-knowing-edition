import initialState from './initialState';
import {
	CHANGE_TRANSCRIPTION_TYPE,
	CHANGE_CURRENT_FOLIO
} from '../actions/allActions';

export default function navigationState(state = initialState, action) {
	switch (action.type) {

		case CHANGE_TRANSCRIPTION_TYPE:
			return Object.assign({}, state, {
				transcriptionType: action.payload
			})

		case CHANGE_CURRENT_FOLIO:
			return Object.assign({}, state, {
				currentFolioID: action.payload.id,
				currentFolioName: action.payload.name
			})
		default:
			return state;
	}
}
