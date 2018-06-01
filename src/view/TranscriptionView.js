import React, { Component } from 'react';
import {connect} from 'react-redux';
import * as navigationStateActions from '../actions/navigationStateActions';
import copyObject from '../lib/copyObject';
import Navigation from '../Navigation';
import Pagination from '../Pagination';
import Gloss from '../Gloss';
import Annotation from '../Annotation';
import Parser from 'html-react-parser';
import domToReact from 'html-react-parser/lib/dom-to-react';

var unrecognizedTags =[  'add',
												 'al',
												 'bp',
												 'cn',
												 'corr',
												 'cont',
												 'env',
												 'exp',
												 'fr',
												 'gap',
												 'df',
												 'gk',
												 'id',
												 'it',
												 'ill',
												 'la',
												 'margin',
												 'ms',
												 'oc',
												 'pa',
												 'pl',
												 'pm',
												 'pn',
												 'pro',
												 'rub',
												 'sn',
												 'tl',
												 'tmp',
												 'unc',
												 'x' ];

class TranscriptionView extends Component {


	constructor(props) {
		super(props);
		this.ROW_CODES = ['a','b','c','d','e','f','g','h','i','j'];
		this.state = {folio:[], isLoaded:false, currentlyLoaded:''};
		this.navigationStateActions=navigationStateActions;
		this.contentChange=true;
		window.loadingModal_stop();
	}

	// Recursively unpack a node tree object and just return the text
	nodeTreeToString(node) {
		let term = '';
		for(let x=0;x<node.length;x++){
			if(node[x].type === 'text'){
				term += node[x].data+" ";
			}else if(node[x].children.length > 0){
				term += this.nodeTreeToString(node[x].children);
			}
		}
  	  return term.trim();
    }

