import React, { Component } from 'react';
import {connect} from 'react-redux';
import copyObject from '../lib/copyObject';
import Navigation from '../component/Navigation';
import Pagination from '../component/Pagination';
import EditorComment from '../component/EditorComment';
import Annotation from '../component/Annotation';
import Parser from 'html-react-parser';
import domToReact from 'html-react-parser/lib/dom-to-react';
import DocumentHelper from '../model/DocumentHelper';

class TranscriptionView extends Component {

	constructor(props) {
		super(props);
		this.ROW_CODES = ['a','b','c','d','e','f','g','h','i','j'];
		this.state = {folio:[], isLoaded:false, currentlyLoaded:''};
		this.contentChange=true;
		// window.loadingModal_stop();
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
				const folioID = this.props.documentView[this.props.side].iiifShortID;
				const folioURL = DocumentHelper.folioURL(folioID);
				this.setState({
					folio: folio,
					isLoaded: true,
					currentlyLoaded: folioURL
				});
			},(error) => {
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
		let zoneGridFinal = [ ...zoneGrid ];

		// ignore the first row if there are no block sets in it
		if( zoneGrid[0] && zoneGrid[0][0] === '.' && zoneGrid[0][1] === '.' & zoneGrid[0][1] === '.') {
			zoneGridFinal.shift();
		}

		let gridLayout = '';
		for (let row of zoneGridFinal) {
	  		let rowString = row.join(' ');
	  		gridLayout += ` '${rowString}'`;
		}
		return gridLayout;
	}

