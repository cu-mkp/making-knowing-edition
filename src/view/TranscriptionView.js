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
        console.log('Unable to load transcription: '+error);
      }
    );
  }

  rowCodeToIndex( rowCode ) {
    if( typeof rowCode !== "string" || rowCode.length > 1 ) throw new Error('Invalid row code, must be a single letter.');
    let index = this.ROW_CODES.indexOf(rowCode.toLowerCase());
    if( index === -1 ) throw new Error('Invalid row code must be a letter a-j.');
    return index;
  }

  columnCodeToIndex( columnCode ) {
    if( typeof columnCode !== "string" ) throw new Error('Invalid column code, must be a single digit.')
    let index = parseInt(columnCode,10) - 1;
    return index;
  }

  layoutGrid( folio ) {
    // load the surface into a DOM element to retrieve the grid data
    let zoneDiv = document.createElement("div");
    zoneDiv.innerHTML = folio.transcription;
    let zones = zoneDiv.children;

    let zoneGrid = [];
    let index = 0;
    // for each zone, take its grid data and populate the grid, throw an error on any dupes
    try {
      for (let zone of zones) {
        zone.id = `z${index++}`;
        let gridData = zone.dataset.grid;
        if( typeof gridData !== "string" ) throw new Error(`Grid data not found for zone: ${zone}`);
        let gridDataList = gridData.split(' ');
        for( let gridDatum of gridDataList ) {
          let rowIndex = this.rowCodeToIndex(gridDatum[0]);
          let columnIndex = this.columnCodeToIndex(gridDatum[1]);
          if( zoneGrid[rowIndex] === undefined ) zoneGrid[rowIndex] = [ '.', '.', '.' ];
          if( zoneGrid[rowIndex][columnIndex] === '.' ) {
            zoneGrid[rowIndex][columnIndex] = zone.id;
          } else {
            throw new Error(`Grid location ${gridDatum} already assigned to ${zoneGrid[rowIndex][columnIndex]}.`)
          }
        }
      }
    }
    catch(error) {
      console.log(error);
    }

    // transform zone grid into the grid layout string
    let gridLayout = '';
    for (let row of zoneGrid) {
      let rowString = row.join(' ');
      gridLayout += ` '${rowString}'`;
    }

    // set the grid-template-areas
    this.setState({
      content: zoneDiv.innerHTML,
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
