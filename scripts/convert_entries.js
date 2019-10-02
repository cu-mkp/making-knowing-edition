const fs = require('fs');

//const baseDir = 'scripts/content_import/TEMP';
const baseDir = 'edition_data/';
const targetDir = 'public/bnf-ms-fr-640';
const tagTypes = [ "al", "bp", "cn", "env", "m", "ms", "pa", "pl", "pn", "pro", "sn", "tl", "md", "mu" ];

function main() {
    const entriesJSON = fs.readFileSync(`${baseDir}/entries.json`, "utf8");
    const entries = JSON.parse(entriesJSON);
    
    // EXAMPLE ENTRY
    // {
    //     "folio": "001r",
    //     "div_id": "p001r_1",
    //     "heading_tc": "",
    //     "heading_tcn": "",
    //     "heading_tl": "",
    //     "margin": "",
    //     "has_figures": "CONTAINS FIGURE",
    //     "continued": "",
    //     "continues": "",
    //     "al": "",
    //     "bp": "",
    //     "cn": "",
    //     "env": "",
    //     "m": "fleur de pastel",
    //     "ms": "",
    //     "pa": "pastel",
    //     "pl": "rue de la heaumerie a limage sainct claude;faulxbourgs de sainct germain;rue des escrivains;sainct Jaques de la boucherie",
    //     "pn": "Mestre Nicolas Coste;Mestre Jehan Cousin;Mestre Jehan Garnier",
    //     "pro": "mestre;courroyeur",
    //     "sn": "",
    //     "tl": "",
    //     "md": "",
    //     "mu": ""
    //   },

    let processedEntries = [];
    let ordinalID = 1;
    entries.forEach( entry => {
        let { folio, heading_tc, heading_tcn, heading_tl } = entry;

        // count up the number of mentions for each type
        let mentions = {};
        let text_references = {};
        tagTypes.forEach( tagType => {
            mentions[tagType] = entry[tagType].length === 0 ? 0 : entry[tagType].split(';').length;
            text_references[tagType] = entry[tagType];
        });
        
        processedEntries.push({
            id: ordinalID++,
            folio, 
            heading_tc, 
            heading_tcn, 
            heading_tl,
            mentions,
            text_references,
        });
    });
  
    fs.writeFile(`${targetDir}/entries.json`, JSON.stringify(processedEntries, null, 3), (err) => {
        if (err) throw err;
    });
}

///// RUN THE SCRIPT
main();