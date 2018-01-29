import OpenSeadragon from 'openseadragon';
import React, { Component } from 'react';

import ImageZoomControl from './ImageZoomControl.js';

import './css/ImageView.css';

class ImageView extends Component {

  componentDidMount() {
    this.viewer = OpenSeadragon({
      id: "image-view-seadragon",
      zoomInButton:   "os-zoom-in",
      zoomOutButton:  "os-zoom-out",
      prefixUrl: "./img/openseadragon/"
    });

    this.props.folio.load().then( (folio) => {
      this.viewer.addTiledImage({
        tileSource: folio.tileSource
      });
    });
  }

  onZoomGrid = (e) => {
    this.props.splitPaneView.openFolio(this.props.side, this,'ImageGridView');
  }

  render() {
    return (
      <div className="image-view">
        <ImageZoomControl
          onZoomGrid={this.onZoomGrid}
        />
        <div id="image-view-seadragon" ></div>
      </div>
    );
  }
}

export default ImageView;
