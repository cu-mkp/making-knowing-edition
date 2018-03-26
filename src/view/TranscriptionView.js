import React, { Component } from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from '../actions/navigationStateActions';
import copyObject from '../lib/copyObject';
import Navigation from '../Navigation';
class TranscriptionView extends Component {

  constructor(props) {
    super(props);
    this.gridBreakPoint = 640; // two column widths
    this.ROW_CODES = ['a','b','c','d','e','f','g','h','i','j'];
    this.state = {folio:[], isLoaded:false};
	this.navigationStateActions=navigationStateActions;
	window.loadingModal_stop();
  }

  // Refresh the content if there is an incoming change
  componentWillReceiveProps(nextProps) {
	  if(this.props.navigationState.currentFolioID !== nextProps.navigationState.currentFolioID){
		  //console.log("Updating:"+nextProps.navigationState.currentFolioID);
		  let newFolio = this.props.document.getFolio(nextProps.navigationState.currentFolioID);
		  newFolio.load().then(
	        (folio) => {
				this.setState({folio:newFolio,isLoaded:true});
	        },
	        (error) => {
	          // TODO update UI
	          console.log('Unable to load transcription: '+error);
			  this.forceUpdate();
	        }
	      );
	  }
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

  renderBlockSet( blockSet ) {
    // use ID and class from the first block in the set
    let firstBlock = blockSet[0];
    let divID = firstBlock.id;
    let classStr = "";
    for( let i=0; i < firstBlock.classList.length; i++ ) {
      classStr = classStr + " " + firstBlock.classList.item(i);
    }

    // concat all the blocks together into a single div
    let div = `<div id="${divID}" class="${classStr}">`;
    for( let block of blockSet ) {
      div = div.concat(`${block.innerHTML} <br/>`);
    }
    return div.concat("</div>");
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

    const emptyMarginFrame = {
      'middle': false,
      'top': false,
      'left-middle': false,
      'right-middle': false,
      'bottom': false,
      'left-top': false,
      'right-top': false,
      'left-bottom': false,
      'right-bottom': false
    };

    let validLayoutCode = function( layoutCode ) {
      if( Object.keys(emptyMarginFrame).includes(layoutCode) ) {
        return layoutCode;
      } else {
        return 'middle';
      }
    };

    let zoneGrid = [];
    let gridContent = "";
    let zoneIndex = 0;
    let rowIndex = 0;
    // for each zone, take its margin data and populate the grid
    try {
      for (let zone of zones) {
        // create a rolling frame that is ORed on to grid with each step
        let zoneFrame = copyObject( emptyZoneFrame );
        let marginFrame = copyObject( emptyMarginFrame );
        let blocks = zone.children;

        for( let block of blocks ) {
          let layoutCode = validLayoutCode(block.dataset.layout);
          let hint = block.dataset.layoutHint;

          // group all the blocks together that share a layout code
          if( marginFrame[layoutCode] ) {
            block.id = marginFrame[layoutCode][0].id;
            marginFrame[layoutCode].push(block);
          } else {
            zoneIndex++;
            block.id = `z${zoneIndex}`;
            marginFrame[layoutCode] = [block];
          }

          // decode the layout
          switch(layoutCode) {
            case 'top':
              zoneFrame[0][1] = block.id;
              break;
            case 'left-middle':
              zoneFrame[1][0] = block.id;
              if( hint === 'tall')
                zoneFrame[2][0] = block.id;
              break;
            case 'right-middle':
              zoneFrame[1][2] = block.id;
              if( hint === 'tall')
                zoneFrame[2][2] = block.id;
              break;
            case 'bottom':
              zoneFrame[2][1] = block.id;
              break;
            case 'left-top':
              zoneFrame[0][0] = block.id;
              if( hint === 'tall')
                zoneFrame[1][0] = block.id;
              break;
            case 'right-top':
              zoneFrame[0][2] = block.id;
              if( hint === 'tall')
                zoneFrame[1][2] = block.id;
              break;
            case 'left-bottom':
              zoneFrame[2][0] = block.id;
              break;
            case 'right-bottom':
              zoneFrame[2][2] = block.id;
              break;
            default:
              zoneFrame[1][1] = block.id;
              zoneFrame[1][2] = block.id;
          }
        }

        for( let blockSet of Object.values(marginFrame) ) {
          if( blockSet ) {
            gridContent = gridContent.concat( this.renderBlockSet(blockSet) );
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



	// RENDER
	render() {

		// Retrofit - we need to make sure the folio is fully cached before we try and render anything
		if(!this.state.isLoaded){
			return (
				<div className="watermark">
					<div className="watermark_contents"/>
				</div>
			);
		}else{

			//console.log("Rendering:" + this.state.folio.id);
			//window.loadingModal_stop();

			// Transcription data depends on the type we're looking at
			let transcriptionData = {};
			let thisTranscription=this.state.folio.transcription[this.props.navigationState.transcriptionType];

			// Grid layout
			if( thisTranscription.layout === 'grid' ) {
				transcriptionData = this.layoutGrid(thisTranscription.html);

			// Margin layout
			} else if( thisTranscription.layout === 'margin' ) {
				transcriptionData = this.layoutMargin(thisTranscription.html);

			// None specified, pass on without any layout
			} else {
				transcriptionData = {
					content: thisTranscription.html,
					layout: ""
				};
			}

			let surfaceClass = "surface";
			let style = {
		      height: this.props.viewHeight,
		      overflow: 'scroll'
		    };

			// if there's enough horizontal space, enable grid mode
			if(this.props.viewWidth >= this.gridBreakPoint) {
				surfaceClass += " grid-mode";
				style.gridTemplateAreas = transcriptionData.layout;
			}

			return (
				<div className="transcriptionViewComponent">
					<Navigation context="transcription-view"/>
					<div className="transcriptContent">
						<div className={surfaceClass} style={style} dangerouslySetInnerHTML={ { __html: transcriptionData.content } } ></div>
					</div>
				</div>
			);
		}
	}
}

function mapStateToProps(state) {
	return {
        navigationState: state.navigationState
    };
}

export default connect(mapStateToProps)(TranscriptionView);
