#!/usr/bin/env node

/**
 * Debug Image Testing Script
 * Single page test with detailed logging to understand the discrepancy
 */

const playwright = require('../dependencies/node_modules/playwright');

async function debugImageTest() {
  console.log('🔍 Starting debug image test...');
  
  const browser = await playwright.chromium.launch({
    headless: false, // Run with visible browser
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Monitor all network requests
  page.on('request', request => {
    if (request.url().includes('edition-assets.makingandknowing.org')) {
      console.log(`🌐 REQUEST: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('edition-assets.makingandknowing.org')) {
      console.log(`📥 RESPONSE: ${response.url()} - Status: ${response.status()}`);
    }
  });
  
  // Monitor console messages from the page
  page.on('console', msg => {
    if (msg.text().includes('error') || msg.text().includes('failed')) {
      console.log(`🖥️  CONSOLE: ${msg.text()}`);
    }
  });
  
  try {
    console.log('📍 Loading homepage...');
    await page.goto('https://edition-staging.makingandknowing.org/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for React to render
    await page.waitForTimeout(5000);
    
    // Check for images in DOM
    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        alt: img.alt
      }));
    });
    
    console.log(`\n📊 Found ${images.length} img elements:`);
    images.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.src}`);
      console.log(`     Complete: ${img.complete}, Size: ${img.naturalWidth}x${img.naturalHeight}`);
    });
    
    // Check for background images
    const bgImages = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const bgImages = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        
        if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
          const matches = bgImage.match(/url\(["']?([^"')]+)["']?\)/g);
          if (matches) {
            matches.forEach(match => {
              const url = match.replace(/url\(["']?/, '').replace(/["']?\)$/, '');
              if (url.includes('edition-assets.makingandknowing.org')) {
                bgImages.push({
                  url,
                  element: el.tagName,
                  classes: Array.from(el.classList),
                  visible: el.offsetWidth > 0 && el.offsetHeight > 0
                });
              }
            });
          }
        }
      });
      
      return bgImages;
    });
    
    console.log(`\n🖼️  Found ${bgImages.length} background images from edition-assets:`);
    bgImages.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.url}`);
      console.log(`     Element: ${img.element}, Visible: ${img.visible}`);
    });
    
    // Test loading one of the background images manually
    if (bgImages.length > 0) {
      console.log(`\n🧪 Testing manual image load for: ${bgImages[0].url}`);
      const loadResult = await page.evaluate(async (imageUrl) => {
        return new Promise((resolve) => {
          const img = new Image();
          const timeout = setTimeout(() => {
            resolve({ success: false, error: 'timeout' });
          }, 10000);
          
          img.onload = () => {
            clearTimeout(timeout);
            resolve({ 
              success: true, 
              width: img.naturalWidth, 
              height: img.naturalHeight 
            });
          };
          
          img.onerror = (e) => {
            clearTimeout(timeout);
            resolve({ 
              success: false, 
              error: 'load error',
              errorType: e.type 
            });
          };
          
          img.src = imageUrl;
        });
      }, bgImages[0].url);
      
      console.log(`   Result:`, loadResult);
    }
    
    // Wait a bit more to see if anything loads later
    console.log('\n⏳ Waiting 10 more seconds for any delayed loading...');
    await page.waitForTimeout(10000);
    
    console.log('\n✅ Debug test complete. Check browser window manually.');
    console.log('Press Ctrl+C to exit when done examining the page.');
    
    // Keep the browser open for manual inspection
    await new Promise(resolve => {
      process.on('SIGINT', () => {
        console.log('\n👋 Closing browser...');
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugImageTest().catch(console.error);