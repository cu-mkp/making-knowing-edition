import axios from 'axios';

class Annotation {
    constructor() {
        this.annotationURL = 'http://localhost:4000/bnf-ms-fr-640/annotations/anno1.html';
        this.loaded = false;
	}

	load() {
		if (this.loaded) {
			// promise to resolve this immediately
			return new Promise(function(resolve, reject) {
				resolve(this);
			}.bind(this));
		} else {
			// promise to load all the data for this folio
			return new Promise(function(resolve, reject) {
                axios.get(this.annotationURL)
                    .then(function(annotationResponse) {
                        this.content = annotationResponse.data;
                        this.loaded = true;
                    }.bind(this))
                    .catch((error) => {
                        reject(error);
                    });
			}.bind(this));
		}
	}
}

export default Annotation;