	renderBlockSet( blockSet ) {

		// use ID and class from the first block in the set
		let firstBlock = blockSet[0];
		let elementID = firstBlock.id;
		let entryID = firstBlock.attributes['data-entry-id'].value;
		let classStr = "";
		for( let i=0; i < firstBlock.classList.length; i++ ) {
	  		classStr = classStr + " " + firstBlock.classList.item(i);
		}

		// combine the blocks in the block set. divs are all merged into a single div
		// other element types become children of the single div.
		let el = `<div id="${elementID}" className="${classStr}" data-entry-id="${entryID}">`;
		for( let block of blockSet ) {
			block.setAttribute("className", "block");
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
		
		const hintCodes = [
			'tall',
			'extra-tall',
			'wide',
			'extra-wide'
		];

    let validLayoutCode = function( layoutCode ) {
      if( Object.keys(emptyMarginFrame).includes(layoutCode) ) {
        return layoutCode;
      } else {
        return 'middle';
      }
		};
		
		function validLayoutHint( layoutHint ) {
			if( hintCodes.includes(layoutHint) ) {
				return layoutHint;
			} else {
				return null;
			}
		}

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
				let entryID = zone.id;
        let blocks = zone.children;

        for( let block of blocks ) {
          let layoutCode = validLayoutCode(block.dataset.layout);
          let hint = validLayoutHint(block.dataset.layoutHint);
					block.setAttribute('data-entry-id', entryID);

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
							else if( hint === 'wide') {
									zoneFrame[1][1] = block.id;
									zoneFrame[1][2] = block.id;
							}
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
						  else if( hint === 'wide') {
									zoneFrame[0][1] = block.id;
									zoneFrame[0][2] = block.id;
							}
              break;
            case 'right-top':
              zoneFrame[0][2] = block.id;
              if( hint === 'tall')
                zoneFrame[1][2] = block.id;
              break;
            case 'left-bottom':
							zoneFrame[2][0] = block.id;
							if( hint === 'wide') {
								zoneFrame[2][1] = block.id;
								zoneFrame[2][2] = block.id;
							}
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
			const nextfolioID = nextProps.documentView[this.props.side].iiifShortID;
			const nextfolioURL = DocumentHelper.folioURL(nextfolioID);
  		if(this.state.currentlyLoaded !== nextfolioURL){
			this.contentChange=true;
			this.loadFolio(DocumentHelper.getFolio(this.props.document, nextfolioURL));
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

	htmlToReactParserOptions(side) {
		let this2=this;
		var parserOptions =  {
			 replace: function(domNode) {

				 switch (domNode.name) {
						case 'add':
							return (
								<span className='add'>
									{domToReact(domNode.children, parserOptions)}
								</span>
							);

						case 'comment':
							const commentID = ( domNode.children && domNode.children[0] ) ? domNode.children[0].data : null
							return (
								<EditorComment commentID={commentID}></EditorComment>
							);

						case 'corr':
							return (
								<span className='corr'>
									&#91;{domToReact(domNode.children, parserOptions)}&#93;
								</span>
							);

						case 'exp':
							return (
								<span className='exp'>
									&#123;{domToReact(domNode.children, parserOptions)}&#125;
								</span>
							);
							
						case 'h2':
							let entryID = domNode.attribs['data-entry-id'];
							const annotations = this2.props.annotations.annotationsByEntry[entryID];
							if( annotations ) { 
								const annotationID = annotations[0]; // for now, just take the first one
								const annotation = this2.props.annotations.annotations[annotationID];
								let annotationType = "annotation"; // fieldNotes | annotation | video
								return (
									<Annotation headerContent={domToReact(domNode.children, parserOptions)}
												side={side}
												type={annotationType}
												annotation={annotation}>
									</Annotation>
								);
							} else {
								return domNode;
							}

						case 'm':
							return( 
								<span style={{color: 'blue'}}>{domToReact(domNode.children, parserOptions)}</span>								
							);

						case 'man':
							return (
								<b>
									{domToReact(domNode.children, parserOptions)}
								</b>
							);

						case 'mark':
							return (
								<span>{domToReact(domNode.children, parserOptions)}</span>
							);

						case 'rub':
						return (
							<b>
								{domToReact(domNode.children, parserOptions)}
							</b>
						);

						case 'sup':
							return (
								<b>
									{domToReact(domNode.children, parserOptions)}
								</b>
							);
							
						default:
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
		const folioID = this.props.documentView[this.props.side].iiifShortID;
		if(folioID === '-1') {
			return this.watermark();
		} else if(!this.state.isLoaded){
			const folioURL = DocumentHelper.folioURL(folioID);
			this.loadFolio(DocumentHelper.getFolio( this.props.document, folioURL));
			return this.watermark();
		} else {

			let transcriptionData = this.getTranscriptionData(this.state.folio.transcription[this.props.documentView[this.props.side].transcriptionType]);

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
				if(this.props.documentView[this.props.side].isGridMode) {
					surfaceClass += " grid-mode";
					surfaceStyle.gridTemplateAreas = transcriptionData.layout;
				}

				// Configure parser to replace certain tags with components
				let htmlToReactParserOptions = this.htmlToReactParserOptions(side);

				// Strip linebreaks except for tc (happens on string before parser)
				let content = transcriptionData.content;
				const transcriptionType = this.props.documentView[side].transcriptionType;
				if(transcriptionType !== 'tc'){
					content = content.replace(/(<br>|<br\/>|<lb>)/ig,"");
				}

				// Mark any found search terms
				if(this.props.documentView.inSearchMode) {
					const searchResults = this.props.search.results[transcriptionType];
					const folioName = this.props.document.folioNameByIDIndex[folioID];
					const properFolioName = DocumentHelper.generateFolioID(folioName);
					content = this.props.search.index.markMatchedTerms(searchResults, 'folio', properFolioName, content);
				}

				return (
					// Render the transcription
		      <div id={thisID} className={thisClass}>
		          <Navigation side={side} documentView={this.props.documentView} documentViewActions={this.props.documentViewActions}/>
      			  <div className="transcriptContent">
      			  	<Pagination side={side} className="pagination_upper" documentView={this.props.documentView} documentViewActions={this.props.documentViewActions}/>

								<div className={surfaceClass} style={surfaceStyle}>
									{Parser(content,htmlToReactParserOptions)}
								</div>

								<Pagination side={side} className="pagination_lower" documentView={this.props.documentView} documentViewActions={this.props.documentViewActions}/>
      			  </div>
		      </div>
				);
			} else {
				// Empty content
				return (
					<div className={thisClass} id={thisID}>
						<Navigation side={side} documentView={this.props.documentView} documentViewActions={this.props.documentViewActions}/>
						<div className="transcriptContent">
							<Pagination side={side} className="pagination_upper" documentView={this.props.documentView} documentViewActions={this.props.documentViewActions}/>
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
				annotations: state.annotations,
				document: state.document,
				search: state.search
    };
}

export default connect(mapStateToProps)(TranscriptionView);
