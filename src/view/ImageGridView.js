import React, { Component } from 'react';
import './css/ImageGridView.css';

class ImageGridView extends Component {

  onClickThumb = (id, e) => {
    this.props.splitPaneView.openFolio(this.props.side, id, 'ImageView');
  }

  render() {
    let thumbs = this.props.document.folios;
    let hidden = ( this.props.drawerMode && !this.props.drawerOpen ) ? "hidden" : "";

    return (
      <div id='image-grid-view' className={hidden}>
        <ul>
        {
          thumbs.map((thumb,i) => (
            <li className="thumbnail" key={"thumb-"+i}>
              <figure><a id={i} onClick={this.onClickThumb.bind(this,i)}><img src={thumb.image_thumbnail_url} alt={thumb.name}/></a></figure>
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
