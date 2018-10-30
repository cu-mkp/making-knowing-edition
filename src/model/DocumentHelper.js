
var DocumentHelper = {};

DocumentHelper.transcriptionTypeLabels = {
  tc: 'Transcription',
  tcn: 'Normalized Transcription',
  tl: 'Translation',
  f: 'Facsimile',
  anno: 'Annotation'
};

DocumentHelper.getFolio = function getFolio(document, folioID) {
  return document.folios.find((folio) => {
    return (folio.id === folioID);
  });
};

DocumentHelper.folioURL = function( folioID ) {
  return `${process.env.REACT_APP_FOLIO_URL_PREFIX}${folioID}`;
}

DocumentHelper.findNearestVerso = function findNearestVerso(id, folioNameByIDIndex, folioIndex, direction){
	let found=false;
	let versoID=id;
	let lookLeft=(typeof direction === undefined || direction === 'back');

	while(!found){
		// Look to see if this name ends in "v"
		let candidateName = folioNameByIDIndex[versoID];
		if(candidateName.endsWith("v")){
			found=true;

		// No, so keep looking
		}else{
			if(lookLeft && folioIndex.indexOf(versoID) > 0){
				versoID=folioIndex[folioIndex.indexOf(versoID) - 1];
			}else{
				lookLeft=false;
				if(folioIndex.indexOf(versoID) < folioIndex.length){
					versoID=folioIndex[folioIndex.indexOf(versoID) + 1];
				}else{
					console.log("ERROR: Couldn't find a single verso page!");
					return null;
				}
			}
		}
	}
	return versoID;
}

export default DocumentHelper;
