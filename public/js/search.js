$(document).ready(function() {
    $("form").submit(function(e) {
		let searchTerm = $('.searchBox').val().trim();
		if(typeof searchTerm !== 'undefined' && searchTerm.length > 0){
			console.log("Search for:"+searchTerm);
			$('.searchBox').val(searchTerm);
		}
		e.preventDefault(); // avoid to execute the actual submit of the form.
	});
});
