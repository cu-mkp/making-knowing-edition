import React, {
	Component
} from 'react';
import copyObject from '../lib/copyObject';
import SplitPaneViewport from './SplitPaneViewport';
import {
	connect
} from 'react-redux';
import * as navigationStateActions from '../actions/navigationStateActions';


class SplitPaneView extends Component {

	constructor(props) {
		super();
		this.firstFolio = props.document.folios[0];
		this.navigationStateActions = navigationStateActions;

		this.righPaneMinWidth = 200;

		this.splitFraction = 0.5;
		this.dividerWidth = 16;
		this.minWindowSize = 768;
		this.dragging = false;


		// event handlers
		this.onDrag = this.onDrag.bind(this);
		this.onResize = this.onResize.bind(this);
		this.onEndDrag = this.onEndDrag.bind(this);
		this.onDrawerButton = this.onDrawerButton.bind(this);

		this.refreshPanes(props);
	}

	onStartDrag = (e) => {
		let drawer = this.getDrawerViewport();
		if (drawer && drawer.drawerMode && !drawer.drawerOpen) {
			// if drawer is closed, do nothing
			return;
		}

		let style = copyObject(this.state.style);
		style.cursor = 'ew-resize';
		style.userSelect = 'none';
		this.setState({
			style: style
		});
		this.dragging = true;
	}


	onDrag = (e) => {
		if (this.dragging) {
			this.updateSizes(e.clientX);
		}
	}
	updateSizes(clientX) {

		// calculate the size of the left and right panes based on viewport width.
		let whole = window.innerWidth - this.dividerWidth;
		let leftViewport = copyObject(this.state.viewports['left']);
		let rightViewport = copyObject(this.state.viewports['right']);
		leftViewport.viewWidth = clientX - this.dividerWidth / 2;
		rightViewport.viewWidth = whole - leftViewport.viewWidth;

		// Actually make the updates
		if (rightViewport.viewWidth > this.righPaneMinWidth) {
			this.updateDrawerMode(leftViewport);
			this.updateDrawerMode(rightViewport);
			this.splitFraction = (whole === 0) ? 0.0 : leftViewport.viewWidth / whole;
			this.positionDivider();
		}
	}

	onResize = (e) => {
		this.positionDivider();
	}

	updateDrawerMode(viewport) {
		// check for exiting drawer mode
		if (viewport.drawerMode && viewport.drawerOpen && viewport.viewWidth > viewport.drawerWidth) {
			this.leaveDrawerMode(viewport);
			// check for entering drawer mode and don't shrink past drawer width
		} else if (!viewport.drawerMode && viewport.viewWidth <= viewport.drawerWidth) {
			this.enterDrawerMode(viewport);
		}

		this.updateViewport(viewport);
	}

	onEndDrag = (e) => {
		let style = copyObject(this.state.style);
		style.cursor = 'auto';
		style.userSelect = 'auto';
		this.setState({
			style: style
		});
		this.dragging = false;
	}

	enterDrawerMode(viewport) {
		this.props.dispatch(this.navigationStateActions.setDrawerMode(true));

		this.setState({
			drawerButtonVisible: true
		});

		// transition to grid mode if display a single image
		if (viewport.viewType === "ImageView") {
			viewport.viewType = "ImageGridView";
		}

		viewport.drawerMode = true;
		viewport.drawerOpen = true;
	}

	leaveDrawerMode(viewport) {
		this.props.dispatch(this.navigationStateActions.setDrawerMode(false));

		this.setState({
			drawerButtonVisible: false
		});
		viewport.drawerMode = false;
	}

