import React, { Component } from 'react';
import './css/TranscriptionView.css';

class TranscriptionView extends Component {

  constructor(props) {
    super();
    this.gridBreakPoint = 640; // two column widths

    this.state = {};

    props.folio.load().then( (folio) => {
      this.setState( { content: folio.transcription } );
    });
  }

  render() {
    let transcriptionClass = ( this.props.viewWidth >= this.gridBreakPoint ) ? "transcription grid-mode" : "transcription";
    let style = { height: this.props.viewHeight, overflow: 'scroll' };

    return (
      <div className={transcriptionClass} style={style}>
        {this.state.content}
      </div>
    );
  }
}

export default TranscriptionView;
