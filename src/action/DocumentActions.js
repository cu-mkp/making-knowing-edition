import Folio from '../model/Folio';
import axios from 'axios';

var DocumentActions = {};

DocumentActions.loadDocument = function loadDocument( state, manifestURL ) {
	state.manifestURL = manifestURL;

	axios.get(state.manifestURL).then( function( manifestResponse ) {
    	state.loaded = parseManifest(state.folios, manifestResponse.data);
	})
	.catch( (error) => {
		console.log(error)
	})

	return state;
};

function parseManifest(folios, manifest) {
	let canvases = manifest["sequences"][0]["canvases"];

	for( let canvas of canvases ) {
		let canvasID = canvas["@id"];
		let canvasLabel = canvas["label"];
		let imageURL = canvas["images"][0].resource.service["@id"] + '/info.json';
		let thumbnailURL = canvas["thumbnail"]["@id"] + '/full/native.jpg';
		let annotationListURL = null;

		if( canvas["otherContent"] ) {
		annotationListURL = canvas["otherContent"][0]["@id"];
		}

		var folio = new Folio({
			id: canvasID,
			name: canvasLabel,
			image_zoom_url: imageURL,
			image_thumbnail_url: thumbnailURL,
			annotationListURL: annotationListURL
		});

		folios.push(folio);
	}

	return true;
}

export default DocumentActions;