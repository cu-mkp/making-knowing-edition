import OpenSeadragon from 'openseadragon';
import axios from 'axios';
import React, { Component } from 'react';

import ImageZoomControl from './ImageZoomControl.js';

import './css/ImageView.css';

class ImageView extends Component {

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
      zoomInButton:   "os-zoom-in",
      zoomOutButton:  "os-zoom-out",
      prefixUrl: "./img/openseadragon/"
    });

    this.getTileSource( this.props.folio.image_zoom_url, (tileSource) => {
  		this.viewer.addTiledImage({
  			tileSource: tileSource
  		});
  	});
  }

  onZoomGrid = (e) => {
    this.props.splitPaneView.openFolio(this.props.side, this,'ImageGridView');
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
