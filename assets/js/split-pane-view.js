class SplitPaneView {
  constructor(id) {
    this.id = id;
    this.splitPaneEl = null;
    this.dragging = false;
    this.dividerColumnFr = 0.5;
    this.dividerWidthPx = 16;
  }

  positionDivider(leftFr, rightFr) {
    this.splitPaneEl.style.gridTemplateColumns = `${leftFr}fr ${this.dividerColumnFr}fr ${rightFr}fr`;
  }

  onStartDrag(e) {
    this.dragging = true;
    this.clientX = e.clientX;
    this.viewportWidth = window.innerWidth;
  }

  onDrag(e) {
    if( this.dragging ) {
      var leftWidth = e.clientX + this.dividerWidthPx/2;
      var leftFr = (leftWidth/this.viewportWidth) * 10;
      var rightFr = (10.0 - leftFr);
      this.positionDivider(leftFr,rightFr);
    }
  }

  onEndDrag(e) {
    this.dragging = false;
  }

  render() {
    // bind to DOM
    this.splitPaneEl = $(`#${this.id}`).get(0);
    this.positionDivider(10, 10);

    // attach handlers to mouse events
    var $divider = $(`#${this.id} > .divider`);
    $divider.on('mousedown', this.onStartDrag.bind(this));
    $(window).on('mousemove', this.onDrag.bind(this));
    $(window).on('mouseup', this.onEndDrag.bind(this));
  }

}
