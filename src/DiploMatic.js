import React, {Component} from 'react';
import {connect} from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import SplitPaneView from './view/SplitPaneView';
import Document from './model/Document';
import Search from './Search';
import HashParser from './HashParser';
import * as navigationStateActions from './actions/navigationStateActions';

class DiploMatic extends Component {

	constructor(props, context) {
		super(props, context);
		this.document = new Document();
		this.navigationStateActions = navigationStateActions;
		this.state = {
			ready: false
		}
	}

  componentDidMount() {



		// Load the document
		this.document.load().then(
			(folio) => {

				// Mark everything loaded (do this first so we don't thrash when we dispatch redux update below)
				this.setState({
					ready: true
				});

				// Store an ordered array of folio ids, used for next/prev navigation purposes later
				if (this.props.navigationState.folioIndex.length === 0) {
					let folioIndex = [];
					let nameByID = {};
					let idByName = {};
					for (let idx = 0; idx < this.document.folios.length; idx++) {
						let shortID = this.document.folios[idx].id.substr(this.document.folios[idx].id.lastIndexOf('/') + 1);
						folioIndex.push(shortID);
						nameByID[shortID] = this.document.folios[idx].name;
						idByName[this.document.folios[idx].name] = shortID;
					}
					this.props.dispatch(this.navigationStateActions.updateFolioIndex({	folioIndex: folioIndex,
																						folioNameByIDIndex: nameByID,
																						folioIDByNameIndex: idByName}));

				}


			},
			(error) => {
				// TODO update UI
				console.log('Unable to load manifest: ' + error);
			}
		);
	}

	render() {
		if (this.state.ready) {
			window.loadingModal_stop();
			return (
			  <MuiThemeProvider>
				<div className="DiploMatic">
				  <HashParser history={this.props.history}/>
				  <Search history={this.props.history}/>
				  <SplitPaneView
					history={this.props.history}
					document={this.document}
				  />
				</div>
			  </MuiThemeProvider>
			);
			} else {
			return (
			  <MuiThemeProvider>
				<div className="DiploMatic"></div>
			  </MuiThemeProvider>
			);
			}
		}
	}

	function mapStateToProps(state) {
		return {
			navigationState: state.navigationState
		};
	}

	export default connect(mapStateToProps)(DiploMatic);
