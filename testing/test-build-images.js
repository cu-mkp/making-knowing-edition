#!/usr/bin/env node

/**
 * Local Build Image Testing Script for Making & Knowing Edition
 * Tests for missing images in the local build directory
 * Uses a local HTTP server to serve the build and test images
 * 
 * Usage: node test-build-images.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Try to use playwright from dependencies directory
let playwright;
try {
  playwright = require('../dependencies/node_modules/playwright');
} catch (e) {
  console.log('❌ Playwright not found. Please install it:');
  console.log('   cd ../dependencies');
  console.log('   npm install');
  console.log('   npx playwright install');
  process.exit(1);
}

// Configuration
const BUILD_DIR = path.join(__dirname, '../public');
const LOCAL_PORT = 3001;
const LOCAL_URL = `http://localhost:${LOCAL_PORT}`;
const TIMEOUT = 30000;
const VIEWPORT = { width: 1920, height: 1080 };

// Routes to test (matching staging structure)
const ROUTES_TO_TEST = [
  '/',
  '/essays',
  '/entries',
  '/folios',
];

class BuildImageTester {
  constructor() {
    this.browser = null;
    this.server = null;
    this.results = {
      totalPages: 0,
      totalImages: 0,
      missingImages: [],
      errors: [],
      summary: {}
    };
  }

  async startLocalServer() {
    return new Promise((resolve, reject) => {
      // Create a simple static file server
      this.server = http.createServer((req, res) => {
        let filePath = path.join(BUILD_DIR, req.url === '/' ? 'index.html' : req.url);
        
        // Handle SPA routing - serve index.html for routes
        if (!fs.existsSync(filePath) && !path.extname(filePath)) {
          filePath = path.join(BUILD_DIR, 'index.html');
        }
        
        // Get file extension for content type
        const ext = path.extname(filePath);
        const contentTypes = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml'
        };
        
        const contentType = contentTypes[ext] || 'text/plain';
        
        fs.readFile(filePath, (err, content) => {
          if (err) {
            if (err.code === 'ENOENT') {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('File not found');
            } else {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Server error');
            }
          } else {
            res.writeHead(200, { 
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
            });
            res.end(content);
          }
        });
      });

      this.server.listen(LOCAL_PORT, 'localhost', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`📡 Local server started at ${LOCAL_URL}`);
          resolve();
        }
      });
    });
  }

  async stopLocalServer() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('📡 Local server stopped');
          resolve();
        });
      });
    }
  }

  async init() {
    console.log('🚀 Starting Local Public Directory Image Testing Script');
    console.log(`📁 Testing public directory: ${BUILD_DIR}`);
    
    // Check if public directory exists
    if (!fs.existsSync(BUILD_DIR)) {
      console.error('❌ Public directory not found.');
      process.exit(1);
    }
    
    // Check if index.html exists
    if (!fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
      console.error('❌ index.html not found in public directory.');
      process.exit(1);
    }
    
    try {
      // Start local server
      await this.startLocalServer();
      
      // Start browser
      this.browser = await playwright.chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize:', error.message);
      process.exit(1);
    }
  }

  async testRoute(route) {
    const context = await this.browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    const url = `${LOCAL_URL}${route}`;
    
    console.log(`\n🔍 Testing: ${url}`);
    
    try {
      // Track network requests for local files
      const imageRequests = [];
      
      page.on('response', response => {
        const url = response.url();
        const contentType = response.headers()['content-type'] || '';
        
        if (contentType.startsWith('image/') || url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          imageRequests.push({
            url,
            status: response.status(),
            statusText: response.statusText(),
            contentType,
            isLocal: url.startsWith(LOCAL_URL)
          });
        }
      });

      // Navigate with timeout
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: TIMEOUT 
      });

      // Wait for React to render
      await page.waitForTimeout(3000);
      
      // Additional wait for any dynamic loading
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Get all images from DOM
      const images = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => ({
          src: img.src,
          alt: img.alt || '',
          width: img.naturalWidth,
          height: img.naturalHeight,
          complete: img.complete,
          classList: Array.from(img.classList),
          parentTag: img.parentElement ? img.parentElement.tagName : null,
          computedStyle: window.getComputedStyle(img).display
        }));
      });

      // Check for CSS background images with visibility detection
      const backgroundImages = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const bgImages = [];
        
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          const bgImage = style.backgroundImage;
          
          // Only check visible elements with background images
          if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0 && 
                             style.display !== 'none' && 
                             style.visibility !== 'hidden' &&
                             style.opacity !== '0';
            
            if (isVisible) {
              const matches = bgImage.match(/url\(["']?([^"')]+)["']?\)/g);
              if (matches) {
                matches.forEach(match => {
                  const url = match.replace(/url\(["']?/, '').replace(/["']?\)$/, '');
                  if (url.startsWith('http') || url.startsWith('/')) {
                    bgImages.push({
                      url: url.startsWith('/') ? `${window.location.origin}${url}` : url,
                      element: el.tagName,
                      classes: Array.from(el.classList),
                      id: el.id || '',
                      dimensions: {
                        width: rect.width,
                        height: rect.height
                      },
                      visible: isVisible
                    });
                  }
                });
              }
            }
          }
        });
        
        // Remove duplicates
        const uniqueImages = [];
        const seen = new Set();
        bgImages.forEach(img => {
          if (!seen.has(img.url)) {
            seen.add(img.url);
            uniqueImages.push(img);
          }
        });
        
        return uniqueImages;
      });

      console.log(`   📊 Found ${images.length} img tags`);
      console.log(`   📊 Found ${backgroundImages.length} background images`);
      console.log(`   📊 Tracked ${imageRequests.length} image network requests`);

      // Analyze local vs remote images
      const localRequests = imageRequests.filter(req => req.isLocal);
      const remoteRequests = imageRequests.filter(req => !req.isLocal);
      
      console.log(`   📊 Local image requests: ${localRequests.length}`);
      console.log(`   📊 Remote image requests: ${remoteRequests.length}`);

      // Check for missing images
      const missingImages = [];
      
      // Check DOM img elements
      images.forEach(img => {
        if (img.computedStyle !== 'none' && img.src && img.src !== '') {
          if (!img.complete || (img.complete && img.width === 0 && img.height === 0)) {
            missingImages.push({
              type: 'DOM_IMG',
              url: img.src,
              alt: img.alt,
              reason: `Failed to load (complete: ${img.complete}, dimensions: ${img.width}x${img.height})`,
              page: url,
              display: img.computedStyle,
              testMethod: 'DOM inspection',
              isLocal: img.src.startsWith(LOCAL_URL)
            });
          }
        }
      });

      // Check network requests for failed images
      imageRequests.forEach(req => {
        if (req.status >= 400) {
          missingImages.push({
            type: 'NETWORK_FAIL',
            url: req.url,
            status: req.status,
            statusText: req.statusText,
            reason: `HTTP ${req.status} - ${req.statusText}`,
            page: url,
            contentType: req.contentType,
            testMethod: 'Network monitoring',
            isLocal: req.isLocal
          });
        }
      });

      // Check background images by creating real image elements
      for (const bgImg of backgroundImages) {
        try {
          const loadResult = await page.evaluate(async (imageUrl) => {
            return new Promise((resolve) => {
              const img = new Image();
              const timeout = setTimeout(() => {
                resolve({ loaded: false, error: 'Timeout after 10 seconds' });
              }, 10000);
              
              img.onload = () => {
                clearTimeout(timeout);
                resolve({ 
                  loaded: true, 
                  width: img.naturalWidth, 
                  height: img.naturalHeight,
                  complete: img.complete
                });
              };
              
              img.onerror = (e) => {
                clearTimeout(timeout);
                resolve({ 
                  loaded: false, 
                  error: 'Image failed to load',
                  errorEvent: e.type
                });
              };
              
              img.src = imageUrl;
            });
          }, bgImg.url);
          
          if (!loadResult.loaded) {
            missingImages.push({
              type: 'BACKGROUND_IMG',
              url: bgImg.url,
              reason: `Failed to load: ${loadResult.error}`,
              page: url,
              element: bgImg.element,
              classes: bgImg.classes,
              testMethod: 'Image element simulation',
              isLocal: bgImg.url.startsWith(LOCAL_URL)
            });
          }
        } catch (error) {
          missingImages.push({
            type: 'BACKGROUND_IMG',
            url: bgImg.url,
            reason: `Test failed: ${error.message}`,
            page: url,
            element: bgImg.element,
            testMethod: 'Image element simulation',
            isLocal: bgImg.url.startsWith(LOCAL_URL)
          });
        }
      }

      // Update results
      this.results.totalPages++;
      this.results.totalImages += images.length + backgroundImages.length;
      this.results.missingImages.push(...missingImages);
      this.results.summary[route] = {
        totalImages: images.length,
        backgroundImages: backgroundImages.length,
        missingImages: missingImages.length,
        networkRequests: imageRequests.length,
        localRequests: localRequests.length,
        remoteRequests: remoteRequests.length
      };

      if (missingImages.length > 0) {
        console.log(`   ❌ Found ${missingImages.length} missing images`);
        
        // Separate local vs remote issues
        const localIssues = missingImages.filter(img => img.isLocal);
        const remoteIssues = missingImages.filter(img => !img.isLocal);
        
        if (localIssues.length > 0) {
          console.log(`   📁 Local build issues: ${localIssues.length}`);
          localIssues.slice(0, 3).forEach(img => {
            console.log(`      - ${img.url} (${img.reason})`);
          });
        }
        
        if (remoteIssues.length > 0) {
          console.log(`   🌐 Remote asset issues: ${remoteIssues.length}`);
          remoteIssues.slice(0, 3).forEach(img => {
            console.log(`      - ${img.url} (${img.reason})`);
          });
          if (remoteIssues.length > 3) {
            console.log(`      ... and ${remoteIssues.length - 3} more remote issues`);
          }
        }
      } else {
        console.log(`   ✅ All images loaded successfully`);
      }

    } catch (error) {
      console.log(`   ❌ Error testing route: ${error.message}`);
      this.results.errors.push({
        route,
        error: error.message
      });
    } finally {
      await context.close();
    }
  }

  async run() {
    try {
      await this.init();
      
      // Test each route
      for (const route of ROUTES_TO_TEST) {
        await this.testRoute(route);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Generate report
      await this.generateReport();
      
    } catch (error) {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
      await this.stopLocalServer();
    }
  }

  async generateReport() {
    console.log('\n📋 Generating Public Directory Test Report...');
    
    const localIssues = this.results.missingImages.filter(img => img.isLocal);
    const remoteIssues = this.results.missingImages.filter(img => !img.isLocal);
    
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'Local Public Directory Test',
      buildDirectory: BUILD_DIR,
      localUrl: LOCAL_URL,
      summary: {
        totalPages: this.results.totalPages,
        totalImages: this.results.totalImages,
        totalMissingImages: this.results.missingImages.length,
        localIssues: localIssues.length,
        remoteIssues: remoteIssues.length,
        pagesWithErrors: this.results.errors.length
      },
      pageResults: this.results.summary,
      missingImages: this.results.missingImages,
      errors: this.results.errors
    };
    
    // Write JSON report
    const reportPath = path.join(__dirname, 'build-image-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Write human-readable report
    const readableReport = this.generateReadableReport(report);
    const readableReportPath = path.join(__dirname, 'build-image-test-report.txt');
    fs.writeFileSync(readableReportPath, readableReport);
    
    // Console summary
    console.log('\n📊 PUBLIC DIRECTORY TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`📄 Pages tested: ${report.summary.totalPages}`);
    console.log(`🖼️  Total images: ${report.summary.totalImages}`);
    console.log(`❌ Total missing: ${report.summary.totalMissingImages}`);
    console.log(`📁 Local directory issues: ${report.summary.localIssues}`);
    console.log(`🌐 Remote asset issues: ${report.summary.remoteIssues}`);
    console.log(`💥 Pages with errors: ${report.summary.pagesWithErrors}`);
    console.log('\n📁 Reports saved:');
    console.log(`   - ${reportPath}`);
    console.log(`   - ${readableReportPath}`);
    
    // Analysis
    if (report.summary.localIssues > 0) {
      console.log('\n🔧 LOCAL DIRECTORY ISSUES DETECTED:');
      console.log('   The local public directory has missing image files or broken references.');
      console.log('   This indicates files are missing from the source repository.');
    }
    
    if (report.summary.remoteIssues > 0) {
      console.log('\n🌐 REMOTE ASSET ISSUES DETECTED:');
      console.log('   The site references remote assets that are not accessible.');
      console.log('   This confirms the staging site issues are due to remote asset problems.');
    }
    
    if (report.summary.totalMissingImages === 0) {
      console.log('\n✅ Public directory test passed! All images load correctly when served locally.');
      console.log('   This suggests the staging deployment has configuration issues.');
    }
    
    process.exit(report.summary.totalMissingImages > 0 ? 1 : 0);
  }
  
  generateReadableReport(report) {
    let output = `Build Image Test Report\n`;
    output += `Generated: ${report.timestamp}\n`;
    output += `Test Type: ${report.testType}\n`;
    output += `Build Directory: ${report.buildDirectory}\n`;
    output += `Local URL: ${report.localUrl}\n`;
    output += `=`.repeat(60) + '\n\n';
    
    output += `SUMMARY\n`;
    output += `- Pages tested: ${report.summary.totalPages}\n`;
    output += `- Total images: ${report.summary.totalImages}\n`;
    output += `- Total missing: ${report.summary.totalMissingImages}\n`;
    output += `- Local build issues: ${report.summary.localIssues}\n`;
    output += `- Remote asset issues: ${report.summary.remoteIssues}\n`;
    output += `- Pages with errors: ${report.summary.pagesWithErrors}\n\n`;
    
    if (report.missingImages.length > 0) {
      output += `MISSING IMAGES ANALYSIS\n`;
      output += `-`.repeat(40) + '\n';
      
      const localIssues = report.missingImages.filter(img => img.isLocal);
      const remoteIssues = report.missingImages.filter(img => !img.isLocal);
      
      if (localIssues.length > 0) {
        output += `LOCAL BUILD ISSUES (${localIssues.length}):\n`;
        localIssues.forEach((img, i) => {
          output += `${i + 1}. URL: ${img.url}\n`;
          output += `   Page: ${img.page}\n`;
          output += `   Reason: ${img.reason}\n`;
          output += `   Type: ${img.type}\n\n`;
        });
      }
      
      if (remoteIssues.length > 0) {
        output += `REMOTE ASSET ISSUES (${remoteIssues.length}):\n`;
        remoteIssues.slice(0, 10).forEach((img, i) => {
          output += `${i + 1}. URL: ${img.url}\n`;
          output += `   Page: ${img.page}\n`;
          output += `   Reason: ${img.reason}\n`;
          output += `   Type: ${img.type}\n\n`;
        });
        if (remoteIssues.length > 10) {
          output += `... and ${remoteIssues.length - 10} more remote issues\n\n`;
        }
      }
    }
    
    if (report.errors.length > 0) {
      output += `PAGE ERRORS\n`;
      output += `-`.repeat(40) + '\n';
      report.errors.forEach((error, i) => {
        output += `${i + 1}. Route: ${error.route}\n`;
        output += `   Error: ${error.error}\n\n`;
      });
    }
    
    output += `PAGE-BY-PAGE RESULTS\n`;
    output += `-`.repeat(40) + '\n';
    Object.entries(report.pageResults).forEach(([route, data]) => {
      const totalImages = data.totalImages + data.backgroundImages;
      output += `${route}:\n`;
      output += `  - IMG tags: ${data.totalImages}\n`;
      output += `  - Background images: ${data.backgroundImages}\n`;
      output += `  - Total images: ${totalImages}\n`;
      output += `  - Missing: ${data.missingImages}\n`;
      output += `  - Local requests: ${data.localRequests}\n`;
      output += `  - Remote requests: ${data.remoteRequests}\n\n`;
    });
    
    return output;
  }
}

// Run the script
if (require.main === module) {
  const tester = new BuildImageTester();
  tester.run().catch(console.error);
}

module.exports = BuildImageTester;