import React from 'react';
import {connect} from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';
import * as navigationStateActions from '../actions/navigationStateActions';

class ImageGridView extends React.Component {

	constructor(props,context){
		super(props,context);
		this.generateThumbs = this.generateThumbs.bind(this);
		this.loadIncrement = 10;
		this.thumbnailNavigationModeSize=312;
		this.state={thumbs:'',visibleThumbs:[]};
		this.navigationStateActions=navigationStateActions;

		// Store an ordered array of folio ids, used for next/prev navigation purposes later
		if(this.props.navigationState.folioIndex.length ===0){
			let folioIndex = [];
			let nameByID = {};
			for(let idx=0;idx<props.document.folios.length;idx++){
				let idOnly=props.document.folios[idx].id.substr(props.document.folios[idx].id.lastIndexOf('/')+1);
				folioIndex.push(idOnly);
				nameByID[idOnly]=props.document.folios[idx].name;
			}
			this.props.dispatch(this.navigationStateActions.updateFolioIndex({side:this.props.side,folioIndex:folioIndex}));
			this.props.dispatch(this.navigationStateActions.updateFolioNameIndex({folioNameIndex:nameByID}));
		}
	}

	componentWillReceiveProps(nextProps) {
		if(this.props.navigationState[this.props.side].currentFolioID !== nextProps.navigationState[this.props.side].currentFolioID){
			let thumbs = this.generateThumbs(nextProps.navigationState[this.props.side].currentFolioID, nextProps.document.folios);
			let thumbCount = (thumbs.length > this.loadIncrement) ? this.loadIncrement :thumbs.length;
			let visibleThumbs = thumbs.slice(0,thumbCount);
			this.setState({thumbs:thumbs,visibleThumbs:visibleThumbs});
		}
	}

	componentWillMount(){
		let thumbs = this.generateThumbs(this.props.navigationState[this.props.side].currentFolioID, this.props.document.folios);
		let thumbCount = (thumbs.length > this.loadIncrement) ? this.loadIncrement :thumbs.length;
		let visibleThumbs = thumbs.slice(0,thumbCount);
		this.setState({thumbs:thumbs,visibleThumbs:visibleThumbs});
	}

	onClickThumb = (id, e) => {
		// Set the folio for this side
		this.props.dispatch(this.navigationStateActions.changeCurrentFolio({side:this.props.side,id:id}));

		// Replace this pane with imageView if the pane is big enough
		if(this.props.navigationState[this.props.side].width >= this.thumbnailNavigationModeSize){
			this.props.dispatch(this.navigationStateActions.setPaneViewtype({side:this.props.side,viewType:'ImageView'}));
		}
	}

	generateThumbs (currentID, folios) {
		let thumbs = folios.map( (folio,index) => (
			<li key={`thumb-${index}`} className="thumbnail">
				<figure className={(folio.id===currentID)?"current":""}><a id={folio.id} onClick={this.onClickThumb.bind(this,folio.id)}><img src={folio.image_thumbnail_url} alt={folio.name}/></a></figure>
				<figcaption className={(folio.id===currentID)?"thumbnail-caption current":"thumbnail-caption"}>
					{(folio.id===currentID)?("*"+folio.name):folio.name}
				</figcaption>
			</li>
		));
		return thumbs;
	}

	moreThumbs = () => {
		let thumbs = this.state.thumbs;
		let visibleThumbs = this.state.visibleThumbs;
		let thumbCount = visibleThumbs.length + this.loadIncrement;

		if( thumbs.length >= thumbCount ) {
		  visibleThumbs = thumbs.slice(0,thumbCount);
		} else {
		  visibleThumbs = thumbs;
		}

		this.setState({ visibleThumbs: visibleThumbs });
	}

	hasMore() {
		return (this.state.visibleThumbs.length !== this.state.thumbs.length);
	}

	render() {
		//let thisClass = (this.props.navigationState.drawerMode && !this.props.drawerOpen ) ? "imageGridComponent hidden" : "imageGridComponent";
		let thisClass= "imageGridComponent";
		thisClass = thisClass+" "+this.props.side;
		let visibleThumbs=this.state.visibleThumbs;
		if(visibleThumbs.constructor.toString().indexOf("Array") === -1){
			visibleThumbs=[];
		}
		return (
			<div className={thisClass}>
				<InfiniteScroll
					element = 'ul'
					loadMore={this.moreThumbs}
					hasMore={this.hasMore()}
					useWindow={false}>
						{visibleThumbs}
				</InfiniteScroll>
			</div>
		);
	}
}


function mapStateToProps(state) {
	return {
        navigationState: state.navigationState
    };
}

export default connect(mapStateToProps)(ImageGridView);
