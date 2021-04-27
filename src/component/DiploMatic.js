import { Collapse, IconButton, Paper } from '@material-ui/core';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import CloseIcon from '@material-ui/icons/Close';
import { createBrowserHistory } from 'history';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect, Provider } from 'react-redux';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { dispatchAction } from '../model/ReduxStore';
import AnnotationView from './AnnotationView';
import AnnotationListView from './annotation_list_view/AnnotationListView';
import ContentView from './ContentView';
import DocumentView from './DocumentView';
import EntryListView from './EntryListView';
import MainMenu from './MainMenu';
import MobileMenu from './MobileMenu';
import RouteListener from './RouteListener';
import Search from './Search';
import SearchView from './SearchView';
import ByIcon from '../icons/ByIcon'
import CcIcon from '../icons/CcIcon'
import NcIcon from '../icons/NcIcon'
import SaIcon from '../icons/SaIcon'

class DiploMatic extends Component {

	constructor(props) {
		super(props);
		this.state = { 
			searchOpen: false,
			mobileMenuOpen: false,
		};
	}

	componentWillMount() {
		const { googleAnalyticsTrackingID } = this.props.diplomatic

		if( googleAnalyticsTrackingID ) {
			ReactGA.initialize(googleAnalyticsTrackingID);

			const history = createBrowserHistory()
			history.listen((location) => {
				const page = location.hash.slice(1)
				ReactGA.set({ page });
				ReactGA.pageview(page)
				// console.log('GA: '+page)
				window.scrollTo(0, 0);
			})	
		} else {
			const history = createBrowserHistory()
			history.listen(() => {
				window.scrollTo(0, 0);
			})	
			console.log('Google Analytics is not enabled.')
		}

		console.log(`build: ${process.env.REACT_APP_BUILD_ID}`)
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
		const handleToggleSearchBar = () => this.setState({searchOpen: !this.state.searchOpen, mobileMenuOpen: false});
		const handleToggleMobileMenu = () => this.setState({mobileMenuOpen: !this.state.mobileMenuOpen, searchOpen: false});
		return (
			<div className={`${fixedFrameModeClass} header-wrapper`} >
				<Paper id="header" className={`flex-parent jc-space-btw ai-center`} >
					<MainMenu
						onToggleSearch={handleToggleSearchBar}
						onToggleMobileMenu={handleToggleMobileMenu}
						isMobileMenuOpen={this.state.mobileMenuOpen}
					/>
				</Paper>
				<div style={{position: 'relative', width: '100%'}}>
					<Collapse
						in={this.state.searchOpen}
					>
						<Paper elevation={24} className={`search-bar maroon-dropdown flex-parent ai-center jc-center`} >
							<div className='flex-parent wrap jc-space-around content'>
								<h4 className='label' >Search the Edition</h4>
								<img style={{width: 50, marginBottom: 5}} src='/img/lizard-no-bg.png'/>
								<Search toggleSearchBar={handleToggleSearchBar} />
								<IconButton
									onClick={handleToggleSearchBar}
									style={{position: 'absolute', right: 10, top: 10}}
								>
									<CloseIcon style={{color: 'white'}} />
								</IconButton>
							</div>
						</Paper> 
					</Collapse>
					<Collapse
						in={this.state.mobileMenuOpen}
					>
						<Paper elevation={24} className={`maroon-dropdown mobile-menu flex-parent ai-center jc-center`} >
							<div className=''>
								<MobileMenu 
									onToggleMobileMenu={handleToggleMobileMenu}
								/>
								<IconButton
									onClick={handleToggleMobileMenu}
									style={{position: 'absolute', right: 10, top: 10}}
								>
									<CloseIcon style={{color: 'white'}} />
								</IconButton>
							</div>
						</Paper> 
					</Collapse>
				</div>
			</div>
		);
	}

	renderDocumentView = (props) => {
		const { folioID, transcriptionType, folioID2, transcriptionType2 } = props.match.params;
		let viewports;

		if( !folioID ) {
			// route /folios
			viewports = {
				left: {
					folioID: '-1',
					transcriptionType: 'g'
				},
				right: {
					folioID: (isWidthUp('md', this.props.width)) ? '-1' : '1r',
					transcriptionType: 'tc'
				}
			}
		} else {
			let leftFolioID = folioID;
			let leftTranscriptionType, rightFolioID, rightTranscriptionType;
			if( folioID2 ) {
				// route /folios/:folioID/:transcriptionType/:folioID2/:transcriptionType2
				leftTranscriptionType = transcriptionType;
				rightFolioID = folioID2;
				rightTranscriptionType = transcriptionType2 ? transcriptionType2 : 'tc'
			} else {
				// route /folios/:folioID
				// route /folios/:folioID/:transcriptionType
				leftTranscriptionType = 'f';
				rightFolioID = folioID;
				rightTranscriptionType = transcriptionType ? transcriptionType : 'tc';
			}

			viewports = {
				left: {
					folioID: leftFolioID,
					transcriptionType: leftTranscriptionType
				},
				right: {
					folioID: rightFolioID,
					transcriptionType: rightTranscriptionType
				}	
			}	
		}
	
		return (
			<DocumentView viewports={viewports} history={props.history}></DocumentView>
		);
	}

