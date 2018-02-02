import Folio from './Folio';

// 3r
// 6v
// 10r
// 16r (image into text), 120r (cross outs)
// 46v (normal)
// 75r (normal, but in scribe’s hand)
// 101r (annotated image in margins)

// 115v (marginal images)
// 123v (crossed out text and marginal notes)
// 124v
// 129v (marginal notes into the title area, images in the margins, marginal notes across and into body of the text)
// 139v (marginal notes)
// 164r (normal)
// 165v (margins going into text and header with picture)
// 168v
// 169r (images and an image key)

// http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/f207/info.json

class Document {

  constructor() {
    let i = 0;
    this.folios = [
      new Folio( {
        id: `folio${i++}`,
        name: '3r',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p003r_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f11.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p003r.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '6v',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p006v_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f18.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p006v.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '10r',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p010r_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f25.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p010r.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '16r',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p016r_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f37.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p016r.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '46v',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p046v_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f98.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p046v.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '75r',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p075r_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f155.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p075r.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '101r',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p101r_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f207.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p101r.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '115v',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p115v_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f236.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p115v.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '123v',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p123v_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f252.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p123v.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '124v',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p124v_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f254.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p124v.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '129v',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p129v_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f264.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p129v.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '139v',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p139v_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f284.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p139v.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '164r',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p164r_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f333.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p164r.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '165v',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p165v_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f336.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p165v.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '168v',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p168v_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f342.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p168v.html'
      } ),
      new Folio( {
        id: `folio${i++}`,
        name: '169r',
        image_zoom_url: 'https://iip.textlab.org/?IIIF=octoroon/bnf_ms_fr_640/p169r_HD.tif/info.json',
        image_thumbnail_url: 'http://gallica.bnf.fr/ark:/12148/btv1b10500001g/f343.thumbnail/full/native.jpg',
        transcription_url: 'http://localhost:4000/bnf-ms-fr-640/tc_p169r.html'
      } )
    ];
  }

  getFolio( folioID ) {
    return this.folios.find( (folio) => {
        return (folio.id === folioID);
    });
  }


}

export default Document;
