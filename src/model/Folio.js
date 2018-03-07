import OpenSeadragon from 'openseadragon';
import axios from 'axios';

class Folio {

  constructor( props ) {
    this.id = props.id;
    this.name = props.name;
    this.image_zoom_url = props.image_zoom_url;
    this.image_thumbnail_url = props.image_thumbnail_url;
    this.annotationListURL = props.annotationListURL;
    this.tileSource = null;
    this.transcription = null;
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
        if( this.annotationListURL ) {
          axios.all([
            axios.get(this.image_zoom_url),
            axios.get(this.annotationListURL)
          ])
          .then( axios.spread( function( imageServerResponse, annotationListResponse ) {
            this.tileSource = new OpenSeadragon.IIIFTileSource(imageServerResponse.data);
            this.transcription = this.loadTranscriptions(annotationListResponse.data);

            if( this.transcription === null ) {
              reject(new Error("Unable to parse folio element in transcription file."));
            } else {
              this.loaded = true;
              resolve(this);
            }
          }.bind(this) ))
          .catch( (error) => {
            reject(error);
          });
        // if there is no annotatation list, just load the image and provide a blank transcription
        } else {
          axios.all([
            axios.get(this.image_zoom_url)
          ])
          .then( function( imageServerResponse ) {
            this.transcription = { layout: "grid", html: "" };
            this.tileSource = new OpenSeadragon.IIIFTileSource(imageServerResponse.data);
            this.loaded = true;
            resolve(this);
          }.bind(this) )
          .catch( (error) => {
            reject(error);
          });
        }
      }.bind(this));
    }
  }

  loadTranscriptions( annotationList ) {
    // hardcode to just get first transcription
    let transcriptionURL = annotationList["resources"][0]["resource"]["@id"];
    //
    // axios.get(transcriptionURL).then( function( transcriptionResponse ) {
    //   this.parseTranscription(transcriptionResponse.data);
    // }.bind(this) );

    return { layout: "grid", html: transcriptionURL };

  }

  // returns transcription or null if unable to parse
  parseTranscription( html ) {
    let folioTag = "<folio";
    let openDivIndex = html.indexOf(folioTag);
    if( openDivIndex === -1 ) return null;
    let start = html.indexOf(">", openDivIndex) + 1;
    let end = html.lastIndexOf("</folio>");
    if( end === -1 ) return null;
    if( start >= end ) return null;

    // detect folio mode
    let folioAttribs = html.slice(openDivIndex+folioTag.length, start-1);
    let layoutAttr = "layout=";
    let layoutAttrIndex = folioAttribs.indexOf(layoutAttr)
    if( layoutAttrIndex === -1 ) return null;
    let layoutAttrStart = layoutAttrIndex+layoutAttr.length+1;
    let layoutType = folioAttribs.slice(layoutAttrStart, folioAttribs.indexOf('"',layoutAttrStart));
    let transcription = html.slice(start, end);
    return { layout: layoutType, html: transcription };
  }

}

export default Folio;
