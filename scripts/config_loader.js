const fs = require('fs');

function load() {
   console.log(`fs relative paths to current working directory`,process.cwd())
    const configJSON = fs.readFileSync('./making-knowing-edition/edition_data/config.json', "utf8");
    return JSON.parse(configJSON);
}

// EXPORTS /////////////
module.exports.load = load;