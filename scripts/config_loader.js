const fs = require('fs');

function load() {
    const configJSON = fs.readFileSync('edition_data/config.json', "utf8");
    return JSON.parse(configJSON);
}

// EXPORTS /////////////
module.exports.load = load;