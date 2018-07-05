
var DocumentHelper = {};

DocumentHelper.getFolio = function getFolio(document, folioID) {
  return document.folios.find((folio) => {
    return (folio.id === folioID);
  });
};

export default DocumentHelper;
