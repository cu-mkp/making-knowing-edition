import React from 'react';
import {connect} from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';
import './css/ImageGridView.css';

class ImageGridView extends React.Component {

  constructor(props,context){
	super(props,context);
	this.generateThumbs = this.generateThumbs.bind(this);
    this.loadIncrement = 10;
    let thumbs = this.generateThumbs(props.document.folios);
    let thumbCount = (thumbs.length > this.loadIncrement) ? this.loadIncrement : thumbs.length;
    let visibleThumbs = thumbs.slice(0,thumbCount);
    this.state = { thumbs: thumbs, visibleThumbs: visibleThumbs };
  }

  onClickThumb = (id, e) => {
    let splitPaneView = this.props.splitPaneView;
    let side = this.props.side;
    let otherSide = splitPaneView.otherSide(side);
    splitPaneView.openFolio(side, id, 'ImageView');
    splitPaneView.openFolio(otherSide, id, 'TranscriptionView');
  }

  generateThumbs (folios) {

    let thumbs = folios.map( (folio,index) => (
      <li key={`thumb-${index}`} className="thumbnail">
        <figure className={(folio.name===this.props.navigationState.currentFolio)?"current":""}><a id={folio.id} onClick={this.onClickThumb.bind(this,folio.id)}><img src={folio.image_thumbnail_url} alt={folio.name}/></a></figure>
        <figcaption className={(folio.name===this.props.navigationState.currentFolio)?"thumbnail-caption current":"thumbnail-caption"}>
			{(folio.name===this.props.navigationState.currentFolio)?("*"+folio.name):folio.name}
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

    return (
      <div id='image-grid-view' className={hidden} style={style}>
        <InfiniteScroll
          element = 'ul'
          loadMore={this.moreThumbs}
          hasMore={this.hasMore()}
          useWindow={false}>
          {this.state.visibleThumbs}
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
