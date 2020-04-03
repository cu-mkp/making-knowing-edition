const fs = require('fs');

function load(targetName) {
    const configJSON = fs.readFileSync('edition_data/config.json', "utf8");
    const targets = JSON.parse(configJSON);
    return targets[targetName];
}

// EXPORTS /////////////
module.exports.load = load;