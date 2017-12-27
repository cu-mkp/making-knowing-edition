class SplitPaneViewport {
  constructor(id) {
    this.id = id;
  }

  onResize() {
    // blank, implement this in derived classes
  }

  render() {
    // bind to DOM
    this.$el = $(`#${this.id}`);
  }

}
