class SplitPaneViewport {
  constructor(id) {
    this.id = id;
    this.drawerWidth = 0;
    this.drawerMode = false;
    this.drawerOpen = false;
  }

  onResize() {
    // blank, optionally implement in derived class
  }

  onEnterDrawerMode() {
    // blank, optionally implement in derived class
  }

  onLeaveDrawerMode() {
    // blank, optionally implement in derived class
  }

  render() {
    // bind to DOM
    this.$el = $(`#${this.id}`);
  }

}
