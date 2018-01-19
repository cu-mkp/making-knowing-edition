import React, { Component } from 'react';
import copyObject from '../lib/copyObject';
import './css/SplitPaneView.css';
import SplitPaneViewport from './SplitPaneViewport';


class SplitPaneView extends Component {

  constructor(props) {
    super();

    this.splitFraction = 0.5;
    this.dividerWidth = 32;
    this.minWindowSize = 768;
    this.dragging = false;

    this.state = {
      style: {},
      drawerButtonVisible: false,
      drawerIconClass: 'fa-caret-left',
      viewports: {
        left: {
          viewportName: 'left',
          viewWidth: 0,
          drawerWidth: 200,
          drawerMode: false,
          drawerOpen: false
        },
        right: {
          viewportName: 'right',
          viewWidth: 0,
          drawerWidth: 0,
          drawerMode: false,
          drawerOpen: false
        }
      }
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
      let leftViewport = copyObject(this.state.viewports['left']);
      let rightViewport = copyObject(this.state.viewports['right']);
      leftViewport.viewWidth = e.clientX - this.dividerWidth/2;
      rightViewport.viewWidth =  whole - leftViewport.viewWidth;

      this.updateDrawerMode(leftViewport);
      this.updateDrawerMode(rightViewport);

      this.splitFraction = (whole === 0) ? 0.0 : leftViewport.viewWidth / whole;
      this.positionDivider();
    }
  }

  onResize = (e) => {
    let leftViewport = copyObject(this.state.viewports['left']);
    let rightViewport = copyObject(this.state.viewports['right']);

    // close left viewport
    if( leftViewport.drawerOpen || !leftViewport.drawerMode ) {
      // if the window gets too small, collapse the left viewport
      if( window.innerWidth < this.minWindowSize ) {
        this.enterDrawerMode(leftViewport);
        this.closeDrawer(leftViewport);
        this.updateViewport(leftViewport);
      } else {
        this.updateDrawerMode(leftViewport);
        this.updateDrawerMode(rightViewport);
        this.positionDivider();
      }
    }

  }

  updateDrawerMode( viewport ) {
    // check for exiting drawer mode
    if( viewport.drawerMode && viewport.drawerOpen && viewport.viewWidth > viewport.drawerWidth ) {
        this.leaveDrawerMode(viewport);
    // check for entering drawer mode and don't shrink past drawer width
    } else if( !viewport.drawerMode && viewport.viewWidth <= viewport.drawerWidth ) {
        this.enterDrawerMode(viewport);
    }

    this.updateViewport(viewport);
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
    if(this.state.viewports['left'].drawerMode) {
      return copyObject(this.state.viewports['left']);
    } else if( this.state.viewports['right'].drawerMode ) {
      return copyObject(this.state.viewports['right']);
    } else {
      return null;
    }
  }

  updateViewport(viewport) {
    var viewState = {
      viewports: this.state.viewports
    };

    viewState.viewports[viewport.viewportName] = viewport;

    this.setState( viewState );
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

    this.updateViewport(drawer);
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
      let leftViewport = copyObject(this.viewports['left']);
      this.enterDrawerMode(leftViewport);
      this.closeDrawer(leftViewport);
      this.updateViewport(leftViewport);
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
    let leftViewport = this.state.viewports['left'];
    let rightViewport = this.state.viewports['right'];

    return (
      <div className="split-pane-view" style={this.state.style} >
        <SplitPaneViewport
          initialViewType={this.props.leftViewType}
          initialFolio={this.props.leftFolio}
          document={this.props.document}
          viewWidth={leftViewport.viewWidth}
          drawerMode={leftViewport.drawerMode}
          drawerOpen={leftViewport.drawerOpen}
        />
        <div className="divider" onMouseDown={this.onStartDrag} >
          <div className={drawerButtonClass} onClick={this.onDrawerButton} >
            <i className={drawerIconClass}></i>
          </div>
        </div>
        <SplitPaneViewport
          initialViewType={this.props.rightViewType}
          initialFolio={this.props.rightFolio}
          document={this.props.document}
          viewWidth={rightViewport.viewWidth}
          drawerMode={rightViewport.drawerMode}
          drawerOpen={rightViewport.drawerOpen}
        />
      </div>
    );
  }
}

export default SplitPaneView;
