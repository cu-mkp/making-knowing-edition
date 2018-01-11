class SplitPaneView {
  constructor(id, leftViewport, rightViewport) {
    this.id = id;
    this.splitPaneEl = null;
    this.dragging = false;
    this.dividerWidth = 32;
    this.splitFraction = 0.5;
    this.minWindowSize = 768;
    this.viewports = {
      left: leftViewport,
      right: rightViewport
    };
    leftViewport.viewportName = 'left';
    rightViewport.viewportName = 'right';
  }

  fireResizeListeners() {
    this.viewports['left'].onResize();
    this.viewports['right'].onResize();
  }

  onStartDrag(e) {
    var drawer = this.getDrawerViewport();
    if( drawer && drawer.drawerMode && !drawer.drawerOpen ) {
      // if drawer is closed, do nothing
      return;
    }

    this.dragging = true;
    $('body').css( 'cursor', 'ew-resize' );
    $('body').css( 'user-select', 'none' );
  }

  onDrag(e) {
    if( this.dragging ) {
      // calculate the size of the left and right panes based on viewport width.
      var whole = window.innerWidth - this.dividerWidth;
      var left = e.clientX - this.dividerWidth/2;
      var right = whole - left;

      this.updateDrawerMode(this.viewports['left'], left);
      this.updateDrawerMode(this.viewports['right'], right);

      this.splitFraction = (whole == 0) ? 0.0 : left / whole;
      this.positionDivider();
    }
  }

  onResize(e) {
    var leftViewport = this.viewports['left'];
    var rightViewport = this.viewports['right'];
    var left = leftViewport.$el.width();
    var right = rightViewport.$el.width();
    var drawer = this.getDrawerViewport();

    // close left viewport
    if( leftViewport.drawerOpen || !leftViewport.drawerMode ) {
      // if the window gets too small, collapse the left viewport
      if( window.innerWidth < this.minWindowSize ) {
        this.enterDrawerMode(leftViewport);
        this.closeDrawer(leftViewport);
      } else {
        this.updateDrawerMode(leftViewport, left);
        this.updateDrawerMode(rightViewport, right);
        this.positionDivider();
      }
    }
    
  }

  updateDrawerMode( viewport, extent ) {
    // check for exiting drawer mode
    if( viewport.drawerMode && viewport.drawerOpen && extent > viewport.drawerWidth ) {
        this.leaveDrawerMode(viewport);
    // check for entering drawer mode and don't shrink past drawer width
    } else if( !viewport.drawerMode && extent <= viewport.drawerWidth ) {
        this.enterDrawerMode(viewport);
    }
  }

  onEndDrag(e) {
    this.dragging = false;
    $('body').css( 'cursor', 'auto' );
    $('body').css( 'user-select', 'auto' );
  }

  enterDrawerMode( viewport ) {
    $('.drawer-button').show();
    viewport.drawerMode = true;
    viewport.drawerOpen = true;
    viewport.onEnterDrawerMode();
  }

  leaveDrawerMode( viewport ) {
    $('.drawer-button').hide();
    viewport.drawerMode = false;
    viewport.onLeaveDrawerMode();
  }

  getDrawerViewport() {
    // favors the left side, if both could be open
    if(this.viewports['left'].drawerMode) {
      return this.viewports['left'];
    } else if( this.viewports['right'].drawerMode ) {
      return this.viewports['right'];
    } else {
      return null;
    }
  }

  openDrawer(drawer) {
    drawer.drawerOpen = true;
    var drawerIcon$ = $('.drawer-icon');
    drawerIcon$.addClass('fa-caret-left');
    drawerIcon$.removeClass('fa-caret-right');
    this.positionDivider();
  }

  closeDrawer(drawer) {
    this.dragging = false;
    drawer.drawerOpen = false;
    var drawerIcon$ = $('.drawer-icon');
    if( drawer.viewportName == 'left') {
      drawerIcon$.addClass('fa-caret-right');
      drawerIcon$.removeClass('fa-caret-left');
      this.splitPaneEl.style.gridTemplateColumns = `0px ${this.dividerWidth}px 1fr`;
    } else {
      this.splitPaneEl.style.gridTemplateColumns = `1fr ${this.dividerWidth}px 0px`;
    }
  }

  onDrawerButton() {
    var drawer = this.getDrawerViewport();

    if( drawer.drawerOpen ) {
      this.closeDrawer(drawer);
    } else {
      this.openDrawer(drawer);
    }
  }

  positionDivider() {
    var drawer = this.getDrawerViewport();

    if( drawer ) {
      if( drawer.viewportName == 'left') {
        this.splitPaneEl.style.gridTemplateColumns = `${drawer.drawerWidth}px ${this.dividerWidth}px 1fr`;
      } else {
        // right drawer
        this.splitPaneEl.style.gridTemplateColumns = `1fr ${this.dividerWidth}px ${drawer.drawerWidth}px`;
      }
    } else {
      // no drawers open, resize normally
      var left = this.splitFraction;
      var right = 1.0 - left;
      this.splitPaneEl.style.gridTemplateColumns = `${left}fr ${this.dividerWidth}px ${right}fr`;
    }
    this.fireResizeListeners();
  }

  render() {
    this.viewports['left'].render();
    this.viewports['right'].render();

    // bind to DOM
    this.splitPaneEl = $(`#${this.id}`).get(0);

    // if initial window size is too small, collapse left viewport
    if( window.innerWidth < this.minWindowSize) {
      this.enterDrawerMode(leftViewport);
      this.closeDrawer(leftViewport);
    } else {
      this.positionDivider();
    }

    // attach handlers to mouse events
    var $divider = $(`#${this.id} > .divider`);
    $divider.on('mousedown', this.onStartDrag.bind(this));
    $('.drawer-button').on('click', this.onDrawerButton.bind(this));
    $(window).on('mousemove', this.onDrag.bind(this));
    $(window).on('mouseup', this.onEndDrag.bind(this));
    $(window).on('resize', this.onResize.bind(this));
  }

}
