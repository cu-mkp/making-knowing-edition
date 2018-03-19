import initialState from './initialState';
import {CHANGE_TRANSCRIPTION_TYPE} from '../actions/allActions';

export default function transcriptionType(state = initialState.transcriptionType, action) {
  let newState;
  switch (action.type) {
    case CHANGE_TRANSCRIPTION_TYPE:
      console.log('CHANGE_TRANSCRIPTION_TYPE Action')
      return action;
    default:
      return state;
  }
}
