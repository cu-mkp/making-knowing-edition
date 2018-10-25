
var DocumentHelper = {};

DocumentHelper.transcriptionTypeLabels = {
  tc: 'Transcription',
  tcn: 'Normalized Transcription',
  tl: 'Translation',
  f: 'Facsimile',
  anno: 'Annotation'
};

DocumentHelper.getFolio = function getFolio(document, folioID) {
  return document.folios.find((folio) => {
    return (folio.id === folioID);
  });
};

DocumentHelper.folioURL = function( folioID ) {
  return `${process.env.REACT_APP_FOLIO_URL_PREFIX}${folioID}`;
}

export default DocumentHelper;
