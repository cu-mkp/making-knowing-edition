import Folio from './Folio';
import axios from 'axios';
// 3r
// 6v
// 10r
// 16r (image into text), 120r (cross outs)
// 46v (normal)
// 75r (normal, but in scribe’s hand)
// 101r (annotated image in margins)

// 115v (marginal images)
// 123v (crossed out text and marginal notes)
// 124v
// 129v (marginal notes into the title area, images in the margins, marginal notes across and into body of the text)
// 139v (marginal notes)
// 164r (normal)
// 165v (margins going into text and header with picture)
// 168v
// 169r (images and an image key)

// http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/f207/info.json

class Document {

	constructor() {
		this.folios = [];
		this.loaded = false;
		this.isReady = false;

		// If ready, just resolve right away
		if( this.isReady ) {
		  return new Promise(function(resolve, reject) {
			resolve(this);
		  }.bind(this));

		// Not ready, go out and get the manifest
		} else {
		  return new Promise(function(resolve, reject) {
			axios.all([
			  axios.get('http://159.65.186.2/folio/manifest.json')
			])
			.then( axios.spread( function( manifest_response) {
			  this.folios = this.parseManifest(manifest_response);
			  if( this.folios === null ) {
				reject(new Error("Unable to parse folio manifest"));
			  } else {
				this.isReady = true;
				resolve(this);
			  }
			}.bind(this)))
			.catch( (error) => {
			  reject(error);
			})
		  }.bind(this));
		}
	}

	getFolio(folioID) {
		return this.folios.find((folio) => {
			return (folio.id === folioID);
		});
	}

	parseManifest(response){
		var availableFolios = {};
		availableFolios = JSON.parse(response);
		var idx=0;
		var self=this;
		for (var key in availableFolios) {
			if (availableFolios.hasOwnProperty(key)) {
				var externalID=key;
				var newFolio = new Folio({
					id: `folio${idx}`,
					name: availableFolios[key].folio,
					image_zoom_url: image_zoom_url(externalID),
					image_thumbnail_url: image_thumbnail_url(externalID),
					transcription_url: transcription_url(externalID, 'tc')
				});
				availableFolios.push(newFolio);
				idx++;
			}
		}
		return availableFolios;
	}
}

// Generate the IIIF url
function image_zoom_url(externalID) {
	var IIFUrl = `https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/${externalID}_HD.tif/info.json`;
	console.log(IIFUrl);
	return 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p003r_HD.tif/info.json';

}

// Generate the IIIF thumbnail url
function image_thumbnail_url(externalID) {
	return 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f11.thumbnail/full/native.jpg';
}

// Generate the transcription url
function transcription_url(id, type) {
	// http://159.65.186.2/folio/p160v/tcn/
	let transcriptionServer = 'http://159.65.186.2/'
	return `${transcriptionServer}/folio/${id}/${type}`
}

export default Document;
