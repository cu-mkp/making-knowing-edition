import Document from '../model/Document';

var DocumentActions = {};

DocumentActions.loadDocument = function loadDocument( state ) {
	let document = new Document();
	document.load();
	return document;
};

export default DocumentActions;