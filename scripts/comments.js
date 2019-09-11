const fs = require('fs');
const csv = require('csvtojson');

var generate = async function generate(commentsCSV,targetCommentsFile) {
    const csvData = fs.readFileSync(commentsCSV).toString();
    let comments = {};
    const tableObj = await csv().fromString(csvData)        
    tableObj.forEach( entry => {
        let comment = {
            id: entry['Comment-ID'],
            folio: entry['Folio'],
            tc: (entry['TC'] === 'X'),
            tcn: (entry['TCN'] === 'X'),
            tl: (entry['TL'] === 'X'),
            includeDCE: (entry['Include-DCE'] === 'X'),
            comment: entry['Comment']
        }

        comments[comment.id] = comment;
    });   
    
    
    // write out editorial comments
    fs.writeFileSync(targetCommentsFile, JSON.stringify(comments, null, 3), (err) => {
        if (err) {
            console.log(err)
        } 
    });

}

// EXPORTS /////////////
module.exports.generate = generate;
