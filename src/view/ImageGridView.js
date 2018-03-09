import React, { Component } from 'react';
import './css/ImageGridView.css';

class ImageGridView extends Component {

  onClickThumb = (id, e) => {
    let splitPaneView = this.props.splitPaneView;
    let side = this.props.side;
    let otherSide = splitPaneView.otherSide(side);
    splitPaneView.openFolio(side, id, 'ImageView');
    splitPaneView.openFolio(otherSide, id, 'TranscriptionView');
  }

  render() {
    let folios = this.props.document.folios;
    let thumbs = folios.slice(0,20); // TODO load based on scrolling
    let hidden = ( this.props.drawerMode && !this.props.drawerOpen ) ? "hidden" : "";
    let style = { height: this.props.viewHeight, overflow: 'scroll' };

    return (
      <div id='image-grid-view' className={hidden} style={style}>
        <ul>
        {
          thumbs.map((thumb) => (
            <li className="thumbnail" key={thumb.id}>
              <figure><a id={thumb.id} onClick={this.onClickThumb.bind(this,thumb.id)}><img src={thumb.image_thumbnail_url} alt={thumb.name}/></a></figure>
              <figcaption className="thumbnail-caption">{thumb.name}</figcaption>
            </li>
          ))
        }
        </ul>
      </div>
    );
  }
}

export default ImageGridView;
