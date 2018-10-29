import React from 'react';
import {connect} from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';
import DocumentHelper from '../model/DocumentHelper';

class ImageGridView extends React.Component {

	constructor(props,context){
		super(props,context);
		this.generateThumbs = this.generateThumbs.bind(this);
		this.loadIncrement = 10;
		this.thumbnailNavigationModeSize=312;
		this.state={thumbs:'',visibleThumbs:[]};
	}

	componentWillReceiveProps(nextProps) {
		const folioID = this.props.documentView[this.props.side].currentFolioShortID;
		const nextFolioID = nextProps.documentView[this.props.side].currentFolioShortID;

		if(folioID !== nextFolioID){
			const nextFolioURL = DocumentHelper.folioURL(nextFolioID);
			let thumbs = this.generateThumbs(nextFolioURL, nextProps.document.folios);
			let thumbCount = (thumbs.length > this.loadIncrement) ? this.loadIncrement :thumbs.length;
			let visibleThumbs = thumbs.slice(0,thumbCount);
			this.setState({thumbs:thumbs,visibleThumbs:visibleThumbs});
		}
	}

	componentWillMount(){
		const folioID = this.props.documentView[this.props.side].currentFolioShortID;
		const folioURL = DocumentHelper.folioURL(folioID);
		let thumbs = this.generateThumbs(folioURL, this.props.document.folios);
		let thumbCount = (thumbs.length > this.loadIncrement) ? this.loadIncrement :thumbs.length;
		let visibleThumbs = thumbs.slice(0,thumbCount);
		this.setState({thumbs:thumbs,visibleThumbs:visibleThumbs});
	}

	onClickThumb = (id, e) => {
		// Set the folio for this side
		this.props.documentViewActions.changeCurrentFolio(
			this.props.document,
			id,
			this.props.side
		);

		// Replace this pane with imageView if the pane is big enough
		if(this.props.documentView[this.props.side].width >= this.thumbnailNavigationModeSize){
			this.props.documentViewActions.setPaneViewtype(
				this.props.side,
				'ImageView'
			);
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
		//let thisClass = (this.props.documentView.drawerMode && !this.props.drawerOpen ) ? "imageGridComponent hidden" : "imageGridComponent";
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
		document: state.document
	};
}

export default connect(mapStateToProps)(ImageGridView);
