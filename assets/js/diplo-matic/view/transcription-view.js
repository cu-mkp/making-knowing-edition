class TranscriptionView extends SplitPaneViewport {
  constructor() {
    super('transcription-view');
    this.gridBreakPoint = 640; // two column widths
  }

  onResize() {
    var viewWidth = this.$el.innerWidth();
    // console.log(`width: ${viewWidth}`);

    if( viewWidth < this.gridBreakPoint ) {
      this.$el.removeClass('grid-mode');
    } else {
      this.$el.addClass('grid-mode');
    }
  }

  render() {
    super.render();
  }

}
