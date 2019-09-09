Making and Knowing Edition 
-----------

The Making and Knowing Project is a research and pedagogical initiative in the Center for Science and Society at Columbia University that explores the intersections between artistic making and scientific knowing. From 2014 through 2019, the Project’s focus is the creation of a digital critical edition of an intriguing anonymous sixteenth-century French artisanal and technical manuscript, BnF Ms. Fr. 640.

Installation
------



Steps:

1. Run yarn, and the cd into scripts and run yarn there.
2. Install rclone and pandoc via brew
3. Copy the edition_data_example directory to edition_data
4. Edit the config.json file, if necessary. The default version will work fine for a local installation.

```
{
    "editionDataURL": "http://localhost:4000/bnf-ms-fr-640",
    "targetDir": "public/bnf-ms-fr-640",
    "sourceDir": "edition_data/input",
    "workingDir": "edition_data/working"
}
```

5. In the edition_data directory, clone the m-k-manuscript-data repository.
6. Create the public/bnf-ms-fr-640 dir
7. Create the edition_data/working dir
8. Move the figures dir and the entries.json file to the target dir.
9. Create a .env.development file with the following:

```
REACT_APP_FOLIO_URL_PREFIX=https://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/
REACT_APP_EDITION_DATA_URL=http://localhost:4000/bnf-ms-fr-640
PORT=4000
```

Generating Edition Data
----------
Now, you are ready to generate some data.

1. Run scripts/asset_server local to populate the folios, search, glossary, and comments.

2. Run scripts/lizard


Deploying to a Server
---------------

1. Modify the editionDataURL to point at where you are hosting on the web
2. create a .env.production file with the following:

REACT_APP_FOLIO_URL_PREFIX=https://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/
REACT_APP_EDITION_DATA_URL=http://edition-staging.makingandknowing.org/bnf-ms-fr-640

(you must have .ssh key setup for server, modify Makefile to change IP)

3. `yarn build`
4. Run make deploy-staging OR make deploy-prod