	getDrawerViewport() {
		if(typeof this.state === 'undefined'){
			console.log("Missing state");
			return;
		}
		// favors the left side, if both could be open
		if (this.state.viewports['left'].drawerMode) {
			return copyObject(this.state.viewports['left']);
		} else if (this.state.viewports['right'].drawerMode) {
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

		this.setState(viewState);
	}

	openDrawer(drawer) {
		drawer.drawerOpen = true;

		this.setState({
			drawerIconClass: 'fa-caret-left'
		});
		this.positionDivider();
	}

	closeDrawer(drawer) {
		this.dragging = false;
		drawer.drawerOpen = false;
		let style = copyObject(this.state.style);

		if (drawer.viewportName === 'left') {
			style.gridTemplateColumns = `0px ${this.dividerWidth}px 1fr`;
			this.setState({
				drawerIconClass: 'fa-caret-right',
				style: style
			});
		} else {
			style.gridTemplateColumns = `1fr ${this.dividerWidth}px 0px`;
			this.setState({
				style: style
			});
		}
	}

	onDrawerButton = (e) => {
		let drawer = this.getDrawerViewport();

		if (drawer.drawerOpen) {
			this.closeDrawer(drawer);
		} else {
			this.openDrawer(drawer);
		}

		this.updateViewport(drawer);
	}

	positionDivider() {
		if(typeof this.state === 'undefined'){
			console.log("Missing state");
			return;
		}
		let drawer = this.getDrawerViewport();
		let style = copyObject(this.state.style);

		// no drawers open, resize normally
		var left = this.splitFraction;
		var right = 1.0 - left;
		if (drawer) {
			if (drawer.viewportName === 'left') {
				style.gridTemplateColumns = `${drawer.drawerWidth}px ${this.dividerWidth}px 1fr`;
			} else {
				// right drawer
				style.gridTemplateColumns = `1fr ${this.dividerWidth}px ${drawer.drawerWidth}px`;
			}
		} else {
			style.gridTemplateColumns = `${left}fr ${this.dividerWidth}px ${right}fr`;
		}

		this.setState({style: style});

		// Keep track of the sizes in the global state
		let left_px = Math.floor(Math.abs(window.innerWidth * left));
		let right_px = Math.floor(window.innerWidth * right);

		if(right_px !== this.props.navigationState.right.width){
			console.log((left_px + right_px) + ": " + left_px + " | " + right_px);
			this.props.dispatch(this.navigationStateActions.setwidths({right:right_px, left:left_px}));
		}

	}



	componentDidMount() {
		//this.positionDivider();
		window.addEventListener("mousemove", this.onDrag);
		window.addEventListener("mouseup", this.onEndDrag);
		window.addEventListener("resize", this.onResize);
	}

	componentWillUnmount() {
		window.removeEventListener("mousemove", this.onDrag);
		window.removeEventListener("mouseup", this.onEndDrag);
		window.removeEventListener("resize", this.onResize);
	}

	openFolio(side, folioID, viewType) {
		if(folioID.length <= 0){
			console.log("SplitPaneView: WARNING folioID undefined");
			return;
		}
		let viewport = copyObject(this.state.viewports[side]);
		viewport.document = this.props.document;
		viewport.folio = this.props.document.getFolio(folioID);
		viewport.viewType = viewType;
		this.updateViewport(viewport);
		this.positionDivider();
	}

	otherSide(side) {
		return (side === 'left') ? 'right' : 'left';
	}

	viewKey(viewport, side) {
		if (viewport.viewType === 'ImageGridView') {
			return `${side}-${viewport.viewType}`;
		} else {
			if(typeof viewport.folio !== 'undefined'){
				return `${side}-${viewport.viewType}-${viewport.folio.id}`;
			}else{
				return `${side}-${viewport.viewType}`;
			}
		}
	}

	componentWillReceiveProps(newProps){

		let newState = {
			style: {},
			drawerButtonVisible: false,
			drawerIconClass: 'fa-caret-left',
			viewports: {
				left: {
					viewType: newProps.navigationState.left.viewType,
					folio: this.firstFolio,
					viewportName: 'left',
					viewWidth: 0,
					drawerWidth: 200,
					drawerMode: false,
					drawerOpen: false
				},
				right: {
					viewType: newProps.navigationState.right.viewType,
					folio: this.firstFolio,
					viewportName: 'right',
					viewWidth: 0,
					drawerWidth: 0,
					drawerMode: false,
					drawerOpen: false
				}
			}
		};
		this.setState(newState);
		this.refreshPanes(newProps);
	}

	refreshPanes(props){
		// Update the panes as needed
		console.log("\nSplitPaneView: LEFT: "+props.navigationState['left'].viewType+" "+props.navigationState['left'].currentFolioID);
		console.log("SplitPaneView: RIGHT: "+props.navigationState['right'].viewType+" "+props.navigationState['right'].currentFolioID);

		this.openFolio('right', props.navigationState['right'].currentFolioID, props.navigationState['right'].viewType);
		this.openFolio('left', props.navigationState['left'].currentFolioID, props.navigationState['left'].viewType);
		this.positionDivider();
	}

	componentWillMount() {
		let newState = {
			style: {},
			drawerButtonVisible: false,
			drawerIconClass: 'fa-caret-left',
			viewports: {
				left: {
					viewType: this.props.navigationState["left"].viewType,
					folio: this.firstFolio,
					viewportName: 'left',
					viewWidth: 0,
					drawerWidth: 200,
					drawerMode: false,
					drawerOpen: false
				},
				right: {
					viewType: this.props.navigationState["right"].viewType,
					folio: this.firstFolio,
					viewportName: 'right',
					viewWidth: 0,
					drawerWidth: 0,
					drawerMode: false,
					drawerOpen: false
				}
			}
		};
		this.setState(newState);
	}

	render() {
		let drawerIconClass = `drawer-icon fas ${this.state.drawerIconClass} fa-2x`;
		let drawerButtonClass = this.state.drawerButtonVisible ? 'drawer-button' : 'drawer-button hidden';
		let leftViewport = this.state.viewports['left'];
		let rightViewport = this.state.viewports['right'];
		let style = copyObject(this.state.style);
		style.height = window.innerHeight - 60;

		console.log("\nSplitPaneView: INIT LEFT: "+this.props.navigationState['left'].viewType+" "+this.props.navigationState['left'].currentFolioID);
		console.log("SplitPaneView: INIT RIGHT: "+this.props.navigationState['right'].viewType+" "+this.props.navigationState['right'].currentFolioID);


		return ( <div className = "split-pane-view" style = {style} >
			<SplitPaneViewport 	side = 'left'
								key = {this.viewKey(leftViewport, 'left')}
								viewType={this.props.navigationState.left.viewType}
								folio={leftViewport.folio}
								document = {this.props.document}
								viewWidth = {leftViewport.viewWidth}
								viewHeight = {style.height}
								drawerMode = {leftViewport.drawerMode}
								drawerOpen = {leftViewport.drawerOpen}
								splitPaneView = {this}/>
			<div className = "divider" onMouseDown = {this.onStartDrag}>
				<div className = {drawerButtonClass} onClick = {this.onDrawerButton} >
					<i className = {drawerIconClass} > </i>
				</div>
			</div>
			<SplitPaneViewport side = 'right'
								key = {this.viewKey(rightViewport, 'right')}
								viewType={this.props.navigationState.right.viewType}
								folio = {rightViewport.folio}
								document = {this.props.document}
								viewWidth = {rightViewport.viewWidth}
								viewHeight = {style.height}
								drawerMode = {rightViewport.drawerMode}
								drawerOpen = {rightViewport.drawerOpen}
								splitPaneView = {this}/>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		navigationState: state.navigationState
	};
}
export default connect(mapStateToProps)(SplitPaneView);
