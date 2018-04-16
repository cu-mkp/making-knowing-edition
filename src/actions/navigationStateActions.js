import * as allActions from './allActions';

export function changeTranscriptionType(payload) {
    return {type: allActions.CHANGE_TRANSCRIPTION_TYPE, payload: payload};
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
export function updateGlossary(payload){
	return {type: allActions.UPDATE_GLOSSARY, payload: payload};
}
export function setDrawerMode(payload){
	return {type: allActions.SET_DRAWER_MODE, payload:payload};
}
export function setLinkedMode(payload){
	return {type: allActions.SET_LINKED_MODE, payload:payload};
}
export function setBookMode(payload){
	return {type: allActions.SET_BOOK_MODE, payload:payload};
}
export function setwidths(payload){
	return {type: allActions.SET_PANE_SIZES, payload:payload};
}
export function setPaneViewtype(payload){
	return {type: allActions.SET_PANE_VIEWTYPE, payload:payload};
}
export function setColumnModeForSide(payload){
	return {type: allActions.SET_COLUMN_MODE_FOR_SIDE, payload:payload};
}
