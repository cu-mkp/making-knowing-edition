/*
search_helper.js

All of the heavy lifing for search is handled by the search component.

This provides some scaffolding between the DOM/JS universe and react,
esentially just gluing the navigation (or any external) form submission into the react app.

Don't expand this very much, really all it should do is accept a form submission

*/
$(document).ready(function() {
    $("form").submit(function(e) {
		let searchTerm = $('.searchBox').val().trim();
		if(typeof searchTerm !== 'undefined' && searchTerm.length > 0){
			$('.searchBox').val('');
			var stateObj = { searchTerm: searchTerm };
			var url = "#/?search="+searchTerm;
			history.pushState(stateObj, "", url);
			window.dispatchEvent(new HashChangeEvent("hashchange"))
		}
		e.preventDefault(); // avoid to execute the actual submit of the form.
	});
});
