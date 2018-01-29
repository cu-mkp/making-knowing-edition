import Folio from './Folio';

class Document {

  constructor() {
    this.folios = [
      new Folio( {
        id: 0,
        name: '3r',
        image_zoom_url: 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/f11/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f11.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p003r.html'
      } ),
      new Folio( {
        id: 1,
        name: '3v',
        image_zoom_url: 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/f12/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f12.thumbnail/full/native.jpg'
      } ),
      new Folio( {
        id: 2,
        name: '4r',
        image_zoom_url: 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/f13/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f13.thumbnail/full/native.jpg'
      } ),
      new Folio( {
        id: 3,
        name: '4v',
        image_zoom_url: 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/f14/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f14.thumbnail/full/native.jpg'
      } ),
      new Folio( {
        id: 4,
        name: '5r',
        image_zoom_url: 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/f15/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f15.thumbnail/full/native.jpg'
      } ),
      new Folio( {
        id: 5,
        name: '5v',
        image_zoom_url: 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/f16/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f16.thumbnail/full/native.jpg'
      } )
    ];
  }

}

export default Document;
