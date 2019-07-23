
var DocumentHelper = {};

DocumentHelper.transcriptionTypeLabels = {
  tc: 'Diplomatic (FR)',
  tcn: 'Normalized (FR)',
  tl: 'Translation (EN)',
  f: 'Facsimile',
  anno: 'Annotation',
  glossary: 'Glossary'
};

DocumentHelper.getFolio = function getFolio(document, folioID) {
  return document.folios.find((folio) => {
    return (folio.id === folioID);
  });
};

DocumentHelper.folioURL = function( folioID ) {
  return `${process.env.REACT_APP_FOLIO_URL_PREFIX}${folioID}`;
}


DocumentHelper.generateFolioID = function( bnfLabel ) {
  // grab r or v off the end
  let rectoOrVerso = bnfLabel.slice( bnfLabel.length-1 );
  let id = parseInt(bnfLabel.slice(0,bnfLabel.length-1),10);

  // the beginning and end pages do not have a numeric label
  if( isNaN(id) ) return null;

  // figure out how much padding we need
  let zeros = "";

  if( id < 10 ) {
    zeros = zeros + "0"
  }

  if( id < 100 ) {
    zeros = zeros + "0"
  }

  return `p${zeros.concat(id)}${rectoOrVerso}`;
}

export default DocumentHelper;
