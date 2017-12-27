class MainView {
  constructor( id ) {
    this.id = id;
  }

  render() {
    this.imageView = new ImageView();
    this.imageView.render();

    this.transcriptionView = new TranscriptionView('transcription-view');
    this.transcriptionView.render();

    this.splitPaneView = new SplitPaneView(
      this.id,
      this.transcriptionView.onResize.bind(this.transcriptionView)
    );
    this.splitPaneView.render();
  }

}
