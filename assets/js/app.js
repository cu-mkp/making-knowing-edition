// --------------------------------------------------
// APP.JS
// --------------------------------------------------

//
// Initialize Foundation
// --------------------------------------------------

$(document).foundation();

//
// Custom JS
// --------------------------------------------------


$( document ).ready(function() {
  var tileSourceURL = "http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/f11/info.json";
//  var tileSourceURL = "https://iip.textlab.org/?IIIF=mel/billybudd/modbm_ms_am_188_363_0055.tif/info.json";

  var getTileSource = function( callback ) {
    $.ajax({
      url: tileSourceURL,
      dataType: 'json',
      success: function( obj ) {
        callback( new OpenSeadragon.IIIFTileSource(obj) );
    }});
  }

  var viewer = OpenSeadragon({
      id: "image-view-seadragon",
      prefixUrl: "../assets/img/openseadragon/"
  });

  getTileSource( function(tileSource) {
		viewer.addTiledImage({
			tileSource: tileSource
		});
	});

});
