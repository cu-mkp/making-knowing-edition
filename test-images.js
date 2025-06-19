#!/usr/bin/env node

/**
 * Image Testing Script for Making & Knowing Edition
 * Tests for missing images on edition-staging.makingandknowing.org
 * Handles React client-side rendering using Puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://edition-staging.makingandknowing.org';
const TIMEOUT = 30000; // 30 seconds timeout
const VIEWPORT = { width: 1920, height: 1080 };

// Routes to test based on sitemap and known structure
const ROUTES_TO_TEST = [
  '/',
  '/essays',
  '/content/about/overview',
  '/content/about/manuscript',
  '/entries',
  '/folios',
  '/folios/001r/normalized',
  '/folios/001r/translated', 
  '/folios/001r/diplomatic',
  '/search',
];

class ImageTester {
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
    console.log('🚀 Starting Image Testing Script');
    console.log(`📍 Testing site: ${BASE_URL}`);
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }

  async testRoute(route) {
    const page = await this.browser.newPage();
    const url = `${BASE_URL}${route}`;
    
    console.log(`\n🔍 Testing: ${url}`);
    
    try {
      // Set viewport and enable request interception
      await page.setViewport(VIEWPORT);
      await page.setRequestInterception(true);
      
      // Track image requests
      const imageRequests = [];
      
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        const url = request.url();
        
        if (resourceType === 'image') {
          imageRequests.push({
            url,
            status: 'pending'
          });
        }
        
        request.continue();
      });
      
      page.on('response', (response) => {
        const url = response.url();
        const status = response.status();
        
        // Update image request status
        const imageReq = imageRequests.find(req => req.url === url);
        if (imageReq) {
          imageReq.status = status;
          imageReq.statusText = response.statusText();
        }
      });

      // Navigate to page
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: TIMEOUT 
      });

      // Wait for React to render
      await page.waitForTimeout(2000);
      
      // Try to wait for common React elements
      try {
        await page.waitForSelector('[data-reactroot], .App, #root', { timeout: 5000 });
      } catch (e) {
        console.log('   ⚠️  No common React selectors found, continuing...');
      }

      // Get all images on the page
      const images = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => ({
          src: img.src,
          alt: img.alt || '',
          width: img.naturalWidth,
          height: img.naturalHeight,
          complete: img.complete,
          classList: Array.from(img.classList),
          parentElement: img.parentElement ? img.parentElement.tagName : null
        }));
      });

      console.log(`   📊 Found ${images.length} images on page`);
      console.log(`   📊 Tracked ${imageRequests.length} image requests`);

      // Check for missing images
      const missingImages = [];
      
      // Check DOM images
      images.forEach(img => {
        if (!img.complete || img.width === 0 || img.height === 0) {
          missingImages.push({
            type: 'DOM_IMAGE',
            url: img.src,
            alt: img.alt,
            reason: 'Failed to load or zero dimensions',
            page: url
          });
        }
      });

      // Check network requests
      imageRequests.forEach(req => {
        if (req.status >= 400) {
          missingImages.push({
            type: 'NETWORK_REQUEST',
            url: req.url,
            status: req.status,
            statusText: req.statusText,
            reason: `HTTP ${req.status} - ${req.statusText}`,
            page: url
          });
        }
      });

      // Update results
      this.results.totalPages++;
      this.results.totalImages += images.length;
      this.results.missingImages.push(...missingImages);
      this.results.summary[route] = {
        totalImages: images.length,
        missingImages: missingImages.length,
        imageRequests: imageRequests.length
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
        error: error.message,
        stack: error.stack
      });
    } finally {
      await page.close();
    }
  }

  async discoverRoutes() {
    console.log('\n🔍 Discovering additional routes...');
    
    const page = await this.browser.newPage();
    
    try {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(3000);
      
      // Look for links to folio pages, essays, etc.
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href^="/"]'));
        return [...new Set(anchors.map(a => a.getAttribute('href')))];
      });
      
      const additionalRoutes = links
        .filter(link => link && link !== '/')
        .filter(link => !ROUTES_TO_TEST.includes(link))
        .slice(0, 10); // Limit to avoid too many requests
      
      console.log(`   Found ${additionalRoutes.length} additional routes to test`);
      additionalRoutes.forEach(route => console.log(`      - ${route}`));
      
      return additionalRoutes;
      
    } catch (error) {
      console.log(`   ⚠️  Error discovering routes: ${error.message}`);
      return [];
    } finally {
      await page.close();
    }
  }

  async run() {
    try {
      await this.init();
      
      // Discover additional routes
      const additionalRoutes = await this.discoverRoutes();
      const allRoutes = [...ROUTES_TO_TEST, ...additionalRoutes];
      
      // Test each route
      for (const route of allRoutes) {
        await this.testRoute(route);
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
    const reportPath = path.join(__dirname, 'image-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Write human-readable report
    const readableReport = this.generateReadableReport(report);
    const readableReportPath = path.join(__dirname, 'image-test-report.txt');
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
      this.results.missingImages.forEach(img => {
        console.log(`   ${img.url} - ${img.reason}`);
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
    output += `=`.repeat(50) + '\n\n';
    
    output += `SUMMARY\n`;
    output += `- Pages tested: ${report.summary.totalPages}\n`;
    output += `- Total images: ${report.summary.totalImages}\n`;
    output += `- Missing images: ${report.summary.totalMissingImages}\n`;
    output += `- Pages with errors: ${report.summary.pagesWithErrors}\n\n`;
    
    if (report.missingImages.length > 0) {
      output += `MISSING IMAGES\n`;
      output += `-`.repeat(30) + '\n';
      report.missingImages.forEach(img => {
        output += `URL: ${img.url}\n`;
        output += `Page: ${img.page}\n`;
        output += `Reason: ${img.reason}\n`;
        output += `Type: ${img.type}\n\n`;
      });
    }
    
    if (report.errors.length > 0) {
      output += `ERRORS\n`;
      output += `-`.repeat(30) + '\n';
      report.errors.forEach(error => {
        output += `Route: ${error.route}\n`;
        output += `Error: ${error.error}\n\n`;
      });
    }
    
    output += `PAGE DETAILS\n`;
    output += `-`.repeat(30) + '\n';
    Object.entries(report.pageResults).forEach(([route, data]) => {
      output += `${route}: ${data.totalImages} images, ${data.missingImages} missing\n`;
    });
    
    return output;
  }
}

// Run the script
if (require.main === module) {
  const tester = new ImageTester();
  tester.run().catch(console.error);
}

module.exports = ImageTester;