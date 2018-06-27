import initialState from '../action/initialState';
import {

	// search
	UPDATE_SEARCH_INDEX,
	ENTER_SEARCH_MODE,
	EXIT_SEARCH_MODE,
	CACHE_SEARCH_RESULTS,
	HIDE_SEARCH_TYPE,

	//glossary
	UPDATE_GLOSSARY
	
} from '../action/allActions';

export default function navigationState(state = initialState, action) {
	switch (action.type) {

		case UPDATE_GLOSSARY:
			if(action.payload.transcriptionType === 'tc'){
				return {
					...state,
					glossary:{
						...state.glossary,
						tc: action.payload.glossaryData
					}
				}

			}else if(action.payload.transcriptionType === 'tl'){
				return {
					...state,
					glossary:{
						...state.glossary,
						tl: action.payload.glossaryData
					}
				}

			}else if(action.payload.transcriptionType === 'tcn'){
				return {
					...state,
					glossary:{
						...state.glossary,
						tcn: action.payload.glossaryData
					}
				}
			}else{
				return state;
			}


		case UPDATE_SEARCH_INDEX:
			return {
				...state,
				search:{
					...state.search,
					index:action.payload.searchIndex
				}
			}

		case ENTER_SEARCH_MODE:

			let results = {};
			results['tc'] = state.search.index.searchEdition(action.payload.searchTerm,'tc');
			results['tcn'] = state.search.index.searchEdition(action.payload.searchTerm,'tcn');
			results['tl'] = state.search.index.searchEdition(action.payload.searchTerm,'tl');

			return {
				...state,
				linkedMode: false,
				bookMode: false,
				search:{
					...state.search,
					term:action.payload.searchTerm,
					inSearchMode:true,
					results:results
				},

				left: {
					...state.left,
					viewType: 'SearchResultView'
				},

				right:{
					...state.right,
					isGridMode: false,
					viewType: 'TranscriptionView',
					transcriptionType: 'tc',
					transcriptionTypeLabel: 'Transcription',
					currentFolioName: '',
					currentFolioID: '-1',
					currentFolioShortID: '',
					hasPrevious: false,
					hasNext: false,
					nextFolioShortID: '',
					previousFolioShortID: ''
				}
			}

		case EXIT_SEARCH_MODE:
			// If we have a folio selected in search results, match the left pane
			// otherwise just clear and gridview
			let leftState;
			if(parseInt(state.right.currentFolioID,10) === -1){
					leftState = {
						...state.left,
						viewType: 'ImageGridView',
						currentFolioName: '',
						currentFolioID: '',
						currentFolioShortID: '',
						hasPrevious: false,
						hasNext: false,
						nextFolioShortID: '',
						previousFolioShortID: ''
					};
				}else{
					leftState = {
						...state.right,
						viewType: 'ImageView'
					};
			}
			
			return {
				...state,
				linkedMode: true,
				search:{
					...state.search,
					term:'',
					inSearchMode:false,
					results:''
				},

				left: leftState,

				right:{
					...state.right,
				}
			}

		case HIDE_SEARCH_TYPE:
			if(action.payload.type === 'tc'){
				return {
					...state,
					search:{
						...state.search,
						typeHidden:{
							...state.search.typeHidden,
							tc:action.payload.value
						}
					}
				}
			}else if(action.payload.type === 'tcn'){
				return {
					...state,
					search:{
						...state.search,
						typeHidden:{
							...state.search.typeHidden,
							tcn:action.payload.value
						}
					}
				}
			}else if(action.payload.type === 'tl'){
				return {
					...state,
					search:{
						...state.search,
						typeHidden:{
							...state.search.typeHidden,
							tl:action.payload.value
						}
					}
				}
			}
			return state;


		case CACHE_SEARCH_RESULTS:
			return{
				...state,
				search:{
					...state.search,
					results:action.payload.results
				}
			}
		
		default:
			return state;
	}
}
