import React, { Component } from 'react';
import copyObject from './copyObject';

import './css/SplitPaneView.css';

import SplitPaneViewport from './SplitPaneViewport';


class SplitPaneView extends Component {

  constructor() {
    super();

    this.splitFraction = 0.5;
    this.dividerWidth = 32;
    this.minWindowSize = 768;
    this.dragging = false;

    this.viewports = {
      left: {
        viewportName: 'left',
        viewType: 'ImageGridView',
        drawerWidth: 200,
        drawerMode: false,
        drawerOpen: false
      },
      right: {
        viewportName: 'right',
        viewType: 'TranscriptionView',
        drawerWidth: 0,
        drawerMode: false,
        drawerOpen: false
      }
    };

    this.state = {
      drawerButtonVisible: false,
      drawerIconClass: 'fa-caret-left',
      leftViewWidth: 0,
      rightViewWidth: 0,
      style: {}
    };

    // event handlers
    this.onDrag = this.onDrag.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onEndDrag = this.onEndDrag.bind(this);
    this.onDrawerButton = this.onDrawerButton.bind(this);
  }

  onStartDrag = (e) =>  {
    let drawer = this.getDrawerViewport();
    if( drawer && drawer.drawerMode && !drawer.drawerOpen ) {
      // if drawer is closed, do nothing
      return;
    }

    let style = copyObject( this.state.style );
    style.cursor = 'ew-resize';
    style.userSelect = 'none';
    this.setState({ style: style });
    this.dragging = true;
  }

  onDrag = (e) =>  {
    if( this.dragging ) {
      // calculate the size of the left and right panes based on viewport width.
      let whole = window.innerWidth - this.dividerWidth;
      let left = e.clientX - this.dividerWidth/2;
      let right = whole - left;

      this.updateDrawerMode(this.viewports['left'], left);
      this.updateDrawerMode(this.viewports['right'], right);

      this.setState({
        leftViewWidth: left,
        rightViewWidth: right
      });

      this.splitFraction = (whole === 0) ? 0.0 : left / whole;
      this.positionDivider();
    }
  }

  onResize = (e) => {
    let leftViewport = this.viewports['left'];
    let rightViewport = this.viewports['right'];
    let left = this.state.leftViewWidth;
    let right = this.state.rightViewWidth;

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

  onEndDrag = (e) => {
    let style = copyObject( this.state.style );
    style.cursor = 'auto';
    style.userSelect = 'auto';
    this.setState( { style: style });
    this.dragging = false;
  }

  enterDrawerMode( viewport ) {
    this.setState( { drawerButtonVisible: true } );
    viewport.drawerMode = true;
    viewport.drawerOpen = true;
  }

  leaveDrawerMode( viewport ) {
    this.setState( { drawerButtonVisible: false } );
    viewport.drawerMode = false;
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

    this.setState( { drawerIconClass: 'fa-caret-left' } );
    this.positionDivider();
  }

  closeDrawer(drawer) {
    this.dragging = false;
    drawer.drawerOpen = false;
    let style = copyObject( this.state.style );

    if( drawer.viewportName === 'left') {
      style.gridTemplateColumns = `0px ${this.dividerWidth}px 1fr`;
      this.setState( { drawerIconClass: 'fa-caret-right', style: style } );
    } else {
      style.gridTemplateColumns = `1fr ${this.dividerWidth}px 0px`;
      this.setState( { style: style } );
    }
  }

  onDrawerButton = (e) =>  {
    let drawer = this.getDrawerViewport();

    if( drawer.drawerOpen ) {
      this.closeDrawer(drawer);
    } else {
      this.openDrawer(drawer);
    }
  }

  positionDivider() {
    let drawer = this.getDrawerViewport();
    let style = copyObject( this.state.style );

    if( drawer ) {
      if( drawer.viewportName === 'left') {
        style.gridTemplateColumns = `${drawer.drawerWidth}px ${this.dividerWidth}px 1fr`;
      } else {
        // right drawer
        style.gridTemplateColumns = `1fr ${this.dividerWidth}px ${drawer.drawerWidth}px`;
      }
    } else {
      // no drawers open, resize normally
      var left = this.splitFraction;
      var right = 1.0 - left;
      style.gridTemplateColumns = `${left}fr ${this.dividerWidth}px ${right}fr`;
    }

    this.setState({ style: style });
  }

  componentDidMount() {
    // if initial window size is too small, collapse left viewport
    if( window.innerWidth < this.minWindowSize) {
      let leftViewport = this.viewports['left'];
      this.enterDrawerMode(leftViewport);
      this.closeDrawer(leftViewport);
    } else {
      this.positionDivider();
    }

    window.addEventListener("mousemove", this.onDrag);
    window.addEventListener("mouseup", this.onEndDrag);
    window.addEventListener("resize", this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.onDrag);
    window.removeEventListener("mouseup", this.onEndDrag);
    window.removeEventListener("resize", this.onResize);
  }

  render() {

    let drawerIconClass = `drawer-icon fas ${this.state.drawerIconClass} fa-2x`;
    let drawerButtonClass = this.state.drawerButtonVisible ? 'drawer-button' : 'drawer-button hidden';

    return (
      <div className="split-pane-view" style={this.state.style} >
        <SplitPaneViewport
          viewType={this.viewports['left'].viewType}
          viewWidth={this.viewports['left'].viewWidth}
          drawerMode={this.viewports['left'].drawerMode}
          drawerOpen={this.viewports['left'].drawerOpen}
        />
        <div className="divider" onMouseDown={this.onStartDrag} >
          <div className={drawerButtonClass} onClick={this.onDrawerButton} >
            <i className={drawerIconClass}></i>
          </div>
        </div>
        <SplitPaneViewport
          viewType={this.viewports['right'].viewType}
          viewWidth={this.viewports['right'].viewWidth}
          drawerMode={this.viewports['right'].drawerMode}
          drawerOpen={this.viewports['right'].drawerOpen}
        />
      </div>
    );
  }
}

export default SplitPaneView;
