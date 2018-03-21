import * as allActions from './allActions';

export function changeTranscriptionType(transcriptionType) {
    return {type: allActions.CHANGE_TRANSCRIPTION_TYPE, payload: transcriptionType};
}
export function changeCurrentFolio(folioID) {
    return {type: allActions.CHANGE_CURRENT_FOLIO, payload: folioID};
}
