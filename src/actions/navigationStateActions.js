import * as allActions from './allActions';

export function changeTranscriptionType(transcriptionType) {
    return {type: allActions.CHANGE_TRANSCRIPTION_TYPE, payload: transcriptionType};
}
export function changeCurrentFolio(payload) {
    return {type: allActions.CHANGE_CURRENT_FOLIO, payload: payload};
}
export function updateFolioIndex(payload){
	return {type: allActions.UPDATE_FOLIO_INDEX, payload: payload};
}
export function setDrawerMode(payload){
	return {type: allActions.SET_DRAWER_MODE, payload:payload};
}
