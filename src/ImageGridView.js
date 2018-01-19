import React, { Component } from 'react';
import './css/ImageGridView.css';

class ImageGridView extends Component {

  constructor() {
    super();

    this.folios = [
      {
        url: 'https://iip.textlab.org/?IIIF=mel/billybudd/modbm_ms_am_188_363_0063.tif/full/100,/0/default.jpg',
        name: 'Folio 3r'
      },
      {
        url: 'https://iip.textlab.org/?IIIF=mel/billybudd/modbm_ms_am_188_363_0013.tif/full/100,/0/default.jpg',
        name: 'Folio 3r'
      },
      {
        url: 'https://iip.textlab.org/?IIIF=mel/billybudd/modbm_ms_am_188_363_0066.tif/full/100,/0/default.jpg',
        name: 'Folio 3r'
      }
    ];

  }

  render() {
    return (
      <div id='image-grid-view'>
        <ul>
        {
          this.folios.map((tile) => (
            <li className="thumbnail" key={tile.url}>
              <figure><img src={tile.url} alt={tile.name}/></figure>
              <figcaption className="thumbnail-caption">{tile.name}</figcaption>
            </li>
          ))
        }
        </ul>
      </div>
    );
  }
}

export default ImageGridView;
