const fs = require('fs');
const csv = require('csvtojson');

const tagTypes = [ "animal","body_part","currency","definition","environment","material","medical","measurement","music","plant","place","personal_name","profession","sensory","tool","time","weapon" ]

async function convert( entriesCSV, targetEntriesFile ) {

    const csvData = fs.readFileSync(entriesCSV).toString()
    let entries = [];
    let ordinalID = 1;
    const tableObj = await csv({ delimiter: ',' }).fromString(csvData)        
    tableObj.forEach( entry => {
        let { div_id, folio_display, heading_tc, heading_tcn, heading_tl, categories } = entry;

        // count up the number of mentions for each type
        let mentions = {};
        let text_references = {};
        tagTypes.forEach( tagType => {
            mentions[tagType] = entry[tagType].length === 0 ? 0 : entry[tagType].split(';').length;
            const references = entry[tagType].replace( /;/g, "; ");
            text_references[tagType] = references;
        });
        
        entries.push({
            id: ordinalID++,
            div_id,
            folio: folio_display, 
            heading_tc, 
            heading_tcn, 
            heading_tl,
            mentions,
            text_references,
            categories
        });
    })
      
    fs.writeFile(targetEntriesFile, JSON.stringify(entries, null, 3), (err) => {
        if (err) throw err;
    });
    
}

// EXPORTS /////////////
module.exports.convert = convert;
