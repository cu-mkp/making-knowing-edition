var GlossaryActions = {};

GlossaryActions.updateGlossary = function updateGlossary( state, transcriptionType, glossaryData ) {
    if(transcriptionType === 'tc'){
        return {
            ...state,
            tc: glossaryData
        }

    }else if(transcriptionType === 'tl'){
        return {
            ...state,
            tl: glossaryData
        }

    }else if(transcriptionType === 'tcn'){
        return {
            ...state,
            tcn: glossaryData
        }
    }else{
        return state;
    }
};

export default GlossaryActions;