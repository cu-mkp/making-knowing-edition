import React from 'react';
import './css/ImageZoomControl.css';

function ImageZoomControl(props) {
  return (
    <ul className="ImageZoomControl">
      <li><i id="os-zoom-in" className="zoom-in fas fa-plus-circle fa-2x"></i></li>
      <li><i className="zoom-3 fas fa-circle fa-2x"></i></li>
      <li><i className="zoom-2 fas fa-circle fa-lg"></i></li>
      <li><i className="zoom-1 fas fa-circle"></i></li>
      <li><i id="os-zoom-out"  className="zoom-out fas fa-minus-circle fa-2x"></i></li>
      <li><i onClick={props.onZoomGrid} className="zoom-grid fas fa-th fa-2x"></i></li>
    </ul>
  );
}


export default ImageZoomControl;
