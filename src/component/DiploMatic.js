import React, {Component} from 'react';
import { Provider, connect } from 'react-redux'
import { HashRouter, Route, Switch, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import DocumentView from './DocumentView';
import ContentView from './ContentView';
import AnnotationView from './AnnotationView';
import EntryListView from './EntryListView';
import AnnotationListView from './AnnotationListView';
import Search from './Search';
import RouteListener from './RouteListener';

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
	
	renderHeader(fixedFrameModeClass) {
		return (
			<div id="header" className={fixedFrameModeClass}>
				<div className="title"><Link to='/' className='home-link'>BnF Ms. Fr. 640</Link> <span className='warning'>(BETA)</span></div>
				<div className="compactTitle">M&amp;K</div>
				<div className="tagline">A Digital Critical Edition</div>
				<div id="globalNavigation">
					{ this.renderNavLinks() }
					<Search/>
					<div className="expandedViewOnly">
						<span><span className="english">English</span> | <span className="francais">Français</span></span>
					</div>
				</div>
			</div>
		);
	}

	renderNavLinks() {
		if( process.env.REACT_APP_HIDE_IN_PROGRESS_FEATURES === 'true') {
			return (
				<div className="expandedViewOnly">
					<span>Annotations</span>
					<span>Entries</span>
					<Link to='/folios'>Folios</Link>
					<span>About</span>
				</div>
			);
		} else {
			return (
				<div className="expandedViewOnly">
					<Link to='/annotations'>Annotations</Link>
					<Link to='/entries'>Entries</Link>
					<Link to='/folios'>Folios</Link>
					<span>About</span>
				</div>
			);
		}
	}

	renderContent() {
		return (
			<div id="content">
				<Switch>
					<Route path="/" component={ContentView} exact/>
					<Route path="/entries" component={EntryListView}/>
					<Route path="/annotations" component={AnnotationListView} exact/>
					<Route path="/annotations/:annoID" component={AnnotationView}/>
					<Route path="/folios" component={DocumentView}/>
					<Route path="/search" component={DocumentView}/>
				</Switch>
			</div>
		);
	}

	renderFooter(fixedFrameModeClass) {
		return (
			<div id="footer" className={fixedFrameModeClass}>
				<div className="copyright">&copy; The Making and Knowing Project - <span className='warning'>Please note: This is site is still being developed and not yet ready for scholarly use.</span></div>
				<div className="logos">
					<img alt="Columbia Logo" src="img/logo_columbia.png"/>
					<img alt="Center Logo" src="img/logo_center.png"/>
				</div>
			</div>
		);
	}

	render() {
		let fixedFrameModeClass = this.props.diplomatic.fixedFrameMode ? 'fixed' : '';

		return (
			<Provider store={this.props.store}>
				<MuiThemeProvider>
					<HashRouter>
						<div id="diplomatic" className={fixedFrameModeClass}>
							<RouteListener/>
							{ this.renderHeader(fixedFrameModeClass) }
							{ this.renderContent() }
							{ this.renderFooter(fixedFrameModeClass) }
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
		diplomatic: state.diplomatic,
		documentView: state.documentView
	};
}

export default connect(mapStateToProps)(DiploMatic);
