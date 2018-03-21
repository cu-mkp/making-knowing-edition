import React from 'react';
import {connect} from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';
import './css/ImageGridView.css';
import * as navigationStateActions from '../actions/navigationStateActions';

class ImageGridView extends React.Component {

	constructor(props,context){
		super(props,context);
		this.generateThumbs = this.generateThumbs.bind(this);
		this.loadIncrement = 10;
		this.state={thumbs:'',visibleThumbs:[]};
		this.navigationStateActions=navigationStateActions;

		// Store an ordered array of folio ids, used for next/prev navigation purposes later
		let folioIndex = [];
		for(let idx=0;idx<props.document.folios.length;idx++){
			let idOnly=props.document.folios[idx].id.substr(props.document.folios[idx].id.lastIndexOf('/')+1);
			folioIndex.push(idOnly);
		}
		this.props.dispatch(this.navigationStateActions.updateFolioIndex(folioIndex));
		this.props.dispatch(this.navigationStateActions.changeCurrentFolio({id:props.document.folios[0].id}));
	}


	// Refresh the thumbnails if there is an incoming change
	componentWillReceiveProps(nextProps) {
		if(this.props.navigationState.currentFolioID !== nextProps.navigationState.currentFolioID){
			//console.log("Now:"+nextProps.navigationState.currentFolioID);
			let thumbs = this.generateThumbs(nextProps.navigationState.currentFolioID, nextProps.document.folios);
			let thumbCount = (this.state.thumbs.length > this.loadIncrement) ? this.loadIncrement : this.state.thumbs.length;
			let visibleThumbs = this.state.thumbs.slice(0,thumbCount);
			this.setState({thumbs:thumbs,visibleThumbs:visibleThumbs});

			/*
			let splitPaneView = this.props.splitPaneView;
			let side = this.props.side;
			let otherSide = splitPaneView.otherSide(side);
			splitPaneView.openFolio(side, nextProps.navigationState.currentFolioID, 'ImageView');
			splitPaneView.openFolio(otherSide, nextProps.navigationState.currentFolioID, 'TranscriptionView');
			*/
		}
	}

  onClickThumb = (id, e) => {
  	this.props.dispatch(this.navigationStateActions.changeCurrentFolio({id:id}));
	/*
	  console.log(id);
    let splitPaneView = this.props.splitPaneView;
    let side = this.props.side;
    let otherSide = splitPaneView.otherSide(side);
    splitPaneView.openFolio(side, id, 'ImageView');
    splitPaneView.openFolio(otherSide, id, 'TranscriptionView');
	*/
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
    let hidden = ( this.props.drawerMode && !this.props.drawerOpen ) ? "hidden" : "";
    let style = { height: this.props.viewHeight, overflow: 'scroll' };
	let visibleThumbs=this.state.visibleThumbs;
	if(visibleThumbs.constructor.toString().indexOf("Array") === -1){
		visibleThumbs=[];
	}
    return (
      <div id='image-grid-view' className={hidden} style={style}>
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
