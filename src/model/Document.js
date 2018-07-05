import Folio from './Folio';
import axios from 'axios';

class Document {

	constructor() {
    this.manifestURL = process.env.REACT_APP_IIIF_MANIFEST;
		this.folios = [];
		this.loaded = false;
	}

  load() {
    if( this.loaded ) {
      // promise to resolve this immediately
      return new Promise(function(resolve, reject) {
        resolve(this);
      }.bind(this));
    } else {
      // promise to load all the data for this folio
      return new Promise(function(resolve, reject) {
        //console.log("Manifest: "+this.manifestURL);
        if(typeof this.manifestURL === 'undefined'){
          alert("FATAL: Cannot load manifest, is env.REACT_APP_IIIF_MANIFEST defined?");
        }
        axios.get(this.manifestURL)
          .then( function( manifestResponse ) {
            if( this.parseManifest(manifestResponse.data) ) {
              this.loaded = true;
              resolve(this);
            } else {
              reject(new Error("Unable to parse folio element in transcription file."));
            }
        }.bind(this))
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

	parseManifest(manifest) {
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

      this.folios.push(folio);
    }

    return true;
  }

}

export default Document;
