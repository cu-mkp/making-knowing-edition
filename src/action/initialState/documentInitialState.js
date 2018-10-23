export default {
    currentDocumentName: 'BnF Ms. Fr. 640',
	folioIDPrefix: 'https://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/',
    manifestURL: process.env.REACT_APP_IIIF_MANIFEST,
    folios: [],
    loaded: false,
    folioIndex: [],
	folioNameByIDIndex:{},
	folioIDByNameIndex:{}
}	