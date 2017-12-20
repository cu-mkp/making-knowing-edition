class TranscriptionView {
  constructor(id) {
    this.id = id;
    this.gridBreakPoint = 960;
  }

  onResize() {
    var viewWidth = this.$el.innerWidth()

    if( viewWidth < this.gridBreakPoint ) {
      this.$el.removeClass('grid-mode');
    } else {
      this.$el.addClass('grid-mode');
    }
  }

  render() {
    // bind to DOM
    this.$el = $(`#${this.id}`);
  }

}
