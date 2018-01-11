class MainView {
  constructor( id ) {
    this.id = id;
  }

  render() {
    // default viewports
    this.imageView = new ImageView();
    this.transcriptionView = new TranscriptionView();

    this.splitPaneView = new SplitPaneView(
      this.id,
      this.imageView,
      this.transcriptionView
    );
    this.splitPaneView.render();
  }

}
