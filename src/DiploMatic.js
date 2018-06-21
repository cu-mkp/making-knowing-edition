import React, {Component} from 'react';
import {connect} from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import DocumentView from './view/DocumentView';
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { HashRouter, Route } from 'react-router-dom'


class DiploMatic extends Component {

	renderHeader() {
		return (
			<div id="header">
				<div className="title">The Making and Knowing Project <span className='warning'>(BETA)</span></div>
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
					<div id="search">
						<form id="search" action="" method="post">
							<input className="searchBox" placeholder="Search"/>
							<input type="submit" id="submitButton" className="hidden"/>
						</form>
					</div>
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
				<HashRouter>
					<Route path="/:filter?" component={DocumentView}/>
				</HashRouter>
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
					<div className="DiploMatic">
						{ this.renderHeader() }
						{ this.renderContent() }
						{ this.renderFooter() }
						<div id="glossaryPopup" tabIndex="1"></div>
					</div>
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
