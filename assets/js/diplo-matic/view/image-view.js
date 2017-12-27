// import SplitPaneViewport from 'view/split-pane-viewport'

class ImageView extends SplitPaneViewport {
  constructor(id) {
    super(id);

    // load folio 3r
    this.tileSourceURL = "http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/f11/info.json";
  }

  getTileSource( url, callback ) {
    $.ajax({
      url: url,
      dataType: 'json',
      success: function( obj ) {
        callback( new OpenSeadragon.IIIFTileSource(obj) );
    }});
  }

  render() {
    super.render();

    this.viewer = OpenSeadragon({
        id: "image-view-seadragon",
        prefixUrl: "../assets/img/openseadragon/"
    });

    this.getTileSource( this.tileSourceURL, (tileSource) => {
  		this.viewer.addTiledImage({
  			tileSource: tileSource
  		});
  	});
  }

}
