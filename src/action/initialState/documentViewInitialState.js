export default {
	drawerMode: false,
	linkedMode: true,
	bookMode: false,
	inSearchMode:false,
    folioIndex: [],
	folioNameByIDIndex:{},
	folioIDByNameIndex:{},
	uiLabels: {
		transcriptionType: {
			tc: 'Transcription',
			tcn: 'Normalized Transcription',
			tl: 'Translation',
			f: 'Facsimile',
		}
	},
	left: {
		isXMLMode: false,
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
		isXMLMode: false,
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
