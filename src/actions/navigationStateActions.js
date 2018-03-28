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
export function updateFolioNameIndex(payload){
	return {type: allActions.UPDATE_FOLIO_NAME_INDEX, payload: payload};
}
export function setDrawerMode(payload){
	return {type: allActions.SET_DRAWER_MODE, payload:payload};
}
export function setLinkedMode(payload){
	return {type: allActions.SET_LINKED_MODE, payload:payload};
}
export function setPaneSizes(payload){
	return {type: allActions.SET_PANE_SIZES, payload:payload};
}
export function setLeftPaneContent(payload){
	return {type: allActions.SET_LEFT_PANE_VIEWTYPE, payload:payload};
}
export function setRightPaneContent(payload){
	return {type: allActions.SET_RIGHT_PANE_VIEWTYPE, payload:payload};
}
