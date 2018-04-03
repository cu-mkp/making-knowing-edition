import React, {Component} from 'react';
import copyObject from '../lib/copyObject';
import SplitPaneViewport from './SplitPaneViewport';
import {connect} from 'react-redux';
import * as navigationStateActions from '../actions/navigationStateActions';


class SplitPaneView extends Component {

	constructor(props) {
		super();
		this.firstFolio = props.document.folios[0];
		this.navigationStateActions = navigationStateActions;

		// Initialize the splitter
		this.rightPaneMinWidth = 200;
		this.leftPaneMinWidth = 200;
		this.splitFraction = 0.5;
		this.dividerWidth = 16;
		this.state={
			style:{
				gridTemplateColumns:`0.5fr ${this.dividerWidth}px 0.5fr`
			}
		};

		// event handlers
		this.dragging = false;
		this.onDrag = this.onDrag.bind(this);
		this.onResize = this.onResize.bind(this);
		this.onEndDrag = this.onEndDrag.bind(this);


		// Update the pane content
		this.refreshPanes(props);
	}

	// On drag, update the UI continuously
	onDrag = (e) => {
		if (this.dragging) {
			let whole = window.innerWidth - this.dividerWidth;
			let left_viewWidth = e.clientX - this.dividerWidth / 2;
			let right_viewWidth = whole - left_viewWidth;

			// Update as long as we're within limits
			if(left_viewWidth > this.leftPaneMinWidth &&
			   right_viewWidth > this.rightPaneMinWidth){
				   this.splitFraction = (whole === 0) ? 0.0 : left_viewWidth / whole;
				   this.updateUI();
			}
		}
	}

	// Drag start: mark it
	onStartDrag = (e) => {
		this.dragging = true
	}

	// Drag end: Record the size in the global state
	onEndDrag = (e) => {
		let left_px = Math.floor(Math.abs(window.innerWidth * this.splitFraction));
		let right_px = Math.floor(window.innerWidth * (1.0 - this.splitFraction));
		if(right_px !== this.props.navigationState.right.width && (left_px>=this.leftPaneMinWidth)){
			this.props.dispatch(this.navigationStateActions.setwidths({right:right_px, left:left_px}));
		}
		this.dragging = false;
		//console.log("END DRAG:"+(left_px + right_px) + ": " + left_px + " | " + right_px);
	}

	// On window resize
	onResize = (e) => {}

	// Update the screen with the new split info
	updateUI() {
		var left = this.splitFraction;
		var right = 1.0 - left;
		this.setState( {
			...this.state,
			style:{
				...this.state.style,
				gridTemplateColumns:`${left}fr ${this.dividerWidth}px ${right}fr`
			}
		});
	}

	// Update the panes content
	refreshPanes(props){
		//console.log("\nSplitPaneView: LEFT: "+props.navigationState['left'].viewType+" "+props.navigationState['left'].currentFolioID);
		//console.log("SplitPaneView: RIGHT: "+props.navigationState['right'].viewType+" "+props.navigationState['right'].currentFolioID);
		this.openFolio('right', props.navigationState['right'].currentFolioID, props.navigationState['right'].viewType);
		this.openFolio('left', props.navigationState['left'].currentFolioID, props.navigationState['left'].viewType);
	}

	openFolio(side, folioID, viewType) {
		if(folioID.length <= 0){return;}
		let viewport = copyObject(this.state.viewports[side]);
		viewport.document = this.props.document;
		viewport.folio = this.props.document.getFolio(folioID);
		viewport.viewType = viewType;
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


	componentDidMount() {
		window.addEventListener("mousemove", this.onDrag);
		window.addEventListener("mouseup", this.onEndDrag);
		window.addEventListener("resize", this.onResize);
	}

	componentWillUnmount() {
		window.removeEventListener("mousemove", this.onDrag);
		window.removeEventListener("mouseup", this.onEndDrag);
		window.removeEventListener("resize", this.onResize);
	}
	componentWillReceiveProps(newProps){
		this.setState( {
			...this.state,
			drawerButtonVisible: false,
			drawerIconClass: 'fa-caret-left',
			viewports: {
				left: {
					viewType: newProps.navigationState["left"].viewType,
					folio: this.firstFolio,
					viewportName: 'left',
					viewWidth: 0,
					drawerWidth: 200,
					drawerMode: false,
					drawerOpen: false
				},
				right: {
					viewType: newProps.navigationState["right"].viewType,
					folio: this.firstFolio,
					viewportName: 'right',
					viewWidth: 0,
					drawerWidth: 0,
					drawerMode: false,
					drawerOpen: false
				}
			}
		});

		if( newProps.navigationState['left'].currentFolioID !==this.props.navigationState['left'].currentFolioID ||
			newProps.navigationState['right'].currentFolioID!==this.props.navigationState['right'].currentFolioID){
				this.refreshPanes(newProps);
		}
	}

	componentWillMount() {
		this.updateUI();
		this.setState( {
			...this.state,
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
		});

	}

	render() {
		let drawerIconClass = `drawer-icon fas ${this.state.drawerIconClass} fa-2x`;
		let drawerButtonClass = this.state.drawerButtonVisible ? 'drawer-button' : 'drawer-button hidden';
		let leftViewport = this.state.viewports['left'];
		let rightViewport = this.state.viewports['right'];
		return (
			<div className = "split-pane-view" style = {this.state.style} >
				<SplitPaneViewport 	history={this.props.history}
									side = 'left'
									key = {this.viewKey(leftViewport, 'left')}
									viewType={this.props.navigationState.left.viewType}
									document = {this.props.document}
									viewWidth = {leftViewport.viewWidth}
									drawerMode = {leftViewport.drawerMode}
									drawerOpen = {leftViewport.drawerOpen}
									splitPaneView = {this}/>
				<div className = "divider" onMouseDown = {this.onStartDrag}>
					<div className = {drawerButtonClass} onClick = {this.onDrawerButton} >
						<i className = {drawerIconClass} > </i>
					</div>
				</div>
				<SplitPaneViewport  history={this.props.history}
									side = 'right'
									key = {this.viewKey(rightViewport, 'right')}
									viewType={this.props.navigationState.right.viewType}
									document = {this.props.document}
									viewWidth = {rightViewport.viewWidth}
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
