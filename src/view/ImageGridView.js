import React, { Component } from 'react';
import './css/ImageGridView.css';

class ImageGridView extends Component {

  onClickThumb(id, e) {
    alert('click '+id);
  }

  render() {
    let thumbs = this.props.document.folios;

    return (
      <div id='image-grid-view'>
        <ul>
        {
          thumbs.map((thumb,i) => (
            <li className="thumbnail" key={"thumb-"+i}>
              <figure><a id={i} onClick={this.onClickThumb.bind(this,i)}><img src={thumb.url} alt={thumb.name}/></a></figure>
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
