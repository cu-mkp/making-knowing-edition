class MainView {
  constructor( id ) {
    this.id = id;
  }

  render() {
    // default viewports
    this.imageView = new ImageView('image-view');
    this.transcriptionView = new TranscriptionView('transcription-view');

    this.splitPaneView = new SplitPaneView(
      this.id,
      this.imageView,
      this.transcriptionView
    );
    this.splitPaneView.render();
  }

}
