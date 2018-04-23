export default {
	currentDocumentName: 'BnF Ms. Fr. 640',
	folioIDPrefix: 'http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/',
	drawerMode: false,
	linkedMode: true,
	bookMode: false,
	folioIndex: [],
	folioNameIndex:[],
	searchIndex:{},
	glossary: {
		tc: {},
		tcn: {},
		tl: {}
	},
	uiLabels: {
		transcriptionType: {
			tc: 'Transcription',
			tcn: 'Normalized Transcription',
			tl: 'Translation',
			f: 'Facsimile',
		}
	},
	left: {
		isGridMode: false,
		transcriptionType: 'tc',
		transcriptionTypeLabel: 'Transcription',
		currentFolioName: '',
		currentFolioID: '',
		currentFolioShortID: '',
		hasPrevious: false,
		hasNext: false,
		nextFolioShortID: '',
		previousFolioShortID: '',
		width: 0,
		viewType: 'ImageGridView'
	},
	right: {
		isGridMode: false,
		transcriptionType: 'tc',
		transcriptionTypeLabel: 'Transcription',
		currentFolioName: '',
		currentFolioID: '',
		currentFolioShortID: '',
		hasPrevious: false,
		hasNext: false,
		nextFolioShortID: '',
		previousFolioShortID: '',
		width: 0,
		viewType: 'TranscriptionView'
	}
};
