class TranscriptionView extends SplitPaneViewport {
  constructor(id) {
    super(id);
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

    // bind to DOM
    this.$el = $(`#${this.id}`);
  }

}
