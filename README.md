# Making and Knowing Edition Website

This application is meant to build the Making and Knowing Edition Website on your local machine. It provides a [Gulp.js](http://gulpjs.com/) workflow with:

- Browsersync (live reload and synchronized browser testing)
- Concatenation and minification of CSS and JavaScript files
- Asset management is done by Yarn
- Deployment with rsync

Main technologies include Node.js, React, and BabelJS.

The final product is a completely static website with no technical dependencies
except outbound links to servers hosting the IIIF images, video, and photography.

In the browser, we are currently utilizing:

* React
* OpenSeaDragon

## System Preparation

To use this starter project, you'll need the following things installed on your machine.

### Required
[Git](https://git-scm.com)
[Ruby and Ruby Gems](https://rvm.io/rvm/install)
[Jekyll](http://jekyllrb.com/) - `gem install jekyll`
[Bundler](http://bundler.io/) - `gem install bundler` (mac users may need sudo)

[NodeJS](http://nodejs.org) - use the installer.
[Yarn](https://yarnpkg.com/en/docs/install) - follow installation instructions
[GulpJS](https://github.com/gulpjs/gulp) - `npm install -g gulp` (mac users may need sudo)

### Optional
[Composer](https://getcomposer.org) (installs PHPMailer)
[Make](https://www.gnu.org/software/make) (used with rsync for deploying)


## Local Installation

Git clone this repository, or download it into a directory of your choice. Inside the directory run
1. `yarn` (reference: package.json)
2. `bundle install` (reference: Gemfile and Gemfile.lock)
3. `composer install` (optional, reference: composer.json and composer.lock)

Do all that in one step: `make install` ('composer install' disabled by default)

## Usage

### Tasks
`yarn start`
This will build your Jekyll site, give you file watching, browser synchronization, auto-rebuild, CSS injecting, Sass sourcemaps etc.

`yarn build`
This builds your site for production, with minified CSS and JavaScript. Run this before you deploy your site!

`http://127.0.0.1.xip.io:3000`
Here you can access your site. If you want to access it with your phone or tablet, use the external access address which is showing up in the terminal window.

`http://127.0.0.1.xip.io:3001`
Access the Browsersync UI.


### Deployment
Rsync is used here to sync our local _site with the remote host. Adjust the SSH-USER, SSH-HOST and REMOTE-PATH in the Makefile.

Be careful with these settings since rsync is set to **delete** the files on the remote path!

Deploy with `make deploy`.

## Restrictions

### compress.html layout

Inline JavaScript can become broken where // comments used. Please remove the comments or change to /**/ style.
[compress.html Docs](http://jch.penibelst.de/)

## Credits

Site Framework based on [Foundation for Jekyll Sites](https://github.com/Foundation-for-Jekyll-sites)
