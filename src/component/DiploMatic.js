import React, {Component} from 'react';
import { Provider, connect } from 'react-redux'
import { HashRouter, Route, Switch, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import DocumentView from './DocumentView';
import SearchView from './SearchView';
import ContentView from './ContentView';
import AnnotationView from './AnnotationView';
import EntryListView from './EntryListView';
import AnnotationListView from './annotation_list_view/AnnotationListView';
import Search from './Search';
import RouteListener from './RouteListener';
import MainMenu from './MainMenu';


class DiploMatic extends Component {

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
				<div className="title"><Link to='/' className='home-link'>Secrets of Craft and Nature<br/> in Renaissance France</Link></div>
				<div className="compactTitle">Secrets of Craft and Nature in Renaissance France</div>
				<div className="tagline">A Digital Critical Edition and English Translation of BnF Ms. Fr. 640</div>
				<div id="globalNavigation">
					<MainMenu></MainMenu>
					<Search />
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
					folioID: '-1',
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
				<div className="copyright">&copy; The Center for Science and Society at Columbia University.</div>
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

export default connect(mapStateToProps)(DiploMatic);
