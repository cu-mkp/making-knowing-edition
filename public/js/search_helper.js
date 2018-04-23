/*
search_helper.js

All of the heavy lifing for search is handled by the search component.

This provides some scaffolding between the DOM/JS universe and react, it could (and should)
eventually get factored out

*/
$(document).ready(function() {
    $("form").submit(function(e) {
		let searchTerm = $('.searchBox').val().trim();
		if(typeof searchTerm !== 'undefined' && searchTerm.length > 0){
			$('.searchBox').val(searchTerm);
			var stateObj = { searchTerm: searchTerm };
			var url = "#/?search="+searchTerm;
			history.pushState(stateObj, "", url);
			window.dispatchEvent(new HashChangeEvent("hashchange"))
		}
		e.preventDefault(); // avoid to execute the actual submit of the form.
	});
});
