module.exports = {
    apps : [
        {
            name      : 'asset_server',
            script    : 'scripts/asset_server.js',
            log       : 'edition_data/working/pm2_logfile.log'
        },
        {
            name      : 'lizard',
            script    : 'scripts/lizard.js',
            args      : 'run',
            log       : 'edition_data/working/lizard_pm2.log'
        }
    ]
};