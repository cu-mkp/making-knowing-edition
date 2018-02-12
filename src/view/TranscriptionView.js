import React, { Component } from 'react';
import './css/TranscriptionView.css';
import copyObject from '../lib/copyObject';

class TranscriptionView extends Component {

  constructor(props) {
    super();
    this.gridBreakPoint = 640; // two column widths
    this.ROW_CODES = ['a','b','c','d','e','f','g','h','i','j'];

    this.state = {};

    props.folio.load().then(
      (folio) => {
        this.layoutFolio(folio);
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

  // transform zone grid into the grid layout string
  zoneGridToLayout( zoneGrid ) {
    let gridLayout = '';
    for (let row of zoneGrid) {
      let rowString = row.join(' ');
      gridLayout += ` '${rowString}'`;
    }
    return gridLayout;
  }

  renderBlock( blockID, block ) {
    let classStr = "";
    for( let i=0; i < block.classList.length; i++ ) {
      classStr = classStr + " " + block.classList.item(i);
    }

    return `<div id="${blockID}" class="${classStr}">${block.innerHTML}</div>`;
  }

  layoutMargin( html ) {

    // load the surface into a DOM element to retrieve the grid data
    let folioDiv = document.createElement("div");
    folioDiv.innerHTML = html;
    let zones = folioDiv.children;

    const emptyZoneFrame = [
      [ '.', '.', '.' ],
      [ '.', '.', '.' ],
      [ '.', '.', '.' ]
    ];

    let zoneGrid = [];
    let gridContent = "";
    let zoneIndex = 0;
    let rowIndex = 0;
    // for each zone, take its margin data and populate the grid
    try {
      for (let zone of zones) {
        // create a rolling frame that is ORed on to grid with each step
        let zoneFrame = copyObject( emptyZoneFrame );
        let blocks = zone.children;

        for( let block of blocks ) {
          let blockID = `z${zoneIndex++}`;
          gridContent = gridContent.concat( this.renderBlock(blockID, block) );
          let layoutCode = block.dataset.layout;
          let hint = block.dataset.layoutHint;
          switch(layoutCode) {
            case 'top':
              zoneFrame[0][1] = blockID;
              break;
            case 'left-middle':
              zoneFrame[1][0] = blockID;
              if( hint === 'tall')
                zoneFrame[2][0] = blockID;
              break;
            case 'right-middle':
              zoneFrame[1][2] = blockID;
              if( hint === 'tall')
                zoneFrame[2][2] = blockID;
              break;
            case 'bottom':
              zoneFrame[2][1] = blockID;
              break;
            case 'left-top':
              zoneFrame[0][0] = blockID;
              if( hint === 'tall')
                zoneFrame[1][0] = blockID;
              break;
            case 'right-top':
              zoneFrame[0][2] = blockID;
              if( hint === 'tall')
                zoneFrame[1][2] = blockID;
              break;
            case 'left-bottom':
              zoneFrame[2][0] = blockID;
              break;
            case 'right-bottom':
              zoneFrame[2][2] = blockID;
              break;
            default:
              zoneFrame[1][1] = blockID;
              zoneFrame[1][2] = blockID;
          }
        }

        // integrate frame into grid
        zoneGrid[rowIndex] = this.mergeRow( zoneFrame[0], zoneGrid[rowIndex] );
        zoneGrid[rowIndex+1] = this.mergeRow( zoneFrame[1], zoneGrid[rowIndex+1] );
        zoneGrid[rowIndex+2] = this.mergeRow( zoneFrame[2], zoneGrid[rowIndex+2] );
        rowIndex = rowIndex + 1;
      }
    }
    catch(error) {
      console.log(error);
    }

    let gridLayout = this.zoneGridToLayout( zoneGrid );

    // set the grid-template-areas
    return {
      content: gridContent,
      layout: gridLayout
    };
  }

  mergeRow( sourceRow, targetRow ) {
    if( targetRow ) {
      let result = [];
      for( let i = 0; i < 3; i++ ) {
        // if the source isn't blank, copy it, otherwise use existing
        if( sourceRow[i] !== '.' ) {
          result[i] = sourceRow[i];
        } else {
          result[i] = targetRow[i];
        }
      }
      return result;
    } else {
      return sourceRow;
    }
  }

  layoutGrid( html ) {
    // load the surface into a DOM element to retrieve the grid data
    let zoneDiv = document.createElement("div");
    zoneDiv.innerHTML = html;
    let zones = zoneDiv.children;

    // move blocks into the gridContent as they are identified.
    let gridContent = "";

    let zoneGrid = [];
    let index = 0;
    // for each zone, take its grid data and populate the grid, throw an error on any dupes
    try {
      for (let zone of zones) {
        let blocks = zone.children;
        for(let block of blocks) {
          let blockID = `z${index++}`;
          gridContent = gridContent.concat( this.renderBlock(blockID, block) );
          let gridData = block.dataset.layout;
          if( typeof gridData !== "string" ) throw new Error(`Grid data not found for zone: ${block}`);
          let gridDataList = gridData.split(' ');
          for( let gridDatum of gridDataList ) {
            let rowIndex = this.rowCodeToIndex(gridDatum[0]);
            let columnIndex = this.columnCodeToIndex(gridDatum[1]);
            if( zoneGrid[rowIndex] === undefined ) zoneGrid[rowIndex] = [ '.', '.', '.' ];
            if( zoneGrid[rowIndex][columnIndex] === '.' ) {
              zoneGrid[rowIndex][columnIndex] = blockID;
            } else {
              throw new Error(`Grid location ${gridDatum} already assigned to ${zoneGrid[rowIndex][columnIndex]}.`)
            }
          }
        }
      }
    }
    catch(error) {
      console.log(error);
    }

    let gridLayout = this.zoneGridToLayout( zoneGrid );

    // set the grid-template-areas
    return {
      content: gridContent,
      layout: gridLayout
    };
  }

  layoutFolio( folio ) {
    let transcriptionData = {};
    if( folio.transcription.layout === 'grid' ) {
      transcriptionData = this.layoutGrid(folio.transcription.html);
    } else if( folio.transcription.layout === 'margin' ) {
      transcriptionData = this.layoutMargin(folio.transcription.html);
    } else {
      // no mode specified, pass on without any layout
      transcriptionData = {
        content: folio.transcription.html,
        layout: ""
      };
    }

    this.setState(transcriptionData);
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
