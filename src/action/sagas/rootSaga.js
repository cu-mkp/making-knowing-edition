import { all } from 'redux-saga/effects'

import AnnotationSagas from './AnnotationSagas';

export default function* rootSaga() {
  yield all([
    AnnotationSagas.requestAnnotation()
  ])
}