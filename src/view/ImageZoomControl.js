import React from 'react';
import './css/ImageZoomControl.css';

function ImageZoomControl(props) {
  return (
    <ul className="ImageZoomControl">
      <li><i className="fas fa-plus-circle fa-2x"></i></li>
      <li><i className="fas fa-circle fa-2x"></i></li>
      <li><i className="fas fa-circle fa-lg"></i></li>
      <li><i className="fas fa-circle"></i></li>
      <li><i className="fas fa-minus-circle fa-2x"></i></li>
      <li><i onClick={props.onZoomGrid} className="fas fa-th fa-2x"></i></li>
    </ul>
  );
}


export default ImageZoomControl;
