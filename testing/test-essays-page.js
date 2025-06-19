#!/usr/bin/env node

/**
 * Test specifically for essays page thumbnails
 */

const playwright = require('../dependencies/node_modules/playwright');

async function testEssaysPage() {
  console.log('🔍 Testing essays page specifically...');
  
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Track failed requests
  const failedRequests = [];
  const successfulRequests = [];
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('edition-assets.makingandknowing.org') || 
        (url.includes('thumbnail') || url.includes('Thumbnail'))) {
      if (response.status() >= 400) {
        failedRequests.push({
          url,
          status: response.status(),
          statusText: response.statusText()
        });
      } else {
        successfulRequests.push({
          url,
          status: response.status()
        });
      }
    }
  });
  
  try {
    console.log('📍 Loading essays page...');
    await page.goto('https://edition-staging.makingandknowing.org/essays', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for React to render
    await page.waitForTimeout(5000);
    
    // Get all thumbnails/images on the page
    const thumbnailInfo = await page.evaluate(() => {
      const results = [];
      
      // Check img tags
      const imgs = Array.from(document.querySelectorAll('img'));
      imgs.forEach(img => {
        if (img.src.includes('thumbnail') || img.src.includes('Thumbnail')) {
          results.push({
            type: 'IMG',
            src: img.src,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            visible: img.offsetWidth > 0 && img.offsetHeight > 0,
            alt: img.alt
          });
        }
      });
      
      // Check background images
      const elements = Array.from(document.querySelectorAll('*'));
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        
        if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
          const matches = bgImage.match(/url\(["']?([^"')]+)["']?\)/g);
          if (matches) {
            matches.forEach(match => {
              const url = match.replace(/url\(["']?/, '').replace(/["']?\)$/, '');
              if (url.includes('thumbnail') || url.includes('Thumbnail')) {
                const rect = el.getBoundingClientRect();
                results.push({
                  type: 'BACKGROUND',
                  src: url.startsWith('/') ? window.location.origin + url : url,
                  element: el.tagName,
                  classes: Array.from(el.classList).join(' '),
                  visible: rect.width > 0 && rect.height > 0 && 
                          style.display !== 'none' && 
                          style.visibility !== 'hidden',
                  dimensions: {
                    width: rect.width,
                    height: rect.height
                  }
                });
              }
            });
          }
        }
      });
      
      return results;
    });
    
    console.log(`\n📊 Found ${thumbnailInfo.length} thumbnail images:`);
    thumbnailInfo.forEach((thumb, i) => {
      console.log(`\n${i + 1}. ${thumb.type}: ${thumb.src}`);
      console.log(`   Visible: ${thumb.visible}`);
      if (thumb.type === 'IMG') {
        console.log(`   Complete: ${thumb.complete}, Size: ${thumb.naturalWidth}x${thumb.naturalHeight}`);
      } else {
        console.log(`   Element: ${thumb.element}, Classes: ${thumb.classes}`);
        console.log(`   Dimensions: ${thumb.dimensions.width}x${thumb.dimensions.height}`);
      }
    });
    
    console.log(`\n🌐 Network Results:`);
    console.log(`   ✅ Successful requests: ${successfulRequests.length}`);
    console.log(`   ❌ Failed requests: ${failedRequests.length}`);
    
    if (failedRequests.length > 0) {
      console.log('\n❌ Failed thumbnail requests:');
      failedRequests.forEach(req => {
        console.log(`   ${req.status} ${req.statusText}: ${req.url}`);
      });
    }
    
    if (successfulRequests.length > 0) {
      console.log('\n✅ Successful thumbnail requests:');
      successfulRequests.slice(0, 10).forEach(req => {
        console.log(`   ${req.status}: ${req.url}`);
      });
      if (successfulRequests.length > 10) {
        console.log(`   ... and ${successfulRequests.length - 10} more`);
      }
    }
    
    // Test actual loading of a few background images
    const bgThumbnails = thumbnailInfo.filter(t => t.type === 'BACKGROUND' && t.visible);
    if (bgThumbnails.length > 0) {
      console.log(`\n🧪 Testing actual loading of background thumbnails:`);
      for (let i = 0; i < Math.min(5, bgThumbnails.length); i++) {
        const thumb = bgThumbnails[i];
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
                error: 'load_failed',
                errorType: e.type 
              });
            };
            
            img.src = imageUrl;
          });
        }, thumb.src);
        
        console.log(`   ${i + 1}. ${thumb.src.split('/').pop()}: ${loadResult.success ? '✅' : '❌'} ${JSON.stringify(loadResult)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testEssaysPage().catch(console.error);