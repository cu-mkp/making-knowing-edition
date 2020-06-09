const fs = require('fs');
const csv = require('csvtojson');

const tagTypes = [ "al", "bp", "cn", "df", "env", "la", "m", "md", "ms", "mu", "pa", "pl", "pn", "pro", "sn", "tl", "tmp", "wp", "de", "el", "it", "oc", "po" ];

async function convert( entriesCSV, targetEntriesFile ) {

    const csvData = fs.readFileSync(entriesCSV, "utf8").toString()
    let entries = [];
    let ordinalID = 1;
    const tableObj = await csv({ delimiter: ',' }).fromString(csvData)        
    tableObj.forEach( entry => {
        let { div_id, folio, folio_display, heading_tc, heading_tcn, heading_tl, categories } = entry;

        // count up the number of mentions for each type
        let mentions = {};
        const text_references = { text_references_tc: {}, text_references_tcn: {}, text_references_tl: {}};
        tagTypes.forEach( tagType => {
            for( const transcriptionType of ['tc','tcn','tl'] ) {
                const tagKey = `${tagType}_${transcriptionType}`
                mentions[tagType] = entry[tagKey].length === 0 ? 0 : entry[tagKey].split(';').length;
                const references = entry[tagKey].replace( /;/g, "; ");
                text_references[`text_references_${transcriptionType}`][tagType] = references;    
            }
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
            ...text_references,
            categories: categoryNames
        });
    })
      
    fs.writeFile(targetEntriesFile, JSON.stringify(entries, null, 3), (err) => {
        if (err) throw err;
    });
    
}

// EXPORTS /////////////
module.exports.convert = convert;
