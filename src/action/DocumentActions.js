import Folio from '../model/Folio';
import axios from 'axios';
import { dispatchAction } from '../model/ReduxStore';

var DocumentActions = {};

DocumentActions.requestDocument = function loadDocument( state, manifestURL, dispatcher ) {
	axios.get(manifestURL).then( function( manifestResponse ) {
		dispatchAction( dispatcher, 'DocumentActions.loadDocument', manifestResponse.data );
	})
	.catch( (error) => {
		console.log(error)
	})

	return { 
		...state,
		manifestURL
	}
};

DocumentActions.loadDocument = function loadDocument( state, manifestData ) {
	let folios = parseManifest(manifestData);
	let { folioIndex, nameByID, idByName } = createFolioIndex(folios);
	return {
		...state,
		loaded: true,
		folios, folioIndex,
		folioNameByIDIndex: nameByID, 
		folioIDByNameIndex: idByName
	};
};

function createFolioIndex(folios) {
	// Store an ordered array of folio ids, used for next/prev navigation purposes later
	let folioIndex = [];
	let nameByID = {};
	let idByName = {};
	for (let idx = 0; idx < folios.length; idx++) {
		let shortID = folios[idx].id.substr(folios[idx].id.lastIndexOf('/') + 1);
		folioIndex.push(shortID);
		nameByID[shortID] = folios[idx].name;
		idByName[folios[idx].name] = shortID;
	}
	return { folioIndex, nameByID, idByName };
}

function parseManifest(manifest) {
	let folios = [];
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

	return folios;
}

export default DocumentActions;