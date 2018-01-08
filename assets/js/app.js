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
  var imageView = new ImageView();
  imageView.render();

  var splitPaneView = new SplitPaneView('reading-pane');
  splitPaneView.render();
});
