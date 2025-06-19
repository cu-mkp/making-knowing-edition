#!/usr/bin/env node

/**
 * Simple Image Testing Script for Making & Knowing Edition
 * Tests for missing images on edition-staging.makingandknowing.org
 * Uses Node.js built-in modules only (no external dependencies)
 * 
 * Usage: node test-images-simple.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Configuration
const BASE_URL = 'https://edition-staging.makingandknowing.org';
const TIMEOUT = 10000;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// Routes to test
const ROUTES_TO_TEST = [
  '/',
  '/essays',
  '/content/about/overview',  
  '/content/about/manuscript',
  '/entries',
  '/folios',
];

class SimpleImageTester {
  constructor() {
    this.results = {
      totalPages: 0,
      totalImages: 0,
      missingImages: [],
      errors: [],
      summary: {}
    };
  }

  async fetchUrl(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const lib = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          ...options.headers
        },
        timeout: TIMEOUT
      };

      const req = lib.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async testImageUrl(imageUrl, sourcePage) {
    try {
      const response = await this.fetchUrl(imageUrl, { method: 'HEAD' });
      
      if (response.status >= 400) {
        return {
          url: imageUrl,
          status: response.status,
          statusText: response.statusText,
          page: sourcePage,
          reason: `HTTP ${response.status} - ${response.statusText}`,
          missing: true
        };
      }
      
      return {
        url: imageUrl,
        status: response.status,
        missing: false
      };
    } catch (error) {
      return {
        url: imageUrl,
        page: sourcePage,
        reason: `Network error: ${error.message}`,
        missing: true
      };
    }
  }

  extractImageUrls(html, baseUrl) {
    const images = [];
    
    // Extract img src attributes
    const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      let src = match[1];
      
      // Convert relative URLs to absolute
      if (src.startsWith('/')) {
        src = baseUrl + src;
      } else if (src.startsWith('../')) {
        // Handle relative paths (basic implementation)
        src = baseUrl + '/' + src;
      } else if (!src.startsWith('http')) {
        src = baseUrl + '/' + src;
      }
      
      images.push({
        type: 'img',
        url: src,
        alt: this.extractAttribute(match[0], 'alt') || ''
      });
    }
    
    // Extract CSS background images
    const bgImageRegex = /background-image\s*:\s*url\s*\(\s*["']?([^"'()]+)["']?\s*\)/gi;
    while ((match = bgImageRegex.exec(html)) !== null) {
      let src = match[1];
      
      if (src.startsWith('/')) {
        src = baseUrl + src;
      } else if (!src.startsWith('http')) {
        src = baseUrl + '/' + src;
      }
      
      images.push({
        type: 'background',
        url: src
      });
    }
    
    return images;
  }

  extractAttribute(htmlTag, attrName) {
    const regex = new RegExp(`${attrName}\\s*=\\s*["']([^"']*)["']`, 'i');
    const match = htmlTag.match(regex);
    return match ? match[1] : '';
  }

  async testRoute(route) {
    const url = `${BASE_URL}${route}`;
    console.log(`\n🔍 Testing: ${url}`);
    
    try {
      // Fetch the page
      const response = await this.fetchUrl(url);
      
      if (response.status >= 400) {
        console.log(`   ❌ Page returned ${response.status}: ${response.statusText}`);
        this.results.errors.push({
          route,
          error: `HTTP ${response.status} - ${response.statusText}`
        });
        return;
      }
      
      // Extract images from HTML
      const images = this.extractImageUrls(response.data, BASE_URL);
      console.log(`   📊 Found ${images.length} images to test`);
      
      // Test each image
      const missingImages = [];
      const testPromises = images.map(async (img) => {
        const result = await this.testImageUrl(img.url, url);
        if (result.missing) {
          missingImages.push({
            type: img.type.toUpperCase(),
            url: img.url,
            alt: img.alt,
            reason: result.reason,
            status: result.status,
            page: url
          });
        }
        return result;
      });
      
      await Promise.all(testPromises);
      
      // Update results
      this.results.totalPages++;
      this.results.totalImages += images.length;
      this.results.missingImages.push(...missingImages);
      this.results.summary[route] = {
        totalImages: images.length,
        missingImages: missingImages.length
      };

      if (missingImages.length > 0) {
        console.log(`   ❌ Found ${missingImages.length} missing images`);
        missingImages.forEach(img => {
          console.log(`      - ${img.url} (${img.reason})`);
        });
      } else {
        console.log(`   ✅ All images are accessible`);
      }

    } catch (error) {
      console.log(`   ❌ Error testing route: ${error.message}`);
      this.results.errors.push({
        route,
        error: error.message
      });
    }
  }

  async testConnectivity() {
    console.log(`\n🌐 Testing connectivity to ${BASE_URL}...`);
    
    try {
      const response = await this.fetchUrl(BASE_URL);
      if (response.status >= 400) {
        throw new Error(`Site returned ${response.status}: ${response.statusText}`);
      }
      console.log('   ✅ Site is accessible');
      return true;
    } catch (error) {
      console.error(`   ❌ Site is not accessible: ${error.message}`);
      return false;
    }
  }

  async run() {
    console.log('🚀 Starting Simple Image Testing Script');
    console.log(`📍 Testing site: ${BASE_URL}`);
    
    try {
      // Test basic connectivity
      const isAccessible = await this.testConnectivity();
      if (!isAccessible) {
        process.exit(1);
      }
      
      // Test each route
      for (const route of ROUTES_TO_TEST) {
        await this.testRoute(route);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Generate report
      await this.generateReport();
      
    } catch (error) {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    }
  }

  async generateReport() {
    console.log('\n📋 Generating Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      method: 'Simple HTML parsing + HTTP HEAD requests',
      summary: {
        totalPages: this.results.totalPages,
        totalImages: this.results.totalImages,
        totalMissingImages: this.results.missingImages.length,
        pagesWithErrors: this.results.errors.length
      },
      pageResults: this.results.summary,
      missingImages: this.results.missingImages,
      errors: this.results.errors,
      limitations: [
        'This script only tests static HTML content',
        'JavaScript-rendered images may not be detected',
        'React client-side rendering may not be fully captured',
        'Some dynamic content may be missed'
      ]
    };
    
    // Write JSON report
    const reportPath = path.join(process.cwd(), 'simple-image-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Write human-readable report
    const readableReport = this.generateReadableReport(report);
    const readableReportPath = path.join(process.cwd(), 'simple-image-test-report.txt');
    fs.writeFileSync(readableReportPath, readableReport);
    
    // Console summary
    console.log('\n📊 FINAL SUMMARY');
    console.log('='.repeat(50));
    console.log(`📄 Pages tested: ${report.summary.totalPages}`);
    console.log(`🖼️  Total images found: ${report.summary.totalImages}`);
    console.log(`❌ Missing images: ${report.summary.totalMissingImages}`);
    console.log(`💥 Pages with errors: ${report.summary.pagesWithErrors}`);
    console.log('\n⚠️  LIMITATIONS:');
    report.limitations.forEach(limitation => {
      console.log(`   - ${limitation}`);
    });
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
      
      console.log('\n💡 For more comprehensive testing of React-rendered images,');
      console.log('   consider using the Playwright-based script instead.');
      process.exit(1);
    } else {
      console.log('\n✅ All detected images are accessible!');
      console.log('\n💡 Note: This test only covers static HTML images.');
      console.log('   Dynamic React-rendered images may require browser-based testing.');
      process.exit(0);
    }
  }
  
  generateReadableReport(report) {
    let output = `Simple Image Test Report\n`;
    output += `Generated: ${report.timestamp}\n`;
    output += `Base URL: ${report.baseUrl}\n`;
    output += `Method: ${report.method}\n`;
    output += `=`.repeat(60) + '\n\n';
    
    output += `SUMMARY\n`;
    output += `- Pages tested: ${report.summary.totalPages}\n`;
    output += `- Total images found: ${report.summary.totalImages}\n`;
    output += `- Missing images: ${report.summary.totalMissingImages}\n`;
    output += `- Pages with errors: ${report.summary.pagesWithErrors}\n\n`;
    
    output += `LIMITATIONS\n`;
    report.limitations.forEach(limitation => {
      output += `- ${limitation}\n`;
    });
    output += '\n';
    
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
      output += `${route}:\n`;
      output += `  - Total images: ${data.totalImages}\n`;
      output += `  - Missing: ${data.missingImages}\n\n`;
    });
    
    return output;
  }
}

// Run the script
if (require.main === module) {
  const tester = new SimpleImageTester();
  tester.run().catch(console.error);
}

module.exports = SimpleImageTester;