	loadFolio(folio){
		if(typeof folio === 'undefined'){
			//console.log("TranscriptView: Folio is undefined when you called loadFolio()!");
			return;
		}
		folio.load().then(
			(folio) => {
				this.setState({folio:folio,isLoaded:true,currentlyLoaded:this.props.navigationState[this.props.side].currentFolioID});
				//this.forceUpdate();
			},(error) => {
				console.log('Unable to load transcription: '+error);
				//this.forceUpdate();
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

	renderBlockSet( blockSet ) {

		// use ID and class from the first block in the set
		let firstBlock = blockSet[0];
		let elementID = firstBlock.id;
		let classStr = "";
		for( let i=0; i < firstBlock.classList.length; i++ ) {
	  		classStr = classStr + " " + firstBlock.classList.item(i);
		}

		// combine the blocks in the block set. divs are all merged into a single div
		// other element types become children of the single div.
		let el = `<div id="${elementID}" class="${classStr}">`;
		for( let block of blockSet ) {
			if( block.name === 'div' ) {
				el = el.concat(`${block.innerHTML} <br/>`);
			} else {
				el = el.concat(`${block.outerHTML}`);
			}
		}
		return el.concat(`</div>`);
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

  	// Refresh the content if there is an incoming change
	componentWillReceiveProps(nextProps) {
		this.contentChange=false;
  		if(this.state.currentlyLoaded !== nextProps.navigationState[this.props.side].currentFolioID){
			this.contentChange=true;
			this.loadFolio(this.props.document.getFolio(nextProps.navigationState[this.props.side].currentFolioID));
	  	}
	}

	componentDidUpdate(){
		if(this.contentChange){
			// Scroll content to top
			let selector = "transcriptionViewComponent_"+this.props.side;
			var el = document.getElementById(selector);
			if(el !== null){
				//console.log(selector + "scroll to top");
				el.scrollTop = 0;
			}
		}
	}

	watermark() {
		return (
			<div className="watermark">
				<div className="watermark_contents"/>
			</div>
		);
	}

	determineFigureURL(domNode) {
		// Note: this is domNode from the parser, not an HTML DOM node
		let figureID = (domNode.children[0]) ? (domNode.children[0].children) ? (domNode.children[0].children[0]) ? domNode.children[0].children[0].data : null : null : null;

		if( figureID ) {
			// chop of fig_ in fig_p006v_1
			return `/bnf-ms-fr-640/figures/${figureID.substr(4)}.png`;
		} else {
			return null;
		}
	}

	htmlToReactParserOptions(side) {
		let this2=this;
		var parserOptions =  {
			 replace: function(domNode) {

				 switch (domNode.name) {

					case 'cont':
						return (
							<span><i>Continued from the previous page..</i>  {domToReact(domNode.children, parserOptions)}</span>
						);

					 /* del / strikethrough */
 					case 'del':
 						return (
 							<s>{domToReact(domNode.children, parserOptions)}</s>
 						);

					case 'figure':
						let figureURL = this2.determineFigureURL(domNode);

						if( figureURL ) {
							return (
								<img alt='' className='inline-figure' src={figureURL}/>
							);
						}
						else {
							return (
								<br/>
							);
						}

					case 'h2':
						//FIXME: Annotations are currently hardcoded to folio 74/f19 for demo
						if(this2.props.navigationState[this2.props.side].currentFolioShortID === 'f19'){
							let text = this2.nodeTreeToString(domNode.children);
							let annotationType = "fieldNotes"; // fieldNotes | annotation | video
							let annotationContent = "This is a fieldNote annotation for: '"+text;
							annotationContent +="' Mauris laoreet purus ut urna ullamcorper fringilla. Morbi fermentum lectus ac dictum auctor. Suspendisse suscipit quam non arcu ultrices, vel dignissim tellus gravida. Nunc vitae odio lorem. Nulla nisl erat, laoreet vitae lectus quis, pharetra semper diam. In hac habitasse platea dictumst. Nullam id felis quis metus iaculis fermentum quis quis tortor. Proin maximus urna mi, non semper mauris fringilla eu. Vivamus eget lectus malesuada, commodo ex sit amet, finibus nunc. Pellentesque non ultrices magna. Proin molestie tempus diam, ac faucibus orci vulputate in. Donec tempor faucibus enim. Pellentesque facilisis ut mi sit amet cursus. Integer sollicitudin faucibus metus iaculis faucibus. Suspendisse in velit eget orci pretium placerat. Morbi rhoncus, libero ac convallis pellentesque, enim eros elementum leo, vitae suscipit mi nibh at sem."
							return (
								<Annotation headerContent={domToReact(domNode.children, parserOptions)}
											side={side}
											type={annotationType}>
												{annotationContent}
								</Annotation>
							);
						} else {
							return domNode;
						}

					/* linebreak  */
					case 'lb':
						return (<br/>);

					/* <m> gets replaced with <Gloss> */
					case 'm':
						let term = this2.nodeTreeToString(domNode.children);
							return (
							<Gloss side={side}
									 term={term}>
										 {domToReact(domNode.children, parserOptions)}
								</Gloss>
						);

					 default:
						 /* These are non-html, non-react tags that come from the XML, for now just replace with plain span */
						 if( unrecognizedTags.includes(domNode.name) ) {
							 return (
								 <span unrecognized_tag={domNode.name}>
									 {domToReact(domNode.children, parserOptions)}
								 </span>
							 );
						 }
						 /* Otherwise, Just pass through */
						 return domNode;
				 }
			 }
		 };
		 return parserOptions;
	}

	getTranscriptionData(transcription) {

		if( typeof transcription === 'undefined') return null;

		// Grid layout
		if( transcription.layout === 'grid' ) {
			return this.layoutGrid(transcription.html);

		// Margin layout
		} else if( transcription.layout === 'margin' ) {
			return this.layoutMargin(transcription.html);

		// None specified, pass on without any layout
		} else {
			return {
				content: transcription.html,
				layout: ""
			};
		}
	}

	// RENDER
	render() {
		// Retrofit - the folios are loaded asynchronously
		if(this.props.navigationState[this.props.side].currentFolioID === '-1') {
			return this.watermark();
		} else if(!this.state.isLoaded){
			this.loadFolio(this.props.document.getFolio(this.props.navigationState[this.props.side].currentFolioID));
			return this.watermark();
		} else {

			let transcriptionData = this.getTranscriptionData(this.state.folio.transcription[this.props.navigationState[this.props.side].transcriptionType]);

			if(!transcriptionData) {
				console.log("Undefined transcription for side: "+this.props.side);
				return this.watermark();
			}

			// Determine class and id for this component
			let thisClass = "transcriptionViewComponent "+this.props.side;
			let thisID = "transcriptionViewComponent_"+this.props.side;
			let side = this.props.side;

			if(transcriptionData.content.length !== 0){
				let surfaceClass = "surface";
				let surfaceStyle = {};

				// Handle grid mode
				if(this.props.navigationState[this.props.side].isGridMode) {
					surfaceClass += " grid-mode";
					surfaceStyle.gridTemplateAreas = transcriptionData.layout;
				}

				// Configure parser to replace certain tags with components
				let htmlToReactParserOptions = this.htmlToReactParserOptions(side);

				// Strip linebreaks except for tc (happens on string before parser)
				let content = transcriptionData.content;
				if(this.props.navigationState[side].transcriptionType !== 'tc'){
					content = content.replace(/(<br>|<br\/>|<lb>)/ig,"");
				}

				// If in searchmode, inject <mark> around searchterms
				if(this.props.navigationState.search.inSearchMode) {
					let taggedTerm="<mark>$1</mark>";
					let reg = "(" + this.props.navigationState.search.matched.toString().replace(/,/g,"|") + ")";
	        		let regex = new RegExp(reg, "giu");
					content = content.replace(regex,taggedTerm);
				}

				return (
					// Render the transcription
		      <div id={thisID} className={thisClass}>
		          <Navigation history={this.props.history} side={side}/>
      			  <div className="transcriptContent">
      			  	<Pagination side={side} className="pagination_upper"/>

								<div className={surfaceClass} style={surfaceStyle}>
									{Parser(content, htmlToReactParserOptions)}
								</div>

								<Pagination side={side} className="pagination_lower"/>
      			  </div>
		      </div>
				);
			} else {
				// Empty content
				return (
					<div className={thisClass} id={thisID}>
						<Navigation history={this.props.history} side={side}/>
						<div className="transcriptContent">
							<Pagination side={side} className="pagination_upper"/>
							{ this.watermark() }
						</div>
					</div>
				);
			}
		}
	}
}


function mapStateToProps(state) {
	return {
        navigationState: state.navigationState
    };
}

export default connect(mapStateToProps)(TranscriptionView);
