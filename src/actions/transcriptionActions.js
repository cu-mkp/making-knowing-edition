import * as allActions from './allActions';

export function changeTranscriptionType(transcriptionType) {
    return {type: allActions.CHANGE_TRANSCRIPTION_TYPE, transcriptionType: transcriptionType};
}
