const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const transcriptionTypes = [
  'tc', 'tcn', 'tl'
];

let figureBaseURL;

const marginCodes = [
  'middle',
  'top',
  'left-middle',
  'right-middle',
  'bottom',
  'left-top',
  'right-top',
  'left-bottom',
  'right-bottom'
];

const figureSizes = [
  'x-small',
  'small',
  'medium',
  'large'
]

const hintCodes = [
  'tall',
  'extra-tall',
  'wide',
  'extra-wide'
];

function validLayoutCode( layoutCode ) {
  if( marginCodes.includes(layoutCode) ) {
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

function validFigureSize( figureSize ) {
  if( figureSizes.includes(figureSize) ) {
    return figureSize;
  } else {
    return 'medium';
  }
}

function htmlTemplate(xmlFilename) {
  // set title to the folio id
  let docTitle = path.basename(xmlFilename).split(".")[0];

  let template = '<!DOCTYPE html>';
  template +=	'<html>';
  template += 		'<head>';
  template += 			'<meta charset="utf-8"/>';
  template += 			'<title>'+docTitle+'</title>';
  template += 		'</head>';
  template += 		'<body>';
  template +=			'<folio layout=\"margin\">';
  template +=			'</folio>';
  template += 		'</body>';
  template +=	'</html>';
  return template;
}

function errorMessage(errorMessage) {
  errorMessage = errorMessage.replace(/\n/g,'<br/>');
  let template = '<!DOCTYPE html>';
  template +=	'<html>';
  template += 		'<head>';
  template += 			'<meta charset="utf-8"/>';
  template += 			'<title>Parsing Error</title>';
  template += 		'</head>';
  template += 		'<body>';
  template +=			'<folio layout=\"margin\">';
  template +=	      '<div id="error">';
  template +=	       '<h2>Error Parsing Transcription</h2>';
  template +=	       '<div data-layout="middle">'+errorMessage+'</div>';
  template +=	      '</div>';
  template +=			'</folio>';
  template += 		'</body>';
  template +=	'</html>';
  return template;
}

function findDataElement( parent, elementName ) {
  for( let child of parent.children ) {
    if( child.nodeName === elementName ) {
      return child.innerHTML;
    }
  }
  return null;
}

function findAndRemoveElement( parent, elementName ) {
  let elements = parent.querySelectorAll( elementName );
  for (let i = 0; i < elements.length; i++) {
    var el = elements[i];
    el.remove();
  }
}

function findAndReplaceElementName( htmlDoc, parent, oldElementName, newElementName ) {
  let elements = parent.querySelectorAll( oldElementName );
  for (let i = 0; i < elements.length; i++) {
    var el = elements[i];
    let newEl = htmlDoc.createElement(newElementName);
    newEl.innerHTML = el.innerHTML;
    el.replaceWith(newEl);
  }
}

function convertPhraseLevelMarkup( htmlDoc, el, elementName ) {
  let newEl = htmlDoc.createElement(elementName);
  newEl.innerHTML = el.innerHTML;
  const elMargin = el.getAttribute('margin')
  const elRender = el.getAttribute('render')
  if(elMargin) newEl.setAttribute('margin', elMargin)
  if(elRender) newEl.setAttribute('render', elRender)

  let elements = newEl.querySelectorAll( 'figure' );
  for (let i = 0; i < elements.length; i++) {
    const xmlFigureEl = elements[i];
    const htmlFigureEl = createFigureEl(htmlDoc, xmlFigureEl)
    xmlFigureEl.parentNode.replaceChild(htmlFigureEl,xmlFigureEl)
  }

  return newEl;
}

function parseLayout( el ) {
  let layout = validLayoutCode( el.getAttribute('margin') );
  let layoutHint = validLayoutHint( el.getAttribute('render') );
  if( layoutHint === 'extra-wide') {
    if( layout === 'top' ) {
      layout = 'left-top'
      layoutHint = 'wide'
    }
    if( layout === 'bottom' ) {
      layout = 'left-bottom'
      layoutHint = 'wide'
    }
  }
  return { layout, layoutHint }
}

function convertAB( htmlDoc, ab ) {
  let abDiv = convertPhraseLevelMarkup( htmlDoc, ab, 'div' );
  const { layout, layoutHint } = parseLayout(ab)
  abDiv.dataset.layout = layout
  if( layoutHint ) {
    abDiv.dataset.layoutHint = layoutHint;
  }  
  return abDiv;
}

function convertHead( htmlDoc, head ) {
  let h2Div = convertPhraseLevelMarkup( htmlDoc, head, 'h2' );
  const { layout, layoutHint } = parseLayout(h2Div)
  h2Div.dataset.layout = layout
  if( layoutHint ) {
    h2Div.dataset.layoutHint = layoutHint;
  }  
  return h2Div;
}

function createFigureEl( htmlDoc, figure ) {
  let figureID = figure.getAttribute('id');
  let figureURL = ( figureID ) ? `${figureBaseURL}/${figureID.substr(4)}.png` : null;
  let figureSize = validFigureSize( figure.getAttribute('size') );
  let figureEl = htmlDoc.createElement('figure');
  let imgEl = htmlDoc.createElement('img');
  imgEl.id = figureID;
  imgEl.setAttribute('alt','');
  imgEl.setAttribute('className',`${figureSize}-inline-figure`);
  imgEl.setAttribute('src', ( figureURL ) ? figureURL : "" );
  figureEl.appendChild(imgEl) 

  // if there are any captions inside the figure el, add them to span as fig captions
  let elements = figure.querySelectorAll( 'caption' );
  for (let i = 0; i < elements.length; i++) {
    const captionEl = elements[i];
    let figCapEl = htmlDoc.createElement('figcaption');
    figCapEl.innerHTML = captionEl.innerHTML
    figureEl.appendChild(figCapEl)
  }
  return figureEl;
}

function convertFigure( htmlDoc, figure ) {
  let figDiv = htmlDoc.createElement('div');
  figDiv.dataset.layout = validLayoutCode( figure.getAttribute('margin') );
  let figureEl = createFigureEl( htmlDoc, figure );
  figDiv.appendChild(figureEl);
  return figDiv;
}

function divMessage( htmlDoc, message ) {
  let contDiv = htmlDoc.createElement('div');
  contDiv.innerHTML = `<i>${message}</i>`;
  return contDiv;
}

// remove footnotes produced by Google Drive export to plain text
function squashFootnotes(xml) {
  // remove the footnote itself
  xml = xml.replace(/^\[[a-z]\].*$/gm,'');
  // remove the footnote marker from text body
  return xml.replace(/\[[a-z]\]/gm,'');
}

function convertXML(xml, fileID) {
  xml = squashFootnotes(xml);
  let xmlDOM = new JSDOM(`<xml>${xml}</xml>`, { contentType: "text/xml" });
  let xmlDoc = xmlDOM.window.document;

  // create a parallel HTML DOM and move elements from xml dom to html
  let htmlDOM = new JSDOM( htmlTemplate(fileID) );
  let htmlDoc = htmlDOM.window.document;

  let folio = htmlDoc.querySelector('folio');
  let divs = xmlDoc.querySelectorAll('div');

  for( let div of divs ) {
    let zoneDiv = htmlDoc.createElement('div');
    zoneDiv.id = div.getAttribute('id')
    processDivContinuation( 'continues', div, zoneDiv, htmlDoc )

    for( let child of div.children ) {
      if( child.nodeName === 'ab') {
        const ab = convertAB(htmlDoc, child)
        processABContinuation( 'continues', child, ab, htmlDoc )
        processABContinuation( 'continued', child, ab, htmlDoc )
        zoneDiv.appendChild( ab );
      }
      else if( child.nodeName === 'figure' ) {
        zoneDiv.appendChild( convertFigure(htmlDoc, child) );
      }
      else if( child.nodeName === 'head' ) {
        zoneDiv.appendChild( convertHead(htmlDoc, child) );
      }      
    }

    processDivContinuation( 'continued', div, zoneDiv, htmlDoc )

    // create a zone in the htmlDOM
    folio.appendChild(zoneDiv);
  }

  return htmlDOM.serialize();
}

function hasContinuation(el,continuationType) {
  return el.getAttribute(continuationType) === 'yes'
}

function continueMarker(continuationType, htmlDoc) {
  if( continuationType === 'continues' ) {
    return divMessage(htmlDoc, '...Continued')         
  } else {
    return divMessage(htmlDoc, 'Continued...')
  }
}

function processDivContinuation( continuationType, div, zoneDiv, htmlDoc ) {
  if( hasContinuation(div,continuationType) ) {

    // does it also have a continuation in ab?
    for( let child of div.children ) {
      if( child.nodeName === 'ab') {
        if( hasContinuation(child,continuationType) ) {
          // don't render, handle in ab
          return 
        }
      }
    }

    // append marker 
    zoneDiv.appendChild( continueMarker(continuationType, htmlDoc) )
  }
}

function processABContinuation( continuationType, child, ab, htmlDoc ) {
  if( hasContinuation(child,continuationType) ) {
    // position dependent on type
    if( continuationType === "continues") {
      ab.insertBefore( continueMarker( continuationType, htmlDoc ), ab.firstChild)
    } else {
      ab.appendChild( continueMarker( continuationType, htmlDoc ))
    }
  }
}

function convertFile( folioID, transcriptionType, xmlFile, htmlFile ) {
  const fileID = `${transcriptionType}_${folioID}`;
  if( !fs.existsSync(xmlFile) ) {
    const err = `Transcription file not found: ${fileID}`;
    fs.writeFileSync(htmlFile, errorMessage(err));
    console.log(err);
    return;
  }

  try {
    const xml = fs.readFileSync( xmlFile, "utf8");
    const html = convertXML(xml,fileID);
    fs.writeFileSync(htmlFile, html);
  } catch (err) {
    const errorMsg = errorMessage(err.toString());
    fs.writeFileSync(htmlFile, errorMsg);
    console.log(`Error converting: ${fileID}`);
  }
}

function convertFolios( folioPath, figureURL ) {
  figureBaseURL = figureURL
  const folios = fs.readdirSync(folioPath);
  folios.forEach( folioID => {
    // ignore hidden directories
    if( folioID.startsWith('.') ) return;

    // ignore the manifest file
    if( folioID.startsWith('manifest') ) return;

    transcriptionTypes.forEach( transcriptionType => {
      const folioOriginalXML = `${folioPath}/${folioID}/${transcriptionType}/original.txt`;
      const folioHTML = `${folioPath}/${folioID}/${transcriptionType}/index.html`;
      convertFile(folioID, transcriptionType, folioOriginalXML, folioHTML);
    });
  });
}


// EXPORTS /////////////
module.exports.convertFolios = convertFolios;
