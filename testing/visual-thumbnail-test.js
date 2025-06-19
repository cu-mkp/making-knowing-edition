#!/usr/bin/env node

/**
 * Visual Thumbnail Test - Check what the user actually sees
 */

const playwright = require('../dependencies/node_modules/playwright');

async function visualThumbnailTest() {
  console.log('🔍 Testing visual appearance of thumbnails...');
  
  const browser = await playwright.chromium.launch({
    headless: false, // Show browser so we can see what user sees
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📍 Loading essays page...');
    await page.goto('https://edition-staging.makingandknowing.org/essays', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for page to fully load
    await page.waitForTimeout(5000);
    
    // Check the visual state of thumbnail containers
    const thumbnailVisualState = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('.MuiCardMedia-root'));
      return containers.slice(0, 10).map(container => {
        const style = window.getComputedStyle(container);
        const rect = container.getBoundingClientRect();
        
        return {
          backgroundImage: style.backgroundImage,
          backgroundColor: style.backgroundColor,
          width: rect.width,
          height: rect.height,
          border: style.border,
          hasContent: style.backgroundImage !== 'none',
          isVisible: rect.width > 0 && rect.height > 0,
          position: {
            top: rect.top,
            left: rect.left
          }
        };
      });
    });
    
    console.log('\n🖼️  Visual state of first 10 thumbnail containers:');
    thumbnailVisualState.forEach((state, i) => {
      console.log(`\n${i + 1}.`);
      console.log(`   Size: ${state.width}x${state.height}`);
      console.log(`   Has background image: ${state.hasContent}`);
      console.log(`   Background color: ${state.backgroundColor}`);
      console.log(`   Border: ${state.border}`);
      console.log(`   Background image: ${state.backgroundImage.substring(0, 100)}...`);
    });
    
    // Take a screenshot of the essays page
    const screenshotPath = '/Users/thc4/Github/making-knowing-edition/testing/essays-page-screenshot.png';
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
    
    // Scroll down to see more thumbnails
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(2000);
    
    // Test a specific thumbnail by trying to force reload its background image
    console.log('\n🔄 Testing thumbnail image reload...');
    const reloadResult = await page.evaluate(() => {
      const container = document.querySelector('.MuiCardMedia-root');
      if (container) {
        const style = window.getComputedStyle(container);
        const bgImage = style.backgroundImage;
        
        if (bgImage && bgImage !== 'none') {
          // Extract URL from background-image CSS
          const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
          if (urlMatch) {
            const imageUrl = urlMatch[1];
            
            // Try to load the image manually to see if it actually works
            return new Promise((resolve) => {
              const img = new Image();
              const startTime = Date.now();
              
              img.onload = () => {
                resolve({
                  success: true,
                  url: imageUrl,
                  loadTime: Date.now() - startTime,
                  dimensions: {
                    width: img.naturalWidth,
                    height: img.naturalHeight
                  }
                });
              };
              
              img.onerror = (e) => {
                resolve({
                  success: false,
                  url: imageUrl,
                  error: 'Failed to load',
                  loadTime: Date.now() - startTime
                });
              };
              
              img.src = imageUrl;
            });
          }
        }
        return { error: 'No background image found' };
      }
      return { error: 'No container found' };
    });
    
    console.log('Image reload test result:', reloadResult);
    
    // Check if images are being blocked by CSP or other security policies
    const securityInfo = await page.evaluate(() => {
      return {
        csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || 'none',
        referrerPolicy: document.querySelector('meta[name="referrer"]')?.content || 'none',
        location: window.location.href,
        userAgent: navigator.userAgent
      };
    });
    
    console.log('\n🔒 Security/Policy Info:');
    console.log(`   CSP: ${securityInfo.csp}`);
    console.log(`   Referrer Policy: ${securityInfo.referrerPolicy}`);
    console.log(`   User Agent: ${securityInfo.userAgent.substring(0, 100)}...`);
    
    console.log('\n⏳ Browser window will stay open for 30 seconds for manual inspection...');
    console.log('   Look at the essays page to see if thumbnails are visible or showing as white boxes');
    
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

visualThumbnailTest().catch(console.error);