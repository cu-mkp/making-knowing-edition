import React, { Component } from 'react';
import './css/TranscriptionView.css';

class TranscriptionView extends Component {

  constructor(props) {
    super();
    this.gridBreakPoint = 640; // two column widths
    this.ROW_CODES = ['a','b','c','d','e','f','g','h','i','j'];

    this.state = {};

    props.folio.load().then(
      (folio) => {
        this.layoutGrid(folio);
      },
      (error) => {
        // TODO update UI
        console.log('Unable to load transcription.');
      }
    );
  }

  rowCodeToIndex( rowCode ) {
    return this.ROW_CODES.indexOf(rowCode.toLowerCase());
  }

  columnCodeToIndex( columnCode ) {
    return parseInt(columnCode,10) - 1;
  }

  layoutGrid( folio ) {
    // load the surface into a DOM element to retrieve the grid data
    let zoneDiv = document.createElement("div");
    zoneDiv.innerHTML = folio.transcription;
    let zones = zoneDiv.children;

    let zoneGrid = [];
    for (let zone of zones) {
      // for each zone, take its grid data and populate the grid, throw an error on any dupes
      let gridData = zone.dataset.grid;
      let gridDataList = gridData.split(' ');
      for( let gridDatum of gridDataList ) {
        let rowIndex = this.rowCodeToIndex(gridDatum[0]);
        let columnIndex = this.columnCodeToIndex(gridDatum[1]);
        if( zoneGrid[rowIndex] === undefined ) zoneGrid[rowIndex] = [ '.', '.', '.' ];
        if( zoneGrid[rowIndex][columnIndex] === '.' ) {
          zoneGrid[rowIndex][columnIndex] = zone.id;
        } else {
          console.log(`ERROR: Grid location ${gridDatum} already assigned to ${zoneGrid[rowIndex][columnIndex]}.`);
        }
      }
    }

    // WIP transform zone grid into the grid layout string
    let gridLayout = '';
    for (let row of zoneGrid) {
      let rowString = row.join(' ');
      gridLayout += ` '${rowString}'`;
    }

    // set the grid-template-areas
    this.setState({
      content: folio.transcription,
      layout: gridLayout
    });
  }

  render() {
    let surfaceClass = "surface";
    let style = {
      height: this.props.viewHeight,
      overflow: 'scroll'
    };

    // if there's enough horizontal space, enable grid mode
    if( this.props.viewWidth >= this.gridBreakPoint ) {
      surfaceClass += " grid-mode";
      style.gridTemplateAreas = this.state.layout;
    }

    return (
      <div className={surfaceClass} style={style} dangerouslySetInnerHTML={ { __html: this.state.content } } >
      </div>
    );
  }
}

export default TranscriptionView;
