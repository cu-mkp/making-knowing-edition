README
------

Making and Knowing Edition Installation
-----------

Steps:

) Run yarn, and the cd into scripts and run yarn there.
) Install rclone and pandoc via brew
) Copy the edition_data_example directory to edition_data
) Edit the config.json file, if necessary. The default version will work fine for a local installation.

{
    "editionDataURL": "http://localhost:4000/bnf-ms-fr-640",
    "targetDir": "public/bnf-ms-fr-640",
    "sourceDir": "edition_data/input",
    "workingDir": "edition_data/working"
}

) In the edition_data directory, clone the m-k-manuscript-data repository.
) Create the public/bnf-ms-fr-640 dir
) Create the edition_data/working dir
) Move the figures dir and the entries.json file to the target dir.
) Create a .env.development file with the following:

REACT_APP_FOLIO_URL_PREFIX=https://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/
REACT_APP_EDITION_DATA_URL=http://localhost:4000/bnf-ms-fr-640
PORT=4000

Now, you are ready to generate some data.

) Run scripts/asset_server local to populate the folios, search, glossary, and comments.

) Run scripts/lizard

Making and Knowing Staging and Production
---------------

) Modify the editionDataURL to point at where you are hosting on the web
) create a .env.production file with the following:

REACT_APP_FOLIO_URL_PREFIX=https://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/
REACT_APP_EDITION_DATA_URL=http://edition-staging.makingandknowing.org/bnf-ms-fr-640

(you must have .ssh key setup for server, modify Makefile to change IP)

) Run make deploy-staging OR make deploy-prod
