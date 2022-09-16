# Making and Knowing Edition

The Making and Knowing Project is a research and pedagogical initiative in the Center for Science and Society at Columbia University that explores the intersections between artistic making and scientific knowing. From 2014 through 2019, the Project’s focus is the creation of a digital critical edition of an intriguing anonymous sixteenth-century French artisanal and technical manuscript, BnF Ms. Fr. 640.

This repository contains the website code and scripts to process the XML of the documentary edition, as well as the associated research essays. Once the site is compiled using the provided tools, it can be deployed as a static website with no special hosting requirements.

## Contents

- [Getting started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Processing edition data](#processing-edition-data)
  - [Running locally](#running-locally)
  - [Deploying to a server](#deploying-to-a-server)
- [Deployment guide](#deployment-guide)
  - [Preparing a build](#preparing-a-build)
  - [Uploading to S3 and deploying with CloudFront](#uploading-to-s3-and-deploying-with-cloudfront)
- [Publishing Google Drive content to GitHub](#publishing-google-drive-content-to-github)

## Getting started

### Requirements

- [Node](https://nodejs.org/en/download/package-manager/) v14.x with NPM v7.x
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install) v1.22.x (recommended: 1.22.18)
  - It is recommended to install this with npm: `npm install --global yarn@1.22.x`
- [Rclone](https://rclone.org/install/) v1.56+ (recommended: 1.58.0)
- [Pandoc](https://pandoc.org/installing.html) 2.14+ (recommended: 2.17.1)

<details><summary>A note on versions</summary>

The specified versions are minimum tested versions, while the "recommended" versions are the newest tested. There may be newer versions that will still work, but not necessarily: in the case of Yarn, you must use Yarn 1.x rather than 2.x.

If installing with package managers, ensure the correct versions are pulled. For example, using [Homebrew](https://brew.sh/) on MacOS:

```sh
brew install pandoc@2.17.1
```

or using apt-get on Linux:

```sh
sudo apt-get install pandoc=2.17.1
```

If the specified version is not available from your preferred package manager, you may follow manual installation instructions from the linked project websites. To check an installed version, typically the `--version` flag will work, for example:

```sh
pandoc --version
```

</details>

### Installation

In order to get the project running on your local machine, follow the steps below. Once you have a local environment, you can deploy a version of the edition to a server. (If you want the server to automatically stay up to date, see the [MK Asset Server](https://github.com/performant-software/making-knowing-assetserver) project; though note that it has not been tested recently.)

1. Run `yarn install` in the project root directory and the `scripts` subdirectory.

   ```sh
   yarn install && yarn --cwd scripts install
   ```

2. You will need to set up and configure rclone, which provides rsync-like functionality. Set up rclone to have a service called "mk-annotations" which is authorized to access the shared "Annotations" directory by following the directions below. To check if you have previously done this (and thus do not need to set up and configure again), run `rclone mk-annotations:` to make sure rclone is able to connect to the Google Drive. This will give a listing of folders if successful. Otherwise, set up and configure the service:

   1. Follow the [instructions to make a Google Drive client ID](https://rclone.org/drive/#making-your-own-client-id) (ensure that the user account performing these actions has access to the "Annotations" folder in Google Drive)
   2. In a terminal, run the config wizard with the command
      ```sh
      rclone config
      ```
   3. Enter `n` for "New config"
   4. Enter `mk-annotations` for the name
   5. Enter `drive` for Google Drive
   6. Enter your client ID from Google
   7. Enter your client secret from Google
   8. Enter `drive` for "drive" scope
   9. Keep pressing enter to leave the rest as defaults
   10. You should get to a step that opens a browser window with Google authorization. Authorize rclone for the requested permissions. Then, back in the config wizard, continue pressing enter to leave the rest as defaults.
   11. You should see a list with one remote of "drive" type, named "mk-annotations"
   12. Enter `q` to quit the config wizard
 
3. In the project root directory, copy the `edition_data_example` directory to `edition_data`

   ```sh
   cp -R edition_data_example edition_data
   ```

4. Open `edition_data/config.json` in your preferred text editor, for example:

   ```sh
   vi edition_data/config.json
   ```

   Edit the configuration for each environment, for example, the local environment:

   ```json
   "local": {
      "buildID": "stagingMMDDYY-N",
      "editionDataURL": "http://localhost:4000/bnf-ms-fr-640",
      "assetServerURL": "https://edition-assets.makingandknowing.org",
      "targetDir": "public/bnf-ms-fr-640",
      "sourceDir": "edition_data/m-k-manuscript-data",
      "contentDir": "edition_data/edition-webpages",
      "workingDir": "edition_data/working/MMDDYY",
      "rclone": {
         "serviceName": "mk-annotations",
         "folderName": "Annotations",
         "sharedDrive": true
      },
      "website": {
         "contentEnabled": true,
         "essaysEnabled": true,
         "manuscriptEnabled": true,
         "searchEnabled": true
      },
      "releaseMode": "staging"
   }
   ```

   - You will need to specify a build ID (`buildID`) and a working directory (`workingDir`). We recommend using a formatted date for both: `MMDDYY-N` where MM=Month, DD=Date, YY=Year, N=builds on that date.
   - Depending on what kinds of content you would like to make available in the edition, you may provide values of `true` or `false` to the four options under `"website"`.
      - `contentEnabled` refers to static site markdown content in the directory specified for the `contentDir` option.
      - `essaysEnabled` refers to the annotations in the Google Drive data pulled by rclone.
      - `manuscriptEnabled` refers to the manuscript data in the directory specified for the `sourceDir` option.
      - `searchEnabled` refers to the search features in the edition.
   - Explanations of other `config.json` options:
      - The `editionDataURL` setting is used to insert the root URL of the hosted edition. The defaults for staging and production assume deployment to S3 with existing CloudFront distributions. These may be changed if deploying elsewhere.
      - Similarly, the `assetServerURL` setting is used to build image asset URLs to refer their locations on the asset server. The default setting refers to the Making and Knowing S3 asset CloudFront distribution, but this may be changed if hosting images elsewhere.
         - Note that this will only affect new migrations from Google Drive. Essays already in GitHub will retain the `assetServerURL` that was in place when they were first migrated. See the [note on asset URLs](#deploying-to-a-server) for more info.
   - If your Google Drive account is the owner of the "Annotations" folder (i.e. General Editor), set `sharedDrive` to `false`. Otherwise, leave it as `true`.
   - If setting up a production build, ensure the `googleTrackingID` is set to a working Google Analytics ID.

5. From the project root directory, set up the necessary directory structure:

   ```sh
   mkdir public/bnf-ms-fr-640
   mkdir edition_data/working
   ```

6. In the `edition_data` directory, clone the needed repositories. The third will require a GitHub authentication token or SSH key as it is a private repo.

   ```sh
   cd edition_data
   git clone https://github.com/cu-mkp/m-k-manuscript-data.git
   git clone https://github.com/cu-mkp/edition-webpages.git
   git clone https://github.com/cu-mkp/m-k-annotation-data.git
   cd .. # return to the project root
   ```

### Processing edition data

Now, you are ready to process some data!

Run `scripts/lizard.js sync` to download and prepare the edition data for your local machine.

### Running locally

Once you have generated some data for the edition, you can start it locally:

```
yarn start
```

### Deploying to a server

Run the following commands to prepare a build for your first deployment. You may replace "staging" with "production" for a production server.

```
scripts/lizard.js run staging
scripts/lizard.js migrate staging
yarn build
```

This should create a directory called `build` in the project root, which is the bundled, built project that you can deploy to your server (i.e. `build/index.html` is the site root).

<details>
<summary>Note on asset URLs and internal links</summary>

If you need to alter the `assetServerURL`, note that all essays already in the GitHub `m-k-annotation-data` repo will still retain the original S3/CloudFront asset server URL (`https://edition-assets.makingandknowing.org`) setting from their initial migration. Thus, after running the `yarn build` script, you will need to search for all instances of that URL in the `build` directory, and replace it with your new URL. Otherwise, you may run into CORS issues.

To permanently migrate essays to a new `assetServerURL`, you will need to make the same change across all essays in the `m-k-annotation-data` repo, as those are not overwritten or modified by any code here after initial migration.

The same goes for many internal links across the static site, which refer to the production site (essays) or the `editionDataURL` (other static content). These may need to be manually altered when deployed to a different server.

Note also that values are pulled from `edition_data/config.json` to populate `.env.*` files, so do not alter any `.env` files directly.

</details>

## Deployment guide

This guide assumes you've followed the instructions above and successfully set up your local development environment. This guide should be used for all future deployments after initial setup.

### Preparing a build

1. Navigate to the `edition_data` directory
2. Update `config.json` 
     1. Specify a build ID (`buildID`) and a working directory (`workingDir`). We recommend using a formatted date for both: `MMDDYY-N` where MM=Month, DD=Date, YY=Year, N=builds on that date.
3. Pull the latest data from each repo:

   ```sh
   cd edition_data
   cd m-k-annotation-data && git pull && cd ..
   cd m-k-manuscript-data && git pull && cd ..
   cd edition-webpages && git pull && cd ..
   cd .. # return to the project root
   ```

4. For each repo, check out the tagged release you want to use for the deployment. Otherwise, you will be using code and data from the `master` branch. For example. to use a tag named `v1.2.3` on the `m-k-annotation-data` repo:

   ```sh
   cd edition_data
   cd m-k-annotation-data
   git fetch --all --tags
   git checkout v1.2.3
   cd ../.. # return to the project root
   ```

   > Note: This will put you in "detached HEAD" state for this repo, meaning you are not on a branch, so any commits made here will be lost. Be sure to switch to a branch before making any commits.
   >
   > If you want to immediately start working on a new branch, you can use `git checkout v1.2.3 -b new-branch-name` instead. This might be useful if you are, for example, migrating new annotations to GitHub from Google Drive.

5. Run the sync script from the project root:

   ```sh
   scripts/lizard.js sync
   ```

   - This uses the `./edition_data/working/MMDDYY-N` directory to generate all annotation html, process images from Google Drive, and create a local build in `./public/bnf-ms-fr-640`.
       <details>
       <summary>Details on how this works</summary>

     - If the annotation's `data_source` column is marked as `"gh"` in `annotation-metadata.csv` **and** the annotation's html file does **not** already exist in `./edition_data/m-k-annotation-data/html` then...
       - This script prepares all those annotation for migration away from the Google Drive workflow and to the GitHub workflow by...
         - Processing the html generated in step 2 (changes all `img` `src` attributes to an asset url (via `assetServerURL`), injects the annotation's 'Abstract' & 'Cite As' elements, removes unnecessary elements, and makes html human readable)
         - Saving the newly processed html to `./edition_data/m-k-annotation-data/html` and replaces the annotation's html file in `./public`
         - Moving images from `./public` to a holding directory (`./edition_data/s3-images`) for later upload to the s3 bucket and deleting from `./public`
     - If the annotation is marked as `"gh"` **and** already exists in `./edition_data/m-k-annotation-data/html`, then the annotation is simply copied from `./edition_data/m-k-annotation-data/html` to `./public`
     </details>

6. Run the start script to test locally:
   ```sh
   yarn start
   ```
7. Run the `run` and `migrate` scripts for the environment you are deploying to, i.e. for staging:
   ```sh
   scripts/lizard.js run staging
   scripts/lizard.js migrate staging
   ```
   or for production:
   ```sh
   scripts/lizard.js run production
   scripts/lizard.js migrate production
   ```
8. Run the build script to produce a bundle built from your files in `./public` and output to the `./build` directory:
   ```sh
   yarn build
   ```
9. Remove any unwanted builds from `./build/bnf-ms-fr-640` (i.e. any that aren't for the date and the environment you are currently building for).

### Uploading to S3 and deploying with CloudFront

The following steps may differ if you are deploying on your own server, but these are the exact steps needed for S3 and CloudFront. To use the AWS CLI, you must [install it](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and [set it up](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html). Though, it is also possible to do the following in the S3 user interface.

1. From the project root, upload all images in `./edition_data/s3-images` to the `mk-annotation-images` AWS S3 bucket, either through the S3 UI or by running the following in the AWS CLI:

   ```sh
   aws s3 cp ./edition_data/s3-images/ s3://mk-annotation-images --recursive --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
   ```

   Then clear out the contents of `s3-images`:

   ```sh
   rm -rf ./edition_data/s3-images/*
   ```

2. Upload the contents of the `./build` directory to the `edition640-dist` AWS S3 bucket with a key identical to your build ID, either through the UI, or by running the following.

   > Note: `[staging/production]MMDDYY-N` is your Build ID, and should be identical to the folder name in `./build`.

   ```sh
   cd build
   aws s3 cp . s3://edition640-dist/[staging/production]MMDDYY-N --recursive --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
   cd .. # return to the project root
   ```

3. Update the appropriate Amazon CloudFront (https://console.aws.amazon.com/cloudfront/home) distribution with the new build:
   1. Find the desired environment by looking at the CNAMEs column and click its distribution ID
      - edition640... === production
      - edition-staging... === staging
      - edition-dev... === development
   2. Click the `Origins and Origin Groups` tab
   3. Check the only listed origin and then click the `Edit` button
   4. Change the `Origin Path` to the new build id (i.e., the name of the directory in `./build` that you uploaded to S3)
   5. Save that change, click the `Yes, Edit` button
4. After a few minutes or so, the site should be deployed!

## Publishing Google Drive content to GitHub

If you have followed the above guides, and there were any essays marked as "github" in `metadata.csv` that had not yet been migrated from Google Drive, you will have populated `./edition_data/m-k-annotation-data` with new content.

It is recommended to publish this content to GitHub so that it will not have to be pulled from Google Drive again in the future. First, to check if there are indeed changes, run the following from the project root:

```sh
cd ./edition_data/m-k-annotation-data
git status
```

This should show any files that have changed: if working properly, and migrations were required, it should list new HTML files corresponding to any newly migrated Google Drive essays. You may want to open these files to make sure they look correct at a glance.

> Note: recall the [above note about `assetServerURL`](#deploying-to-a-server). If you changed this setting in your configuration, ensure that *all* URLs for images in the essays you are about to publish use the same asset server URL as those already in the `m-k-annotation-data` repo. If they do not match, update the new essays' HTML to use the old URLs before continuing; or vice versa. These must at least be consistent across the repo, even if not all using the `https://edition-assets.makingandknowing.org/` URL.

If all looks good, and you are ready to publish, you can do the following:
```sh
git checkout master && git pull # just to make sure we are on the latest master branch
git add .
git commit -m "Add new migrated essays from Google Drive"
git push origin master
```

This will publish them to the master branch on GitHub.
