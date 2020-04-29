const fs = require('fs');
const csv = require('csvtojson');

const tagTypes = [ "al", "bp", "cn", "def", "env", "m", "md", "ms", "mu", "pa", "pl", "pn", "pro", "sn", "tl", "tmp", "wp", "de", "ge", "it", "oc", "po" ];

async function convert( entriesCSV, targetEntriesFile ) {

    const csvData = fs.readFileSync(entriesCSV, "utf8").toString()
    let entries = [];
    let ordinalID = 1;
    const tableObj = await csv({ delimiter: ',' }).fromString(csvData)        
    tableObj.forEach( entry => {
        let { div_id, folio, folio_display, heading_tc, heading_tcn, heading_tl, categories } = entry;

        // count up the number of mentions for each type
        let mentions = {};
        let text_references = {};
        tagTypes.forEach( tagType => {
            const tagKey = `${tagType}_tc`
            mentions[tagType] = entry[tagKey].length === 0 ? 0 : entry[tagKey].split(';').length;
            const references = entry[tagKey].replace( /;/g, "; ");
            text_references[tagType] = references;
        });
        
        const categoryNames = categories.split(';');

        entries.push({
            id: ordinalID++,
            div_id,
            folio,
            folio_display, 
            heading_tc, 
            heading_tcn, 
            heading_tl,
            mentions,
            text_references,
            categories: categoryNames
        });
    })
      
    fs.writeFile(targetEntriesFile, JSON.stringify(entries, null, 3), (err) => {
        if (err) throw err;
    });
    
}

// EXPORTS /////////////
module.exports.convert = convert;
