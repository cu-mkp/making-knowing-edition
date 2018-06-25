import React, {Component} from 'react';
import { Provider, connect } from 'react-redux'
import { HashRouter, Route, Switch, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import DocumentView from './view/DocumentView';
import ContentView from './view/ContentView';
import Search from './Search';

class DiploMatic extends Component {

	// TODO: move spinner code to a spinner component.
	renderSpinner() {
		return (
			<div id="loadingStateModal">
				<div class="spinner">
					<div class="bounce1"></div>
					<div class="bounce2"></div>
					<div class="bounce3"></div>
				</div>
			</div>
		);
	}

	loadingModal_start(){
		// Cancel any pending stops
		if(window.spinnerTimer){
			clearTimeout(window.spinnerTimer);
			window.spinnerTimer = 0;
		}
		// Make sure loading is visible
		// $("#loadingStateModal").fadeIn("fast");
	}
	
	// Stop the spinner
	loadingModal_stop(){
		// Request a stop
		window.spinnerTimer = setTimeout(function(){
				// $("#loadingStateModal").fadeOut("fast");
		}, 200);
	}
	
	renderHeader() {
		return (
			<div id="header">
				<div className="title"><Link to='/' className='home-link'>The Making and Knowing Project</Link> <span className='warning'>(BETA)</span></div>
				<div className="compactTitle">M&amp;K</div>
				<div className="tagline">Intersections of Craft Making and Scientific Knowing</div>
				<div id="globalNavigation">
					<div className="expandedViewOnly">
						<span>BnF Ms. Fr. 640<span className="fa fa-caret-down"></span></span>
						<span>Lab<span className="fa fa-caret-down"></span></span>
						<span>Press</span>
						<span>About<span className="fa fa-caret-down"></span></span>
						<span>Support</span>
					</div>
					<Search/>
					<div className="expandedViewOnly">
						<span><span className="english">English</span> | <span className="francais">Français</span></span>
					</div>
				</div>
			</div>
		);
	}

	renderContent() {
		return (
			<div id="content">
				<Switch>
					<Route path="/" component={ContentView} exact/>
					<Route path="/folios" component={DocumentView}/>
				</Switch>
			</div>
		);
	}

	renderFooter() {
		return (
			<div id="footer">
				<div className="copyright">&copy; The Making and Knowing Project - <span className='warning'>Please note: This is site is still being developed and not yet ready for scholarly use.</span></div>
				<div className="logos">
					<img alt="Columbia Logo" src="img/logo_columbia.png"/>
					<img alt="Center Logo" src="img/logo_center.png"/>
				</div>
			</div>
		);
	}

	render() {
		return (
			<Provider store={this.props.store}>
				<MuiThemeProvider>
					<HashRouter>
						<div id="diplomatic">
							{ this.renderHeader() }
							{ this.renderContent() }
							{ this.renderFooter() }
							<div id="glossaryPopup" tabIndex="1"></div>
						</div>	
					</HashRouter>
				</MuiThemeProvider>
			</Provider>
		);
	}
}

DiploMatic.propTypes = {
	store: PropTypes.object.isRequired
}

function mapStateToProps(state) {
	return {
		navigationState: state.navigationState
	};
}

export default connect(mapStateToProps)(DiploMatic);
