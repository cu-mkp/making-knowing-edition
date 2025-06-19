#!/usr/bin/env node

/**
 * Identify the specific newly added thumbnails that are missing
 */

const playwright = require('../dependencies/node_modules/playwright');

async function identifyNewThumbnails() {
  console.log('🔍 Identifying specific missing thumbnails...');
  
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('https://edition-staging.makingandknowing.org/essays', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(5000);
    
    // Get detailed info about all cards, especially the missing ones
    const cardDetails = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.MuiCard-root'));
      
      return cards.map((card, index) => {
        const mediaContainer = card.querySelector('.MuiCardMedia-root');
        const style = mediaContainer ? window.getComputedStyle(mediaContainer) : null;
        
        // Extract all text content from the card to identify the essay
        const titleElement = card.querySelector('.MuiTypography-h6, .MuiCardContent-root h6, [class*="title"]');
        const contentElement = card.querySelector('.MuiCardContent-root');
        
        let title = 'Unknown';
        let author = 'Unknown';
        let fullText = '';
        
        if (titleElement) {
          title = titleElement.textContent.trim();
        }
        
        if (contentElement) {
          fullText = contentElement.textContent.trim();
          // Try to extract author from common patterns
          const lines = fullText.split('\n').map(l => l.trim()).filter(l => l);
          if (lines.length > 1) {
            // Often the second line is the author
            author = lines[1];
          }
        }
        
        let hasImage = false;
        let imageUrl = null;
        let expectedImageUrl = null;
        
        if (style && style.backgroundImage !== 'none') {
          hasImage = true;
          const urlMatch = style.backgroundImage.match(/url\\(["']?([^"')]+)["']?\\)/);
          if (urlMatch) {
            imageUrl = urlMatch[1];
          }
        } else if (mediaContainer) {
          // Check if there's supposed to be an image by looking at data attributes or other indicators
          const rect = mediaContainer.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            // This container is sized for an image but doesn't have one
            expectedImageUrl = 'MISSING - container exists but no background image';
          }
        }
        
        return {
          cardIndex: index + 1,
          title,
          author,
          fullText: fullText.substring(0, 200) + (fullText.length > 200 ? '...' : ''),
          hasImage,
          imageUrl,
          expectedImageUrl,
          containerExists: !!mediaContainer
        };
      });
    });
    
    // Filter to just the missing ones
    const missingThumbnails = cardDetails.filter(card => 
      card.containerExists && !card.hasImage
    );
    
    console.log(`\\n❌ MISSING THUMBNAILS (${missingThumbnails.length} found):`);
    missingThumbnails.forEach(card => {
      console.log(`\\n${card.cardIndex}. Title: "${card.title}"`);
      console.log(`   Author: "${card.author}"`);
      console.log(`   Full text preview: "${card.fullText}"`);
      console.log(`   Expected image: ${card.expectedImageUrl}`);
    });
    
    // Also check what the working thumbnails look like for comparison
    const workingThumbnails = cardDetails.filter(card => card.hasImage).slice(0, 5);
    
    console.log(`\\n✅ WORKING THUMBNAILS (first 5 for comparison):`);
    workingThumbnails.forEach(card => {
      console.log(`\\n${card.cardIndex}. Title: "${card.title}"`);
      console.log(`   Author: "${card.author}"`);
      const filename = card.imageUrl ? card.imageUrl.split('/').pop() : 'unknown';
      console.log(`   Image: ${filename}`);
      console.log(`   Full URL: ${card.imageUrl}`);
    });
    
    // Test if the missing images might exist at different URLs
    if (missingThumbnails.length > 0) {
      console.log(`\\n🧪 TESTING POSSIBLE URLS FOR MISSING IMAGES:`);
      
      for (const missing of missingThumbnails) {
        console.log(`\\nTesting URLs for: "${missing.title}"`);
        
        // Generate possible filename patterns based on title/author
        const possibleFilenames = [];
        
        if (missing.author && missing.author !== 'Unknown') {
          possibleFilenames.push(
            `${missing.author.replace(/\\s+/g, '_')}_thumbnail.jpg`,
            `${missing.author.replace(/\\s+/g, '_')}_Thumbnail.jpg`,
            `${missing.author.replace(/\\s+/g, '')}_thumbnail.jpg`,
            `${missing.author.replace(/\\s+/g, '')}_Thumbnail.jpg`
          );
        }
        
        if (missing.title && missing.title !== 'Unknown') {
          possibleFilenames.push(
            `${missing.title.replace(/\\s+/g, '_')}_thumbnail.jpg`,
            `${missing.title.replace(/\\s+/g, '_')}_Thumbnail.jpg`
          );
        }
        
        // Test each possible URL
        for (const filename of possibleFilenames.slice(0, 3)) { // Test max 3 to avoid too many requests
          const testUrl = `https://edition-assets.makingandknowing.org/thumbnails/${filename}`;
          
          try {
            const response = await page.evaluate(async (url) => {
              try {
                const response = await fetch(url, { method: 'HEAD' });
                return {
                  url,
                  status: response.status,
                  exists: response.ok
                };
              } catch (e) {
                return {
                  url,
                  status: 'ERROR',
                  exists: false,
                  error: e.message
                };
              }
            }, testUrl);
            
            console.log(`   ${response.exists ? '✅' : '❌'} ${response.status}: ${filename}`);
            
          } catch (e) {
            console.log(`   ❌ ERROR: ${filename} - ${e.message}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

identifyNewThumbnails().catch(console.error);