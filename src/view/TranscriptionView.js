import React, { Component } from 'react';
import './css/TranscriptionView.css';

class TranscriptionView extends Component {

  constructor(props) {
    super();
    this.gridBreakPoint = 640; // two column widths

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

  layoutGrid( folio ) {
    // load the surface into a DOM element to retrieve the grid data
    let zoneDiv = document.createElement("div");
    zoneDiv.innerHTML = folio.transcription;
    let zones = zoneDiv.children;

    let zoneGrid = new Map();
    for (let zone of zones) {
      // for each zone, take its grid data and populate the grid, throw an error on any dupes
      let gridData = zone.dataset.grid;
      let gridDataList = gridData.split(' ');
      for( let gridDatum of gridDataList ) {
        var letter = gridDatum[0];
        var number = parseInt(gridDatum[1],10) - 1;
        if( zoneGrid[letter] === undefined ) zoneGrid[letter] = [ '.', '.', '.' ];
        if( zoneGrid[letter][number] === '.' ) {
          zoneGrid[letter][number] = zone.id;
        } else {
          console.log(`ERROR: Grid location ${letter}${number} already assigned to ${zoneGrid[letter][number]}.`);
        }
      }
    }

    // WIP transform zone grid into the grid layout string
    let gridLayout = '';
    zoneGrid.forEach( function(row) {
      let rowString = row.join(' ');
      gridLayout += ` '${rowString}'`;
    });

    // set the grid-template-areas
    this.setState({
      content: folio.transcription,
      layout: gridLayout // "'z1 z2 z4' 'z1 z3 z4' 'z1 z5 z5' 'z1 z6 z6'"
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
