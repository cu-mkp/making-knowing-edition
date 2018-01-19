import React from 'react';
import ImageView from './ImageView';
import ImageGridView from './ImageGridView';
import TranscriptionView from './TranscriptionView';

function SplitPaneViewport(props) {
  if( props.viewType === 'ImageView') {
    return (
      <ImageView
        viewWidth={props.viewWidth}
        drawerMode={props.drawerMode}
        drawerOpen={props.drawerOpen}
      />
    );
  } else if( props.viewType === 'TranscriptionView' ) {
    return(
      <TranscriptionView
        viewWidth={props.viewWidth}
        drawerMode={props.drawerMode}
        drawerOpen={props.drawerOpen}
      />
    );
  } else if( props.viewType === 'ImageGridView' ) {
    return (
      <ImageGridView
        viewWidth={props.viewWidth}
        drawerMode={props.drawerMode}
        drawerOpen={props.drawerOpen}
      />
    );
  } else {
    return (
      <div>ERROR: Undefined split pane type.</div>
    );
  }
};

export default SplitPaneViewport;
