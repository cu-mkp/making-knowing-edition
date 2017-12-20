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

  var transcriptionView = new TranscriptionView('transcription-view');
  transcriptionView.render();

  var splitPaneView = new SplitPaneView(
    'reading-pane',
    transcriptionView.onResize.bind(transcriptionView)
  );
  splitPaneView.render();
});
