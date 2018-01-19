import React, { Component } from 'react';
import './css/ImageGridView.css';

class ImageGridView extends Component {

  constructor() {
    super();

    this.thumbs = [
      {
        id: 0,
        url: 'https://iip.textlab.org/?IIIF=mel/billybudd/modbm_ms_am_188_363_0063.tif/full/100,/0/default.jpg',
        name: 'Folio 3r'
      },
      {
        id: 1,
        url: 'https://iip.textlab.org/?IIIF=mel/billybudd/modbm_ms_am_188_363_0013.tif/full/100,/0/default.jpg',
        name: 'Folio 3r'
      },
      {
        id: 2,
        url: 'https://iip.textlab.org/?IIIF=mel/billybudd/modbm_ms_am_188_363_0066.tif/full/100,/0/default.jpg',
        name: 'Folio 3r'
      }
    ];

  }

  onClickThumb(id, e) {
    alert('click '+id);
  }

  render() {
    return (
      <div id='image-grid-view'>
        <ul>
        {
          this.thumbs.map((thumb,i) => (
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
