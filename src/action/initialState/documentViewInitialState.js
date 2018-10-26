export default {
	drawerMode: false,
	linkedMode: true,
	bookMode: false,
	inSearchMode:false,
    folioIndex: [],
	folioNameByIDIndex:{},
	folioIDByNameIndex:{},
	left: {
		isXMLMode: false,
		isGridMode: false,
		transcriptionType: 'tc',
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
		currentFolioShortID: '',
		hasPrevious: false,
		hasNext: false,
		nextFolioShortID: '',
		previousFolioShortID: '',
		width: 0,
		viewType: 'TranscriptionView'
	}
};
