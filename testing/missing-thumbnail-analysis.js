#!/usr/bin/env node

/**
 * Identify which specific thumbnails are missing their background images
 */

const playwright = require('../dependencies/node_modules/playwright');

async function analyzeMissingThumbnails() {
  console.log('🔍 Analyzing missing thumbnail data...');
  
  const browser = await playwright.chromium.launch({
    headless: true,
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
    
    // Wait for React to render completely
    await page.waitForTimeout(5000);
    
    // Analyze all thumbnail containers and their parent cards
    const thumbnailAnalysis = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('.MuiCardMedia-root'));
      
      return containers.map((container, index) => {
        const style = window.getComputedStyle(container);
        const card = container.closest('.MuiCard-root');
        
        // Try to find title/text in the card
        let title = 'Unknown';
        if (card) {
          const titleElement = card.querySelector('.MuiTypography-h6, .MuiCardContent-root h6, .MuiCardContent-root [class*="title"]');
          if (titleElement) {
            title = titleElement.textContent.trim();
          } else {
            // Fallback to any text in the card
            const cardContent = card.querySelector('.MuiCardContent-root');
            if (cardContent) {
              const text = cardContent.textContent.trim();
              title = text.length > 50 ? text.substring(0, 50) + '...' : text;
            }
          }
        }
        
        const hasImage = style.backgroundImage !== 'none';
        let imageUrl = null;
        
        if (hasImage) {
          const urlMatch = style.backgroundImage.match(/url\\(["']?([^"')]+)["']?\\)/);
          if (urlMatch) {
            imageUrl = urlMatch[1];
          }
        }
        
        return {
          index: index + 1,
          title,
          hasImage,
          imageUrl,
          position: {
            top: container.getBoundingClientRect().top,
            left: container.getBoundingClientRect().left
          }
        };
      });
    });
    
    // Separate missing and present thumbnails
    const missingThumbnails = thumbnailAnalysis.filter(t => !t.hasImage);
    const presentThumbnails = thumbnailAnalysis.filter(t => t.hasImage);
    
    console.log(`\\n📊 THUMBNAIL ANALYSIS RESULTS:`);
    console.log(`   Total containers: ${thumbnailAnalysis.length}`);
    console.log(`   ✅ With images: ${presentThumbnails.length}`);
    console.log(`   ❌ Missing images: ${missingThumbnails.length}`);
    
    if (missingThumbnails.length > 0) {
      console.log('\\n❌ MISSING THUMBNAILS:');
      missingThumbnails.forEach(thumb => {
        console.log(`   ${thumb.index}. "${thumb.title}"`);
        console.log(`      Position: ${Math.round(thumb.position.top)}px from top`);
      });
    }
    
    if (presentThumbnails.length > 0) {
      console.log('\\n✅ FIRST 10 PRESENT THUMBNAILS:');
      presentThumbnails.slice(0, 10).forEach(thumb => {
        const filename = thumb.imageUrl ? thumb.imageUrl.split('/').pop() : 'unknown';
        console.log(`   ${thumb.index}. "${thumb.title}"`);
        console.log(`      Image: ${filename}`);
      });
    }
    
    // Check if there's a pattern in missing thumbnails
    if (missingThumbnails.length > 0) {
      console.log('\\n🔍 PATTERN ANALYSIS:');
      
      // Check if missing thumbnails are clustered in certain positions
      const missingPositions = missingThumbnails.map(t => t.index);
      console.log(`   Missing at positions: ${missingPositions.join(', ')}`);
      
      // Check if there's a loading delay issue
      console.log('\\n⏳ Waiting 10 more seconds to see if any load...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Re-check after delay
      const thumbnailAnalysisAfterDelay = await page.evaluate(() => {
        const containers = Array.from(document.querySelectorAll('.MuiCardMedia-root'));
        return containers.map((container, index) => {
          const style = window.getComputedStyle(container);
          return {
            index: index + 1,
            hasImage: style.backgroundImage !== 'none'
          };
        });
      });
      
      const stillMissing = thumbnailAnalysisAfterDelay.filter(t => !t.hasImage);
      const nowLoaded = missingThumbnails.length - stillMissing.length;
      
      if (nowLoaded > 0) {
        console.log(`   🎉 ${nowLoaded} thumbnails loaded after delay!`);
      } else {
        console.log(`   ⚠️  Still ${stillMissing.length} thumbnails missing after delay`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

analyzeMissingThumbnails().catch(console.error);