#!/usr/bin/env node

/**
 * Static Essays Generator
 * Converts React-based essays to static HTML pages
 */

const fs = require('fs');
const path = require('path');

// Configuration  
const CONFIG = {
  dataDir: path.join(__dirname, '../public/bnf-ms-fr-640/staging061825-0'),
  outputDir: path.join(__dirname, '../static-essays'),
  baseUrl: 'https://edition-staging.makingandknowing.org',
  cssPath: '/css/index.css'
};

class StaticEssaysGenerator {
  constructor() {
    this.annotations = null;
    this.authors = null;
  }

  async generate() {
    console.log('🚀 Starting Static Essays Generation...');
    
    // Load data
    await this.loadData();
    
    // Create output directory
    this.ensureOutputDir();
    
    // Generate essays index page
    await this.generateEssaysIndex();
    
    // Generate individual essay pages
    await this.generateIndividualEssays();
    
    // Copy CSS and assets
    await this.copyAssets();
    
    console.log('✅ Static essays generation complete!');
    console.log(`📁 Output directory: ${CONFIG.outputDir}`);
  }

  async loadData() {
    console.log('📊 Loading essays data...');
    
    // Load annotations (essays metadata) - it's in the annotations subdirectory
    const annotationsPath = path.join(CONFIG.dataDir, 'annotations', 'annotations.json');
    const annotationsData = JSON.parse(fs.readFileSync(annotationsPath, 'utf8'));
    this.annotations = annotationsData.content; // The essays are in the 'content' array
    
    // Load authors data - also in annotations subdirectory
    const authorsPath = path.join(CONFIG.dataDir, 'annotations', 'authors.json');
    this.authors = JSON.parse(fs.readFileSync(authorsPath, 'utf8'));
    
    console.log(`   Loaded ${this.annotations.length} essays`);
    console.log(`   Loaded ${Object.keys(this.authors).length} authors`);
  }

  ensureOutputDir() {
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
    
    // Create essays subdirectory
    const essaysDir = path.join(CONFIG.outputDir, 'essays');
    if (!fs.existsSync(essaysDir)) {
      fs.mkdirSync(essaysDir, { recursive: true });
    }
  }

  async generateEssaysIndex() {
    console.log('📝 Generating essays index page...');
    
    // All items in annotations are essays, no need to filter by type
    const essays = this.annotations;
    
    const html = this.generateIndexHTML(essays);
    
    const outputPath = path.join(CONFIG.outputDir, 'essays', 'index.html');
    fs.writeFileSync(outputPath, html);
    
    console.log(`   Generated: ${outputPath}`);
  }

  generateIndexHTML(essays) {
    const essayCards = essays.map(essay => this.generateEssayCard(essay)).join('\\n');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Essays - Making and Knowing</title>
    <link href="${CONFIG.cssPath}" rel="stylesheet">
</head>
<body>
    <div id="content-page">
        <div class="bg-maroon-gradient accent-bar"></div>
        <div class="MuiPaper-root MuiPaper-elevation2 MuiPaper-rounded flex-parent jc-space-btw page-header text-bg-gradient-light-tb">
            <h1 class="page-title">Essays</h1>
        </div>
        <div id="content">
            <div id="annotation-list-view">
                <div class="flex-parent wrap jc-space-around">
                    ${essayCards}
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Essays page loaded with ${essays.length} essays');
        });
    </script>
