import React, { Component } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import './css/ImageGridView.css';

class ImageGridView extends Component {

  constructor () {
      super();
      this.loadIncrement = 20;
      let thumbs = this.moreThumbs.bind(this);
      let thumbCount = (thumbs.length > loadIncrement) ? loadIncrement : thumbs.length;
      this.state = { thumbs: thumbs, thumbCount: thumbCount };
  }

  onClickThumb = (id, e) => {
    let splitPaneView = this.props.splitPaneView;
    let side = this.props.side;
    let otherSide = splitPaneView.otherSide(side);
    splitPaneView.openFolio(side, id, 'ImageView');
    splitPaneView.openFolio(otherSide, id, 'TranscriptionView');
  }

  generateThumbs () {
    let folios = this.props.document.folios;
    let count = this.state.divs.length;

    let thumbs = folios.map( (folio) => (
      <li className="thumbnail" key={folio.id}>
        <figure><a id={folio.id} onClick={this.onClickThumb.bind(this,folio.id)}><img src={folio.image_thumbnail_url} alt={folio.name}/></a></figure>
        <figcaption className="thumbnail-caption">{folio.name}</figcaption>
      </li>
    ));

    return thumbs;
  }

  moreThumbs() {
    let thumbCount = this.state.thumbCount + this.loadIncrement;
    if( thumbs.length >= thumbCount ) {
      this.setState({ thumbCount: thumbCount });
      return this.state.thumbs.slice(0,thumbCount);
    } else {
      this.setState({ thumbCount: thumbs.length });
      return this.state.thumbs;
    }
  }

  hasMore() {
    return (this.state.thumbs.length >= this.state.thumbCount)
  }

  render() {
    let hidden = ( this.props.drawerMode && !this.props.drawerOpen ) ? "hidden" : "";
    let style = { height: this.props.viewHeight, overflow: 'scroll' };

    return (
      <div id='image-grid-view' className={hidden} style={style}>
        <ul>
          <InfiniteScroll
            next={this.moreThumbs}
            hasMore={true}
            height={style.height}
            loader={<h4>Loading...</h4>}>
            {this.state.divs}
          </InfiniteScroll>
        </ul>
      </div>
    );
  }
}

export default ImageGridView;
