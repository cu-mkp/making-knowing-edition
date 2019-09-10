Making and Knowing Edition 
======

The Making and Knowing Project is a research and pedagogical initiative in the Center for Science and Society at Columbia University that explores the intersections between artistic making and scientific knowing. From 2014 through 2019, the Project’s focus is the creation of a digital critical edition of an intriguing anonymous sixteenth-century French artisanal and technical manuscript, BnF Ms. Fr. 640.

This repository contains the website code and scripts to process the XML of the documentary edition, as well as the associated research essays. Once the site is compiled using the provided tools, it can be deployed as a static website with no special hosting requirements. 

Installation
------

In order to get the project running on you local machine, follow the steps below. Once you have a local environment, you can deploy a version of the edition to a server. If you want the server to automatically stay up to date, see the [MK Asset Server](https://github.com/performant-software/making-knowing-assetserver) project.

Note: These instructions call for using `brew` to install certain software, which is MacOS specifc. If you are installing on a different OS, please use the package manager appropriate to your OS.

Steps:

1. Run yarn, and the cd into scripts and run yarn there.

```
yarn 
cd scripts
yarn
```

1. You will need to set up and configure [rclone](https://rclone.org/) which provides rsync-like functionality. Set up rclone to have a destination called 'google' which is authorized to access the share. On my mac with homebrew and interactive session:  

```
brew install rclone  
rclone config
```

2. Install [PANDOC](https://pandoc.org/) .

```
brew install pandoc
```

3. Copy the edition_data_example directory to edition_data

```
cp -R edition_data_example edition_data
```

3. Edit the config.json file, if necessary. The default version will work fine for a local installation.

```
{
    "editionDataURL": "http://localhost:4000/bnf-ms-fr-640",
    "targetDir": "public/bnf-ms-fr-640",
    "sourceDir": "edition_data/m-k-manuscript-data",
    "workingDir": "edition_data/working"
}
```

4. Setup the necessary directory structure. 

```
mkdir public/bnf-ms-fr-640
mv edition_data/figures public/bnf-ms-fr-640 
mv edition_data/entries.json public/bnf-ms-fr-640 
mkdir edition_data/working
```

5. In the edition_data directory, clone the m-k-manuscript-data repository.

```
git clone https://github.com/cu-mkp/m-k-manuscript-data.git
```

9. Create a .env.development file with the following:

```
REACT_APP_FOLIO_URL_PREFIX=https://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/
REACT_APP_EDITION_DATA_URL=http://localhost:4000/bnf-ms-fr-640
PORT=4000
```

2. Create a .env.production file with the following:

```
REACT_APP_FOLIO_URL_PREFIX=https://gallica.bnf.fr/iiif/ark:/12148/btv1b10500001g/canvas/
REACT_APP_EDITION_DATA_URL=http://edition-staging.makingandknowing.org/bnf-ms-fr-640
```

Processing Edition Data
----------
Now, you are ready to process some data!

1. Run scripts/asset_server local to populate the folios, search, glossary, and comments.

2. Run scripts/lizard


Running Locally
-------

Once you have generated some data for the edition, you can start it locally:

```
yarn start
```

Deploying to a Server
---------------

1. Modify the editionDataURL to point at where you are hosting on the web
(you must have .ssh key setup for server, modify Makefile to change IP)

```
yarn build
make deploy-staging
```
