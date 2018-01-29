import OpenSeadragon from 'openseadragon';
import axios from 'axios';

class Folio {

  constructor( props ) {
    this.id = props.id;
    this.name = props.name;
    this.image_zoom_url = props.image_zoom_url;
    this.image_thumbnail_url = props.image_thumbnail_url;
    this.transcription_url = props.transcription_url;
    this.tileSource = null;
    this.transcription = null;
    this.loaded = false;
  }

  load( callback ) {
    if( this.loaded ) {
      // promise to resolve this immediately
      return new Promise(function(resolve, reject) {
        resolve(this);
      }.bind(this));
    } else {
      // promise to load all the data for this folio
      return new Promise(function(resolve, reject) {
        axios.all([
          axios.get(this.image_zoom_url),
          axios.get(this.transcription_url)
        ])
        .then( axios.spread( function( imageServerResponse, transcriptionResponse ) {
          this.tileSource = new OpenSeadragon.IIIFTileSource(imageServerResponse.data);
          this.parseTranscription(transcriptionResponse.data);
          this.loaded = true;
          resolve(this);
        }.bind(this)))
        .catch( (error) => {
          reject(error);
        })
      }.bind(this));
    }
  }

  parseTranscription( html ) {
    // TODO
    this.transcription = "<h3>Loaded transcription.</h3>";
    console.log('receieved HTML: '+html);
  }

}

export default Folio;
