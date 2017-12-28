
class ImageView extends SplitPaneViewport {
  constructor() {
    super('image-view');

    // load folio 3r
    this.tileSourceURL = "http://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/f11/info.json";
    this.drawerWidth = 300;
  }

  getTileSource( url, callback ) {
    $.ajax({
      url: url,
      dataType: 'json',
      success: function( obj ) {
        callback( new OpenSeadragon.IIIFTileSource(obj) );
    }});
  }

  onEnterDrawerMode() {
    // TODO display thumb strip
  }

  onLeaveDrawerMode() {
    // TODO return to grid/zoom modes
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
