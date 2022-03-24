# Making and Knowing Edition 

The Making and Knowing Project is a research and pedagogical initiative in the Center for Science and Society at Columbia University that explores the intersections between artistic making and scientific knowing. From 2014 through 2019, the Project’s focus is the creation of a digital critical edition of an intriguing anonymous sixteenth-century French artisanal and technical manuscript, BnF Ms. Fr. 640.

This repository contains the website code and scripts to process the XML of the documentary edition, as well as the associated research essays. Once the site is compiled using the provided tools, it can be deployed as a static website with no special hosting requirements. 

----

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

2. You will need to set up and configure rclone, which provides rsync-like functionality. Set up rclone to have a service called "mk-annotations" which is authorized to access the shared "Annotations" directory:

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

    You will need to specify a build ID and a working directory. We recommend using a formatted date for both: `MMDDYY-N` where MM=Month, DD=Date, YY=Year, N=builds on that date.

    ```json
    "local": {
            "buildID": "stagingMMDDYY-N",
            "editionDataURL": "http://localhost:4000/bnf-ms-fr-640",
            "targetDir": "public/bnf-ms-fr-640",
            "sourceDir": "edition_data/m-k-manuscript-data",
            "contentDir": "edition_data/edition-webpages",
            "workingDir": "edition_data/working/MMDDYY",
            "rclone": {
                "serviceName": "mk-annotations",
                "folderName": "Annotations",
                "sharedDrive": true
            },
            "releaseMode": "staging"
        }
    ```

    - Notes: 
        - If setting up a production build, ensure the `googleTrackingID` is set to a working Google Analytics ID.
        - If you are the owner of the "Annotations" folder (General Editor), set `sharedDrive` to `false`. Otherwise, leave it.


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
    cd ..
    ```

### Processing Edition Data

Now, you are ready to process some data!

Run `scripts/lizard.js sync` to download and prepare the edition data for your local machine.


### Running Locally

Once you have generated some data for the edition, you can start it locally:

```
yarn start
```

### Deploying to a Server

Run the following commands to prepare a build for deployment. You may replace "staging" with "production" for a production server.

```
scripts/lizard.js run staging
scripts/lizard.js migrate staging
yarn build
```

This should create a directory called `build` in the project root, which is the bundled, built project (i.e. `build/index.html` is the site root) that you can deploy to your server.

## Deployment guide
This guide assumes you've successfully set up your local development environment.

1) `git pull` the latest from the `./edition_data/...`
    * `m-k-manuscript-data`
        - **If this repo has changed**, run the following to add a new directory to the `edition_data/working/` director. The name of the directory will match the `MMDDYY-N` value of `edition_data/config.json.local.workingDir`. It's good practice to keep a copy of old `MMDDYY-N` directory as a back-up (but rename it).
		    * `scripts/lizard.js download`
			* `scripts/lizard.js download-thumbs`
    * `m-k-annotation-data`
    * `edition-webpages`
2) Run `scripts/lizard.js run`
    * This uses the `edition_data/working/MMDDYY-N` directory to generate all annotation html, process images from Google Drive, and create a local build in `./public/bnf-ms-fr-640`
3) Run `scripts/lizard.js migrate` 
    * If the annotation's `data_source` column is marked as `"gh"` in `annotation-metadata.csv` **and** the annotation's html file does **not** already exist in `./edition_data/m-k-annotation-data/html` then...
        * This script prepares all those annotation for migration away from the Google Drive workflow and to the Github / Amazon S3 workflow by...
            * Processing the html generated in step 2 (changes all `img` `src` attributes to an s3 url (via `edition-assets.makingandknowing.org` subdomain), injects the annotation's 'Abstract' & 'Cite As' elements, removes unnecessary elements, and makes html human readable)
            * Saving the newly processed html to `./edition_data/m-k-annotation-data/html` and replaces the annotation's html file in `./public`
            * Moving images from `./public` to a holding directory (`./edition_data/s3-images`) for later upload to the s3 bucket and deleting from `./public`
    * If the annotation is marked as `"gh"` **and** already exists in `./edition_data/m-k-annotation-data/html`, then the annotation is simply copied from `./edition_data/m-k-annotation-data/html` to `./public`
4) Run `yarn start` to test locally
5) Repeat steps 2 & 3 but run `scripts/lizard.js run [staging/production]` and `scripts/lizard.js migrate [staging/production]` instead
6) Upload all images moved to `./edition_data/s3-images` to the aws s3 bucket either through the ui or by running the following:
    ```
    aws s3 cp ./edition_data/s3-images/ s3://mk-annotation-images --recursive --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --profile [PROFILE NAME]
    ```
    * Then clear out contents of `./edition_data/s3-images`
7) Run `yarn build` (this will effectively copy `./public` to the `./build` directory)
8) Remove any unwanted builds from `./build/bnf-ms-fr-640`
9) `cd build` then upload `./build` to the aws s3 bucket either through the ui or by running the following:
    ```
    aws s3 cp . s3://edition640-dist/[BUILD ID] --recursive --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --profile [PROFILE NAME]
    ```
10) Update Amazon CloudFront (https://console.aws.amazon.com/cloudfront/home)
    * Find the desired environment by looking at the CNAMEs column and click its distribution ID
        * edition640... === production
        * edition-staging... === staging
        * edition-dev... === development
    * Click the `Origins and Origin Groups` tab
    * Check the only listed origin and then click the `Edit` button
    * Change the `Origin Path` to the new build id (i.e., the name of the directory in `./build` that you uploaded to aws)
    * Save that change, click the `Yes, Edit` button
11) After a minute or so, the site should be deployed!