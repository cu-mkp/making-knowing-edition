#!/usr/bin/env node

/**
 * Static Essays Generator
 * Converts React-based essays to static HTML pages
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  dataDir: path.join(__dirname, '../public/bnf-ms-fr-640/staging031824-0'),
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
    
    // Load annotations (essays metadata)
    const annotationsPath = path.join(CONFIG.dataDir, 'annotations.json');
    this.annotations = JSON.parse(fs.readFileSync(annotationsPath, 'utf8'));
    
    // Load authors data
    const authorsPath = path.join(CONFIG.dataDir, 'authors.json');
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
    
    const essays = this.annotations.filter(ann => ann.type === 'essay');
    
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
    <style>
        /* Essays-specific styles */
        .essays-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .essays-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .essay-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            transition: box-shadow 0.2s;
        }
        .essay-card:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .essay-thumbnail {
            width: 100%;
            height: 200px;
            background-size: cover;
            background-position: center;
            background-color: #f5f5f5;
            border: 1px solid #eee;
        }
        .essay-content {
            padding: 16px;
        }
        .essay-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
            line-height: 1.3;
        }
        .essay-author {
            color: #666;
            font-size: 14px;
            margin: 0 0 8px 0;
        }
        .essay-abstract {
            color: #777;
            font-size: 14px;
            line-height: 1.4;
            margin: 0;
        }
        .essays-header {
            text-align: center;
            margin-bottom: 40px;
        }
        .essays-title {
            font-size: 36px;
            margin: 0 0 16px 0;
            color: #333;
        }
        .essays-subtitle {
            font-size: 18px;
            color: #666;
            margin: 0;
        }
        
        /* Search functionality */
        .search-container {
            margin: 20px 0;
            text-align: center;
        }
        .search-input {
            padding: 12px 16px;
            font-size: 16px;
            border: 2px solid #ddd;
            border-radius: 25px;
            width: 100%;
            max-width: 400px;
        }
        .search-input:focus {
            outline: none;
            border-color: #007bff;
        }
    </style>
</head>
<body>
    <div class="essays-container">
        <header class="essays-header">
            <h1 class="essays-title">Essays</h1>
            <p class="essays-subtitle">Research articles and commentary from the Making and Knowing Project</p>
        </header>
        
        <div class="search-container">
            <input type="text" id="search-input" class="search-input" 
                   placeholder="Search essays..." 
                   onkeyup="searchEssays()">
        </div>
        
        <div class="essays-grid" id="essays-grid">
            ${essayCards}
        </div>
    </div>
    
    <script>
        // Simple client-side search
        function searchEssays() {
            const query = document.getElementById('search-input').value.toLowerCase();
            const cards = document.querySelectorAll('.essay-card');
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                const matches = text.includes(query);
                card.style.display = matches ? 'block' : 'none';
            });
        }
        
        // Initialize search on page load
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Essays page loaded with ${essays.length} essays');
        });
    </script>
</body>
</html>`;
  }

  generateEssayCard(essay) {
    const author = this.getAuthorName(essay.author);
    const thumbnailStyle = this.getThumbnailStyle(essay);
    const abstract = essay.abstract ? essay.abstract.substring(0, 200) + '...' : '';
    
    return `
        <article class="essay-card">
            <a href="${essay.id}.html" style="text-decoration: none; color: inherit;">
                <div class="essay-thumbnail" style="${thumbnailStyle}"></div>
                <div class="essay-content">
                    <h2 class="essay-title">${essay.title || essay.id}</h2>
                    <p class="essay-author">${author}</p>
                    <p class="essay-abstract">${abstract}</p>
                </div>
            </a>
        </article>`;
  }

  getThumbnailStyle(essay) {
    // Try to determine thumbnail URL based on existing patterns
    const possibleThumbnails = [
      `https://edition-assets.makingandknowing.org/thumbnails/${essay.id}_thumbnail.jpg`,
      `https://edition-assets.makingandknowing.org/thumbnails/${essay.id}_Thumbnail.jpg`,
      `https://edition-staging.makingandknowing.org/bnf-ms-fr-640/staging061825-6/annotations-thumbnails/${essay.id}_thumbnail.jpg`,
    ];
    
    // For demo purposes, use the first URL pattern
    // In production, you'd want to check which URLs actually exist
    const thumbnailUrl = possibleThumbnails[0];
    
    return `background-image: url('${thumbnailUrl}');`;
  }

  getAuthorName(authorId) {
    if (!authorId || !this.authors[authorId]) {
      return 'Unknown Author';
    }
    
    const author = this.authors[authorId];
    return `${author.first_name || ''} ${author.last_name || ''}`.trim();
  }

  async generateIndividualEssays() {
    console.log('📄 Generating individual essay pages...');
    
    const essays = this.annotations.filter(ann => ann.type === 'essay');
    
    for (const essay of essays.slice(0, 5)) { // Generate first 5 for demo
      await this.generateIndividualEssay(essay);
    }
    
    console.log(`   Generated ${Math.min(5, essays.length)} individual essay pages`);
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
    const author = this.getAuthorName(essay.author);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${essay.title || essay.id} - Making and Knowing</title>
    <link href="${CONFIG.cssPath}" rel="stylesheet">
    <style>
        .essay-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .essay-header {
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .essay-title {
            font-size: 32px;
            margin: 0 0 16px 0;
            line-height: 1.2;
        }
        .essay-author {
            font-size: 18px;
            color: #666;
            margin: 0 0 8px 0;
        }
        .essay-meta {
            font-size: 14px;
            color: #999;
        }
        .essay-content {
            line-height: 1.6;
            font-size: 16px;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #007bff;
            text-decoration: none;
        }
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="essay-container">
        <a href="index.html" class="back-link">← Back to Essays</a>
        
        <header class="essay-header">
            <h1 class="essay-title">${essay.title || essay.id}</h1>
            <p class="essay-author">By ${author}</p>
            <div class="essay-meta">
                <span>Essay ID: ${essay.id}</span>
                ${essay.doi ? ` • DOI: ${essay.doi}` : ''}
            </div>
        </header>
        
        <main class="essay-content">
            ${content}
        </main>
    </div>
    
    <script>
        // Add any essay-specific JavaScript here
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