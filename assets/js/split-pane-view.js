class SplitPaneView {
  constructor(id) {
    this.id = id;
    this.splitPaneEl = null;
    this.dragging = false;
    this.dividerWidth = 16;
    this.splitFraction = 0.5;
  }

  onStartDrag(e) {
    this.dragging = true;
  }

  onDrag(e) {
    if( this.dragging ) {
      // calculate the size of the left and right panes based on viewport width.
      var whole = window.innerWidth - this.dividerWidth;
      var left = e.clientX - this.dividerWidth/2;
      this.splitFraction = (whole == 0) ? 0.0 : left / whole;
      this.positionDivider();
    }
  }

  onEndDrag(e) {
    this.dragging = false;
  }

  positionDivider() {
    var left = this.splitFraction;
    var right = 1.0 - left;
    this.splitPaneEl.style.gridTemplateColumns = `${left}fr ${this.dividerWidth}px ${right}fr`;
  }

  render() {
    // bind to DOM
    this.splitPaneEl = $(`#${this.id}`).get(0);
    this.positionDivider();

    // attach handlers to mouse events
    var $divider = $(`#${this.id} > .divider`);
    $divider.on('mousedown', this.onStartDrag.bind(this));
    $(window).on('mousemove', this.onDrag.bind(this));
    $(window).on('mouseup', this.onEndDrag.bind(this));
    $(window).on('resize', this.positionDivider.bind(this));
  }

}
