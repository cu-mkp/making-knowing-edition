#!/usr/bin/env node

/**
 * Standalone Image Testing Script for Making & Knowing Edition
 * Tests for missing images on edition-staging.makingandknowing.org
 * Uses fetch API and browser automation via playwright
 * 
 * Installation: npm install playwright
 * Usage: node test-images-standalone.js
 */

const fs = require('fs');
const path = require('path');

// Try to use playwright from dependencies directory
let playwright;
try {
  playwright = require('../dependencies/node_modules/playwright');
} catch (e) {
  console.log('❌ Playwright not found. Please install it:');
  console.log('   cd dependencies');
  console.log('   npm install');
  console.log('   npx playwright install');
  process.exit(1);
}

// Configuration
const BASE_URL = 'https://edition-staging.makingandknowing.org';
const TIMEOUT = 30000;
const VIEWPORT = { width: 1920, height: 1080 };

// Routes to test (reduced set for faster testing)
const ROUTES_TO_TEST = [
  '/',
  '/essays',
  '/entries',
  '/folios',
];

class ImageTesterStandalone {
  constructor() {
    this.browser = null;
    this.results = {
      totalPages: 0,
      totalImages: 0,
      missingImages: [],
      errors: [],
      summary: {}
    };
  }

  async init() {
    console.log('🚀 Starting Standalone Image Testing Script');
    console.log(`📍 Testing site: ${BASE_URL}`);
    
    try {
      this.browser = await playwright.chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
    } catch (error) {
      console.error('❌ Failed to launch browser:', error.message);
      console.log('💡 Try running: npx playwright install');
      process.exit(1);
    }
  }

