import copyObject from '../lib/copyObject';

const ROW_CODES = ['a','b','c','d','e','f','g','h','i','j'];

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
    'full'
];

export function layoutMargin4( html ) {
    const emptyZoneFrame = [
        [ '.', '.', '.', '.' ],
        [ '.', '.', '.', '.' ],
        [ '.', '.', '.', '.' ]
    ];

    return layoutMargin( html, emptyZoneFrame, layoutDecoder4 )
}

export function layoutMargin3( html ) {
    const emptyZoneFrame = [
        [ '.', '.', '.' ],
        [ '.', '.', '.' ],
        [ '.', '.', '.' ]
    ];

    return layoutMargin( html, emptyZoneFrame, layoutDecoder3 )
}

function layoutDecoder4(layoutCode,zoneFrame,hint,block) {
    switch(layoutCode) {
        case 'top':
            zoneFrame[0][1] = block.id;
            if( hint === 'wide') {
                zoneFrame[0][2] = block.id;
            }
            if( hint === 'full') {
                zoneFrame[0][0] = block.id;
                zoneFrame[0][2] = block.id;
                zoneFrame[0][3] = block.id;
            }
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
            zoneFrame[1][3] = block.id;
            if( hint === 'tall')
                zoneFrame[2][3] = block.id;
            break;
        case 'bottom':
            zoneFrame[2][1] = block.id;
            zoneFrame[2][2] = block.id;
            if( hint === 'wide') {
                zoneFrame[2][3] = block.id;
            }
            if( hint === 'full') {
                zoneFrame[2][0] = block.id;
                zoneFrame[2][3] = block.id;
            }
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
            zoneFrame[0][3] = block.id;
            if( hint === 'tall')
                zoneFrame[1][3] = block.id;
            break;
        case 'left-bottom':
            zoneFrame[2][0] = block.id;
            if( hint === 'wide') {
                zoneFrame[2][1] = block.id;
                zoneFrame[2][2] = block.id;
            }
            break;
        case 'right-bottom':
            zoneFrame[2][3] = block.id;
            break;
        default:
            zoneFrame[1][1] = block.id;
            zoneFrame[1][2] = block.id;
            if( hint === 'wide') {
                zoneFrame[1][3] = block.id;
            }
            if( hint === 'full') {
                zoneFrame[1][0] = block.id;
                zoneFrame[1][3] = block.id;
            }
    }
}

function layoutDecoder3(layoutCode,zoneFrame,hint,block) {
    switch(layoutCode) {
        case 'top':
            zoneFrame[0][1] = block.id;
            if( hint === 'wide') {
                zoneFrame[0][2] = block.id;
            }
            if( hint === 'full') {
                zoneFrame[0][0] = block.id;
                zoneFrame[0][2] = block.id;
            }
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
            if( hint === 'wide') {
                zoneFrame[2][2] = block.id;
            }
            if( hint === 'full') {
                zoneFrame[2][0] = block.id;
                zoneFrame[2][2] = block.id;
            }
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
            if( hint === 'full') {
                zoneFrame[1][0] = block.id;
            }
    }
}

function layoutMargin( html, emptyZoneFrame, layoutDecoder ) {

    // load the surface into a DOM element to retrieve the grid data
    let folioDiv = document.createElement("div");
    folioDiv.innerHTML = html;
    let zones = folioDiv.children;

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
        for(let zone of zones) {
            // create a rolling frame that is ORed on to grid with each step
            let zoneFrame = copyObject( emptyZoneFrame );
            let marginFrame = copyObject( emptyMarginFrame );
            let entryID = zone.id;
            let blocks = zone.children;

            for(let block of blocks ) {
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
                layoutDecoder(layoutCode,zoneFrame,hint,block)
            }

            for( let blockSet of Object.values(marginFrame) ) {
                if( blockSet ) {
                    gridContent = gridContent.concat( renderBlockSet(blockSet) );
                }
            }

            // integrate frame into grid
            zoneGrid[rowIndex] = mergeRow( zoneFrame[0], zoneGrid[rowIndex] );
            zoneGrid[rowIndex+1] = mergeRow( zoneFrame[1], zoneGrid[rowIndex+1] );
            zoneGrid[rowIndex+2] = mergeRow( zoneFrame[2], zoneGrid[rowIndex+2] );
            rowIndex = rowIndex + 1;
        }
    }
    catch(error) {
        console.log(error);
    }

    let gridLayout = zoneGridToLayout( zoneGrid );

    // set the grid-template-areas
    return {
        content: gridContent,
        layout: gridLayout
    };
}

// transform zone grid into the grid layout string
function zoneGridToLayout( zoneGrid ) {
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

function renderBlockSet( blockSet ) {
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

function mergeRow( sourceRow, targetRow ) {
    if( targetRow ) {
        let result = [];
        for( let i = 0; i < 4; i++ ) {
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

/////////////
// WARNING: This code needs to be refactored, it hasn't been used in the project since early days
export function layoutGrid( html ) {
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
                // TODO renderBlock() definition missing, needs refactoring
                // gridContent = gridContent.concat( renderBlock(blockID, block) );
                let gridData = block.dataset.layout;
                if( typeof gridData !== "string" ) throw new Error(`Grid data not found for zone: ${block}`);
                let gridDataList = gridData.split(' ');
                for( let gridDatum of gridDataList ) {
                    let rowIndex = rowCodeToIndex(gridDatum[0]);
                    let columnIndex = columnCodeToIndex(gridDatum[1]);
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

    let gridLayout = zoneGridToLayout( zoneGrid );

    // set the grid-template-areas
    return {
        content: gridContent,
        layout: gridLayout
    };
}

function rowCodeToIndex( rowCode ) {
    if( typeof rowCode !== "string" || rowCode.length > 1 ) throw new Error('Invalid row code, must be a single letter.');
    let index = ROW_CODES.indexOf(rowCode.toLowerCase());
    if( index === -1 ) throw new Error('Invalid row code must be a letter a-j.');
    return index;
}

function columnCodeToIndex( columnCode ) {
    if( typeof columnCode !== "string" ) throw new Error('Invalid column code, must be a single digit.')
    let index = parseInt(columnCode,10) - 1;
    return index;
}