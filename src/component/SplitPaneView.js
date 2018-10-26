import React, {Component} from 'react';
import {connect} from 'react-redux';

class SplitPaneView extends Component {

	constructor(props) {
		super();
		this.firstFolio = props.document.folios[0];

		// Initialize the splitter
		this.rightPaneMinWidth = 200;
		this.leftPaneMinWidth = 200;
		this.leftPaneMinWidth_inSearchMode = 400;
		this.splitFraction = 0.5;
		this.dividerWidth = 16;
		let whole = window.innerWidth;
		let leftW=whole/2;

		let split_left=(leftW/whole);
		let split_right=1-split_left;
		this.state={
			style:{
				gridTemplateColumns:`${split_left}fr ${this.dividerWidth}px ${split_right}fr`
			},
			leftWidth: leftW,
			rightWidth: leftW
		};

		// event handlers
		this.dragging = false;
		this.onDrag = this.onDrag.bind(this);
		this.onResize = this.onResize.bind(this);
		this.onEndDrag = this.onEndDrag.bind(this);
		this.updatePaneSize = this.updatePaneSize.bind(this);
		this.updatePaneSize = this.updatePaneSize.bind(this);
	}

	// On drag, update the UI continuously
	onDrag = (e) => {
		if (this.dragging) {
			let whole = window.innerWidth - this.dividerWidth;
			let left_viewWidth = e.clientX - this.dividerWidth / 2;
			let right_viewWidth = whole - left_viewWidth;

			// Update as long as we're within limits
			let leftLimit = (this.props.inSearchMode)?this.leftPaneMinWidth_inSearchMode:this.leftPaneMinWidth;
			console.log(leftLimit);
			if(left_viewWidth > leftLimit &&
			   right_viewWidth > this.rightPaneMinWidth){
				   this.splitFraction = (whole === 0) ? 0.0 : left_viewWidth / whole;
				   this.updateUI();
			}

			this.updatePaneSize();
		}
	}

	// Drag start: mark it
	onStartDrag = (e) => {
		this.dragging = true
	}

	// Drag end
	onEndDrag = (e) => {
		this.dragging = false;
	}

	// On window resize
	onResize = (e) => {
		this.updatePaneSize();
	}

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

	// Update the sizes of the panes
	updatePaneSize(){
		// Record state change
		let left_px = Math.floor(Math.abs(window.innerWidth * this.splitFraction));
		let right_px = Math.floor(window.innerWidth * (1.0 - this.splitFraction));
		if(right_px !== this.state.rightWidth && (left_px>=this.leftPaneMinWidth)){
			this.setState( { 
				...this.state, 
				leftWidth: left_px,
				rightWidth: right_px
			})
		}
	}

	componentDidMount() {
		window.addEventListener("mousemove", this.onDrag);
		window.addEventListener("mouseup", this.onEndDrag);
		window.addEventListener("resize", this.onResize);

		// Set the default width on mount
		let left_px = Math.floor(Math.abs(window.innerWidth * this.splitFraction));
		let right_px = Math.floor(window.innerWidth * (1.0 - this.splitFraction));
		this.setState( { 
			...this.state, 
			leftWidth: left_px,
			rightWidth: right_px
		})
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
					folio: this.firstFolio,
					viewportName: 'left',
					viewWidth: 0,
					drawerWidth: 200,
					drawerMode: false,
					drawerOpen: false
				},
				right: {
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

	componentWillMount() {
		this.updateUI();
		this.setState( {
			...this.state,
			drawerButtonVisible: false,
			drawerIconClass: 'fa-caret-left',
			viewports: {
				left: {
					folio: this.firstFolio,
					viewportName: 'left',
					viewWidth: 0,
					drawerWidth: 200,
					drawerMode: false,
					drawerOpen: false
				},
				right: {
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

	renderDivider() {
		let drawerIconClass = `drawer-icon fas ${this.state.drawerIconClass} fa-2x`;
		let drawerButtonClass = this.state.drawerButtonVisible ? 'drawer-button' : 'drawer-button hidden';

		return (
			<div className = "divider" onMouseDown = {this.onStartDrag}>
				<div className = {drawerButtonClass} onClick = {this.onDrawerButton} >
					<i className = {drawerIconClass} > </i>
				</div>
			</div>
		);
	}

	render() {
		return (
			<div className = "split-pane-view" style = {this.state.style} >
				{ this.props.leftPane }
				{ this.renderDivider() }
				{ this.props.rightPane }
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		document: state.document
	};
}
export default connect(mapStateToProps)(SplitPaneView);