  async testRoute(route) {
    const context = await this.browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    const url = `${BASE_URL}${route}`;
    
    console.log(`\n🔍 Testing: ${url}`);
    
    try {
      // Track network requests
      const imageRequests = [];
      
      page.on('response', response => {
        const url = response.url();
        const contentType = response.headers()['content-type'] || '';
        
        if (contentType.startsWith('image/') || url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          imageRequests.push({
            url,
            status: response.status(),
            statusText: response.statusText(),
            contentType
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
      
      // Wait for common React root elements
      try {
        await page.waitForSelector('[data-reactroot], .App, #root, main', { timeout: 5000 });
      } catch (e) {
        console.log('   ⚠️  No common React selectors found, continuing...');
      }

      // Additional wait to let background images start loading
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

      // Check for missing images
      const missingImages = [];
      
      // Check DOM img elements (only report truly broken images)
      images.forEach(img => {
        // Only report as missing if image is visible but failed to load
        if (img.computedStyle !== 'none' && img.src && img.src !== '') {
          if (!img.complete || (img.complete && img.width === 0 && img.height === 0)) {
            missingImages.push({
              type: 'DOM_IMG',
              url: img.src,
              alt: img.alt,
              reason: `Failed to load (complete: ${img.complete}, dimensions: ${img.width}x${img.height})`,
              page: url,
              display: img.computedStyle,
              testMethod: 'DOM inspection'
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
            contentType: req.contentType
          });
        }
      });

      // Check background images by creating real image elements (like a browser would)
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
              
              // Set crossOrigin to handle CORS properly
              img.crossOrigin = 'anonymous';
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
              testMethod: 'Image element simulation'
            });
          }
        } catch (error) {
          missingImages.push({
            type: 'BACKGROUND_IMG',
            url: bgImg.url,
            reason: `Test failed: ${error.message}`,
            page: url,
            element: bgImg.element,
            testMethod: 'Image element simulation'
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
        networkRequests: imageRequests.length
      };

      if (missingImages.length > 0) {
        console.log(`   ❌ Found ${missingImages.length} missing images`);
        missingImages.forEach(img => {
          console.log(`      - ${img.url} (${img.reason})`);
        });
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

  async discoverRoutes() {
    console.log('\n🔍 Discovering additional routes...');
    
    const context = await this.browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    
    try {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      // Extract links from navigation and content
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href^="/"]'));
        return [...new Set(anchors.map(a => a.getAttribute('href')))];
      });
      
      const additionalRoutes = links
        .filter(link => link && link !== '/' && link !== '#')
        .filter(link => !ROUTES_TO_TEST.includes(link))
        .filter(link => !link.includes('?')) // Skip query parameters for now
        .slice(0, 15); // Limit to avoid too many requests
      
      console.log(`   Found ${additionalRoutes.length} additional routes to test`);
      additionalRoutes.forEach(route => console.log(`      - ${route}`));
      
      return additionalRoutes;
      
    } catch (error) {
      console.log(`   ⚠️  Error discovering routes: ${error.message}`);
      return [];
    } finally {
      await context.close();
    }
  }

  async run() {
    try {
      await this.init();
      
      // Test basic connectivity first
      console.log(`\n🌐 Testing connectivity to ${BASE_URL}...`);
      const context = await this.browser.newContext();
      const page = await context.newPage();
      
      try {
        const response = await page.goto(BASE_URL, { timeout: 10000 });
        if (!response.ok()) {
          throw new Error(`Site returned ${response.status()}: ${response.statusText()}`);
        }
        console.log('   ✅ Site is accessible');
      } catch (error) {
        console.error(`   ❌ Site is not accessible: ${error.message}`);
        process.exit(1);
      } finally {
        await context.close();
      }
      
      // Skip route discovery for faster testing
      const allRoutes = ROUTES_TO_TEST;
      
      // Test each route
      for (const route of allRoutes) {
        await this.testRoute(route);
        // Small delay between requests to be respectful
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
    }
  }

  async generateReport() {
    console.log('\n📋 Generating Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      userAgent: 'Playwright Chromium',
      summary: {
        totalPages: this.results.totalPages,
        totalImages: this.results.totalImages,
        totalMissingImages: this.results.missingImages.length,
        pagesWithErrors: this.results.errors.length
      },
      pageResults: this.results.summary,
      missingImages: this.results.missingImages,
      errors: this.results.errors
    };
    
    // Write JSON report
    const reportPath = path.join(process.cwd(), 'image-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Write human-readable report
    const readableReport = this.generateReadableReport(report);
    const readableReportPath = path.join(process.cwd(), 'image-test-report.txt');
    fs.writeFileSync(readableReportPath, readableReport);
    
    // Console summary
    console.log('\n📊 FINAL SUMMARY');
    console.log('='.repeat(50));
    console.log(`📄 Pages tested: ${report.summary.totalPages}`);
    console.log(`🖼️  Total images: ${report.summary.totalImages}`);
    console.log(`❌ Missing images: ${report.summary.totalMissingImages}`);
    console.log(`💥 Pages with errors: ${report.summary.pagesWithErrors}`);
    console.log('\n📁 Reports saved:');
    console.log(`   - ${reportPath}`);
    console.log(`   - ${readableReportPath}`);
    
    if (report.summary.totalMissingImages > 0) {
      console.log('\n⚠️  MISSING IMAGES FOUND:');
      this.results.missingImages.forEach((img, i) => {
        console.log(`   ${i + 1}. ${img.url}`);
        console.log(`      Page: ${img.page}`);
        console.log(`      Reason: ${img.reason}`);
        console.log(`      Type: ${img.type}`);
        console.log('');
      });
      process.exit(1);
    } else {
      console.log('\n✅ All images are loading correctly!');
      process.exit(0);
    }
  }
  
  generateReadableReport(report) {
    let output = `Image Test Report\n`;
    output += `Generated: ${report.timestamp}\n`;
    output += `Base URL: ${report.baseUrl}\n`;
    output += `User Agent: ${report.userAgent}\n`;
    output += `=`.repeat(60) + '\n\n';
    
    output += `SUMMARY\n`;
    output += `- Pages tested: ${report.summary.totalPages}\n`;
    output += `- Total images: ${report.summary.totalImages}\n`;
    output += `- Missing images: ${report.summary.totalMissingImages}\n`;
    output += `- Pages with errors: ${report.summary.pagesWithErrors}\n\n`;
    
    if (report.missingImages.length > 0) {
      output += `MISSING IMAGES DETAILS\n`;
      output += `-`.repeat(40) + '\n';
      report.missingImages.forEach((img, i) => {
        output += `${i + 1}. URL: ${img.url}\n`;
        output += `   Page: ${img.page}\n`;
        output += `   Type: ${img.type}\n`;
        output += `   Reason: ${img.reason}\n`;
        if (img.status) output += `   HTTP Status: ${img.status}\n`;
        if (img.alt) output += `   Alt Text: ${img.alt}\n`;
        output += '\n';
      });
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
      const totalImages = data.totalImages + (data.backgroundImages || 0);
      output += `${route}:\n`;
      output += `  - IMG tags: ${data.totalImages}\n`;
      output += `  - Background images: ${data.backgroundImages || 0}\n`;
      output += `  - Total images: ${totalImages}\n`;
      output += `  - Missing: ${data.missingImages}\n`;
      output += `  - Network requests: ${data.networkRequests}\n\n`;
    });
    
    return output;
  }
}

// Run the script
if (require.main === module) {
  const tester = new ImageTesterStandalone();
  tester.run().catch(console.error);
}

module.exports = ImageTesterStandalone;