</body>
</html>`;
  }

  generateEssayCard(essay) {
    const author = this.getAuthorName(essay.authorIDs);
    const thumbnailUrl = essay.s3ThumbUrl || '';
    const abstract = essay.abstract ? essay.abstract.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '';
    const title = essay.fullTitle || essay.name || essay.id;
    const theme = essay.theme || '';
    
    return `
        <div class="MuiPaper-root MuiPaper-elevation1 MuiPaper-rounded annotation-card">
            <div class="bg-maroon-gradient accent-bar"></div>
            <div class="MuiButtonBase-root MuiCardActionArea-root" onclick="window.location='${essay.id}.html'">
                <div class="MuiCardMedia-root" style="height: 200px; background-image: url('${thumbnailUrl}'); background-size: cover; background-position: center;"></div>
                <div class="card-lr-padding theme-title-container">
                    <p class="anno-theme">${theme}</p>
                    <p class="anno-title line-clamp">${title}</p>
                    <p class="anno-byline">${author}</p>
                </div>
            </div>
            <div class="card-lr-padding abstract-container">
                <span class="anno-abstract line-clamp three-lines">${abstract}</span>
                <div class="read-essay-link">
                    <a href="${essay.id}.html" class="cta-link with-icon light">Read Essay</a>
                </div>
            </div>
        </div>`;
  }

  getThumbnailStyle(essay) {
    // Use the s3ThumbUrl if available, otherwise try common patterns
    let thumbnailUrl = essay.s3ThumbUrl;
    
    if (!thumbnailUrl) {
      // Fallback to common patterns
      const possibleThumbnails = [
        `https://edition-assets.makingandknowing.org/thumbnails/${essay.id}_thumbnail.jpg`,
        `https://edition-assets.makingandknowing.org/thumbnails/${essay.id}_Thumbnail.jpg`,
        `https://edition-staging.makingandknowing.org/bnf-ms-fr-640/staging061825-0/annotations-thumbnails/${essay.id}_thumbnail.jpg`,
      ];
      thumbnailUrl = possibleThumbnails[0];
    }
    
    return `background-image: url('${thumbnailUrl}');`;
  }

  getAuthorName(authorIDs) {
    if (!authorIDs || !Array.isArray(authorIDs) || authorIDs.length === 0) {
      return 'Unknown Author';
    }
    
    // Get the names of all authors
    const authorNames = authorIDs.map(authorId => {
      if (!this.authors[authorId]) {
        return 'Unknown';
      }
      const author = this.authors[authorId];
      return `${author.first_name || ''} ${author.last_name || ''}`.trim();
    }).filter(name => name !== 'Unknown');
    
    return authorNames.length > 0 ? authorNames.join(', ') : 'Unknown Author';
  }

  async generateIndividualEssays() {
    console.log('📄 Generating individual essay pages...');
    
    // All annotations are essays
    const essays = this.annotations;
    
    for (const essay of essays) { // Generate ALL essays
      await this.generateIndividualEssay(essay);
    }
    
    console.log(`   Generated ${essays.length} individual essay pages`);
  }

  async generateIndividualEssay(essay) {
    const essayContentPath = path.join(CONFIG.dataDir, 'annotations', `${essay.id}.html`);
    
    let content = '<p>Essay content not found.</p>';
    if (fs.existsSync(essayContentPath)) {
      content = fs.readFileSync(essayContentPath, 'utf8');
    }
    
    const html = this.generateEssayHTML(essay, content);
    
    const outputPath = path.join(CONFIG.outputDir, 'essays', `${essay.id}.html`);
    fs.writeFileSync(outputPath, html);
  }

  generateEssayHTML(essay, content) {
    const author = this.getAuthorName(essay.authorIDs);
    const title = essay.fullTitle || essay.name || essay.id;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title} - Making and Knowing</title>
    <link href="${CONFIG.cssPath}" rel="stylesheet">
</head>
<body>
    <div id="content-page">
        <div class="bg-maroon-gradient accent-bar"></div>
        <div class="MuiPaper-root MuiPaper-elevation2 MuiPaper-rounded flex-parent jc-space-btw page-header text-bg-gradient-light-tb">
            <h1 class="page-title">${title}</h1>
            <div class="page-meta">
                <span class="page-author">By ${author}</span>
                ${essay.doi ? `<span class="page-doi">DOI: ${essay.doi}</span>` : ''}
            </div>
        </div>
        <div id="content">
            <div id="annotation-view">
                <div class="annotation-view-container">
                    <a href="index.html" class="back-link">← Back to Essays</a>
                    <div class="annotation-content">
                        ${content}
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <style>
        /* Essay-specific image styling to match React version */
        #annotation-view figure img {
            max-width: 100%;
            height: auto;
            border: 1px solid #DDDDDD;
            display: block;
            margin: 0 auto;
        }
        
        @media (min-width: 601px) and (max-width: 960px) {
            #annotation-view figure img {
                max-width: 500px;
            }
        }
        
        @media (min-width: 961px) {
            #annotation-view figure img {
                max-width: 600px;
            }
        }
        
        #annotation-view figure {
            margin: 20px 0;
            max-width: 100%;
            display: block;
            text-align: center;
        }
        
        #annotation-view figure .figure-image-container {
            padding: 0;
            margin: 0 auto;
            display: inline-block;
            cursor: pointer;
        }
        
        #annotation-view figure figcaption {
            line-height: 1.4;
            font-size: 11pt;
            text-align: left;
            max-width: 100%;
            margin-top: 8px;
            padding: 0 10px;
            color: #666;
        }
    </style>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Essay loaded: ${essay.id}');
            
            // Handle internal links  
            const links = document.querySelectorAll('a[href^="#"]');
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
        });
    </script>
</body>
</html>`;
  }

  async copyAssets() {
    console.log('📁 Copying CSS and assets...');
    
    // Copy main CSS file
    const cssSource = path.join(__dirname, '../public/css/index.css');
    const cssTarget = path.join(CONFIG.outputDir, 'css');
    
    if (fs.existsSync(cssSource)) {
      if (!fs.existsSync(cssTarget)) {
        fs.mkdirSync(cssTarget, { recursive: true });
      }
      fs.copyFileSync(cssSource, path.join(cssTarget, 'index.css'));
      console.log('   Copied CSS file');
    }
    
    // Could also copy images, fonts, etc. here
  }
}

// Run the generator
if (require.main === module) {
  const generator = new StaticEssaysGenerator();
  generator.generate().catch(console.error);
}

module.exports = StaticEssaysGenerator;