	renderSearchView(props) {
		const { folioID, transcriptionType, annotationID } = props.match.params;

		return (
			<SearchView 
				history={props.history}
				folioID={folioID}
				transcriptionType={transcriptionType}
				annotationID={annotationID}
			>
			</SearchView>
		);
	}

	renderAnnotationView(props) {
		return (
			<AnnotationView annoID={props.match.params.annoID}></AnnotationView>
		);
	}

	renderIndexPage(props) {
		return (
			<ContentView history={props.history} contentID='index'></ContentView>
		);
	}

	renderContentView(props) {
		const contentID = props.location.pathname.substring("/content/".length)
		return (
			<ContentView contentID={contentID}></ContentView>
		);
	}

	renderContent() {
		return (
			<div id="content">
				<Switch>
					<Route path="/" render={this.renderIndexPage} exact/>
					<Route path="/content" render={this.renderContentView}/>
					<Route path="/entries" component={EntryListView}/>
					<Route path="/essays" component={AnnotationListView} exact/>
					<Route path="/essays/:annoID" render={this.renderAnnotationView}/>
					<Route path="/folios/:folioID/:transcriptionType/:folioID2/:transcriptionType2" render={this.renderDocumentView} exact/>
					<Route path="/folios/:folioID/:transcriptionType" render={this.renderDocumentView} exact/>
					<Route path="/folios/:folioID" render={this.renderDocumentView} exact/>
					<Route path="/folios" render={this.renderDocumentView} exact/>
					<Route path="/search/annotation/:annotationID" render={this.renderSearchView} exact/> 
					<Route path="/search/folio/:folioID/:transcriptionType" render={this.renderSearchView} exact/> 
					<Route path="/search" component={this.renderSearchView}/>
				</Switch>
			</div>
		);
	}

	renderFooter(fixedFrameModeClass) {
		return (
			<div id="footer" className={fixedFrameModeClass}>
				<div className="copyright flex-parent wrap jc-space-btw">
					<div>
					<p><a className='symbols' target="_blank" href='https://creativecommons.org/licenses/by-nc-sa/4.0/'><CcIcon/> <ByIcon/> <NcIcon/> <SaIcon/></a> Making and Knowing Project.</p>
					<p>Licenced under <a target="_blank" href='https://creativecommons.org/licenses/by-nc-sa/4.0/'>CC BY-NC-SA 4.0</a></p>
					</div>
					<p>DOI: <a target="_blank" href="https://doi.org/10.7916/78yt-2v41">https://doi.org/10.7916/78yt-2v41</a></p>
				</div>
				<div className='flex-parent wrap jc-space-btw'>
					<div className="logos">
						<img style={{marginBottom: 14, marginRight: 10}} alt="Columbia Logo" src="img/logo_columbia.png"/>
						<img alt="Center Logo" src="img/logo_center_multi_line.png"/>
					</div>
					<div className="footer-links">
						<a target="_blank" rel="noopener noreferrer" href="https://cuit.columbia.edu/privacy-notice">
							Privacy Notice
						</a>
						<span> | </span>
						<a target="_blank" rel="noopener noreferrer" href="http://health.columbia.edu/disability-services">
							Disability Services
						</a>
						<span> | </span>
						<a target="_blank" rel="noopener noreferrer" href="http://eoaa.columbia.edu/columbia-university-non-discrimination-statement-and-policy">
							Non-Discrimination
						</a>
					</div>
				</div>
			</div>
		);
	}

	render() {
		const { firstPageLoad, fixedFrameMode, googleAnalyticsTrackingID } = this.props.diplomatic
		const fixedFrameModeClass = fixedFrameMode ? 'fixed' : 'sticky';

		if( googleAnalyticsTrackingID && firstPageLoad ) {
			dispatchAction( this.props, 'DiplomaticActions.recordLanding' );
		}
		return (
			<Provider store={this.props.store}>
				<HashRouter>
					<div id="diplomatic" className={fixedFrameModeClass}>
						<RouteListener/>
						{ this.renderHeader(fixedFrameModeClass) }
						{ this.renderContent() }
						{ this.renderFooter(fixedFrameModeClass) }
					</div>	
				</HashRouter>
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

export default withWidth() (connect(mapStateToProps)(DiploMatic));
