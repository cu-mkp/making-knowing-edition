import OpenSeadragon from 'openseadragon';
import axios from 'axios';
import React, { Component } from 'react';

import ImageZoomControl from './ImageZoomControl.js';

import './css/ImageView.css';

class ImageView extends Component {

  constructor() {
    super();

    // load folio 3r
    this.tileSourceURL = "http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/f11/info.json";
  }

  getTileSource( url, callback ) {

    axios.get(url).then(
      function (response) {
        callback(new OpenSeadragon.IIIFTileSource(response.data));
    }).catch( (error) => {
      console.log(`Error retrieving image ${this.tileSourceURL}: ${error}`);
    });

  }

  componentDidMount() {
    this.viewer = OpenSeadragon({
      id: "image-view-seadragon",
      prefixUrl: "./img/openseadragon/"
    });

    this.getTileSource( this.tileSourceURL, (tileSource) => {
  		this.viewer.addTiledImage({
  			tileSource: tileSource
  		});
  	});
  }

  onZoomGrid() {
    alert('click')

  }

  render() {
    return (
      <div>
        <div id="image-view-seadragon" ></div>
        <ImageZoomControl
          onZoomGrid={this.onZoomGrid}
        />
      </div>
    );
  }
}

export default ImageView;
