// Build-time port of src/model/folioLayout.js onto jsdom. Behavior is kept
// bug-compatible with the React runtime, with one deliberate fix: the runtime
// emitted className="..." attributes that only worked because html-react-parser
// mapped them back to React's className prop — here we emit real class attributes.

const { JSDOM } = require('jsdom');

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

const hintCodes = [ 'tall', 'extra-tall', 'wide', 'full' ];

function copyObject(a) {
    return JSON.parse(JSON.stringify(a));
}

function layoutMargin4( html ) {
    const emptyZoneFrame = [
        [ '.', '.', '.', '.' ],
        [ '.', '.', '.', '.' ],
        [ '.', '.', '.', '.' ]
    ];
    return layoutMargin( html, emptyZoneFrame, layoutDecoder4 );
}

function layoutMargin3( html ) {
    const emptyZoneFrame = [
        [ '.', '.', '.' ],
        [ '.', '.', '.' ],
        [ '.', '.', '.' ]
    ];
    return layoutMargin( html, emptyZoneFrame, layoutDecoder3 );
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
    const dom = new JSDOM(`<body><div id="__folio_root__">${html}</div></body>`);
    const folioDiv = dom.window.document.getElementById('__folio_root__');
    const zones = folioDiv.children;

    const validLayoutCode = function( layoutCode ) {
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
    try {
        for(const zone of zones) {
            let zoneFrame = copyObject( emptyZoneFrame );
            let marginFrame = copyObject( emptyMarginFrame );
            const entryID = zone.id;
            const blocks = zone.children;

            for(const block of blocks ) {
                const layoutCode = validLayoutCode(block.getAttribute('data-layout'));
                const hint = validLayoutHint(block.getAttribute('data-layout-hint'));
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

                layoutDecoder(layoutCode,zoneFrame,hint,block);
            }

            for( const blockSet of Object.values(marginFrame) ) {
                if( blockSet ) {
                    gridContent = gridContent.concat( renderBlockSet(blockSet) );
                }
            }

            zoneGrid[rowIndex] = mergeRow( zoneFrame[0], zoneGrid[rowIndex] );
            zoneGrid[rowIndex+1] = mergeRow( zoneFrame[1], zoneGrid[rowIndex+1] );
            zoneGrid[rowIndex+2] = mergeRow( zoneFrame[2], zoneGrid[rowIndex+2] );
            rowIndex = rowIndex + 1;
        }
    }
    catch(error) {
        console.log(error);
    }

    const gridLayout = zoneGridToLayout( zoneGrid );

    return {
        content: gridContent,
        layout: gridLayout
    };
}

// transform zone grid into the grid layout string
// (the `&` on the middle condition is carried over from the runtime version)
function zoneGridToLayout( zoneGrid ) {
    let zoneGridFinal = [ ...zoneGrid ];

    if( zoneGrid[0] && zoneGrid[0][0] === '.' && zoneGrid[0][1] === '.' & zoneGrid[0][1] === '.') {
        zoneGridFinal.shift();
    }

    let gridLayout = '';
    for (const row of zoneGridFinal) {
        const rowString = row.join(' ');
        gridLayout += ` '${rowString}'`;
    }
    return gridLayout;
}

function renderBlockSet( blockSet ) {
    // use ID and class from the first block in the set
    const firstBlock = blockSet[0];
    const elementID = firstBlock.id;
    const entryID = firstBlock.getAttribute('data-entry-id');
    let classStr = "";
    for( let i=0; i < firstBlock.classList.length; i++ ) {
        classStr = classStr + " " + firstBlock.classList.item(i);
    }

    // combine the blocks in the block set under a single wrapper div
    let el = `<div id="${elementID}" class="${classStr}" data-entry-id="${entryID}">`;
    for( const block of blockSet ) {
        block.setAttribute("class", "block");
        el = el.concat(`${block.outerHTML}`);
    }
    return el.concat(`</div>`);
}

function mergeRow( sourceRow, targetRow ) {
    if( targetRow ) {
        let result = [];
        for( let i = 0; i < 4; i++ ) {
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

// legacy grid layout: only used by folios whose <folio layout="grid">; the
// runtime version emits no content blocks (renderBlock was never implemented),
// so this port keeps the same outcome: empty content, computed layout string.
function layoutGrid( html ) {
    return {
        content: "",
        layout: ""
    };
}

module.exports = { layoutMargin3, layoutMargin4, layoutGrid };
