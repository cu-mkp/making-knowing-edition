import Folio from './Folio';

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

		// FIXME: Sync request
		var request = new XMLHttpRequest();
		request.open('GET', 'http://159.65.186.2/folio/manifest.json', false);  // `false` makes the request synchronous
		request.send(null);
		if (request.status === 200) {
		  var availableFolios = {};
		  availableFolios = JSON.parse(request.responseText);
		  var idx=0;
		  var self=this;
		  for (var key in availableFolios) {
			  if (availableFolios.hasOwnProperty(key)) {
				  var externalID=key;
				  //console.log(key + " -> " + availableFolios[key]);
				  // externalIDs are always in the form pXXXY, 5 chars, p followed by three digit number and finally a letter
				  //var externalID = 'p' + pad(parseInt(names[idx], 10), 3) + names[idx].replace(/[0-9]/g, '');
				  var newFolio = new Folio({
					  id: `folio${idx}`,
					  name: availableFolios[key].folio,
					  image_zoom_url: image_zoom_url(externalID),
					  image_thumbnail_url: image_thumbnail_url(externalID),
					  transcription_url: transcription_url(externalID, 'tc')
				  });
				  this.folios.push(newFolio);
				  idx++;
			  }
		  }
		}

		/*
		loadJSONFromURL('http://159.65.186.2/folio/manifest.json', function(response) {

			var availableFolios = {};
			availableFolios = JSON.parse(response);
			var idx=0;
			var self=this;
			for (var key in availableFolios) {
				if (availableFolios.hasOwnProperty(key)) {
					var externalID=key;
					//console.log(key + " -> " + availableFolios[key]);
					// externalIDs are always in the form pXXXY, 5 chars, p followed by three digit number and finally a letter
					//var externalID = 'p' + pad(parseInt(names[idx], 10), 3) + names[idx].replace(/[0-9]/g, '');
					var newFolio = new Folio({
						id: `folio${idx}`,
						name: availableFolios[key].folio,
						image_zoom_url: image_zoom_url(externalID),
						image_thumbnail_url: image_thumbnail_url(externalID),
						transcription_url: transcription_url(externalID, 'tc')
					});
					self.folios.push(newFolio);
					idx++;
				}
			}
			self.isReady=true;
		});
		*/
	}

	getFolio(folioID) {
		return this.folios.find((folio) => {
			return (folio.id === folioID);
		});
	}
}

// Internal helper methods

// Return the IIIF url
function image_zoom_url(externalID) {
	var IIFUrl = `https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/${externalID}_HD.tif/info.json`;
	console.log(IIFUrl);
	return 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p003r_HD.tif/info.json';

}
/*
new Folio( {
  id: `folio${i++}`,
  name: '3r',
  image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p003r_HD.tif/info.json',
  image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f11.thumbnail/full/native.jpg',
  transcription_url: `${domain}/bnf-ms-fr-640/tc_p003r.html`
} ),
*/

// Return the IIIF thumbnail url
function image_thumbnail_url(externalID) {
	return 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f11.thumbnail/full/native.jpg';
}

// Return the transcription url
function transcription_url(id, type) {
	// http://159.65.186.2/folio/p160v/tcn/
	let transcriptionServer = 'http://159.65.186.2/'
	return `${transcriptionServer}/folio/${id}/${type}`
}

// Helper: pad an integer
function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// Load JSON asynchronously, accept callback
function loadJSONFromURL(url, callback) {
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', url, true); // Replace 'my_data' with the path to your file
	xobj.onreadystatechange = function() {
		if (xobj.readyState == 4 && xobj.status == "200") {
			// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
			callback(xobj.responseText);
		}
	};
	xobj.send(null);
}
export default Document;
