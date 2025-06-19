#!/usr/bin/env node

/**
 * Investigate the actual file naming patterns of working thumbnails
 */

const playwright = require('../dependencies/node_modules/playwright');

async function investigateThumbnailPatterns() {
  console.log('🔍 Investigating thumbnail naming patterns...');
  
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
    
    // Get detailed info about the first 15 essays to see the pattern
    const essayThumbnails = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.MuiCard-root')).slice(0, 15);
      
      return cards.map((card, index) => {
        const mediaContainer = card.querySelector('.MuiCardMedia-root');
        const style = mediaContainer ? window.getComputedStyle(mediaContainer) : null;
        
        // Extract essay title and number
        const contentElement = card.querySelector('.MuiCardContent-root');
        let fullText = contentElement ? contentElement.textContent.trim() : '';
        
        // Try to extract the essay number from the title
        const numberMatch = fullText.match(/\\((\\d+)\\)/);
        const essayNumber = numberMatch ? numberMatch[1] : null;
        
        // Extract just the main title (before author)
        let title = fullText.split('\\n')[0] || fullText.split('Colin Debuiche')[0] || fullText;
        title = title.replace(/An Introduction/, '').trim();
        
        let hasImage = false;
        let imageUrl = null;
        let filename = null;
        
        if (style && style.backgroundImage !== 'none') {
          hasImage = true;
          const urlMatch = style.backgroundImage.match(/url\\(["']?([^"')]+)["']?\\)/);
          if (urlMatch) {
            imageUrl = urlMatch[1];
            filename = imageUrl.split('/').pop();
          }
        }
        
        return {
          cardIndex: index + 1,
          essayNumber,
          title: title.substring(0, 80) + (title.length > 80 ? '...' : ''),
          hasImage,
          filename,
          fullUrl: imageUrl,
          isMissing: !hasImage && !!mediaContainer
        };
      });
    });
    
    console.log('\\n📋 ESSAY THUMBNAIL ANALYSIS (First 15 essays):');
    console.log('=' .repeat(80));
    
    essayThumbnails.forEach(essay => {
      const status = essay.isMissing ? '❌ MISSING' : essay.hasImage ? '✅ PRESENT' : '⚪ NO CONTAINER';
      console.log(`\\n${essay.cardIndex}. Essay #${essay.essayNumber || '?'}: ${status}`);
      console.log(`   Title: "${essay.title}"`);
      if (essay.filename) {
        console.log(`   Filename: ${essay.filename}`);
        console.log(`   Full URL: ${essay.fullUrl}`);
      }
    });
    
    // Analyze the naming pattern for working thumbnails
    const workingThumbnails = essayThumbnails.filter(e => e.hasImage && e.filename);
    
    if (workingThumbnails.length > 0) {
      console.log('\\n🔍 NAMING PATTERN ANALYSIS:');
      console.log('-'.repeat(50));
      
      workingThumbnails.forEach(thumb => {
        console.log(`Essay #${thumb.essayNumber}: ${thumb.filename}`);
      });
      
      // Look for patterns
      const filenames = workingThumbnails.map(t => t.filename);
      const hasNumberPattern = filenames.some(f => /\\d/.test(f));
      const hasDebuichePattern = filenames.some(f => f.toLowerCase().includes('debuiche'));
      const hasIntroPattern = filenames.some(f => f.toLowerCase().includes('intro'));
      
      console.log('\\n📊 Pattern Detection:');
      console.log(`   Contains numbers: ${hasNumberPattern}`);
      console.log(`   Contains "debuiche": ${hasDebuichePattern}`);
      console.log(`   Contains "intro": ${hasIntroPattern}`);
    }
    
    // Based on the pattern, predict what the missing files should be named
    const missingEssays = essayThumbnails.filter(e => e.isMissing);
    
    if (missingEssays.length > 0 && workingThumbnails.length > 0) {
      console.log('\\n🎯 PREDICTED MISSING FILENAMES:');
      console.log('-'.repeat(40));
      
      // Try to derive pattern from working examples
      const sampleWorking = workingThumbnails[0];
      const basePattern = sampleWorking.filename;
      
      missingEssays.forEach(missing => {
        console.log(`\\nEssay #${missing.essayNumber}:`);
        
        // Generate possible filenames based on observed patterns
        const possibleNames = [];
        
        if (missing.essayNumber) {
          // Pattern based on essay numbers
          possibleNames.push(`Debuiche_${missing.essayNumber}_thumbnail.jpg`);
          possibleNames.push(`Debuiche_${missing.essayNumber}_Thumbnail.jpg`);
          possibleNames.push(`Colin_Debuiche_${missing.essayNumber}_thumbnail.jpg`);
          possibleNames.push(`Introduction_${missing.essayNumber}_thumbnail.jpg`);
          possibleNames.push(`Intro_${missing.essayNumber}_thumbnail.jpg`);
        }
        
        possibleNames.forEach(name => {
          console.log(`   Possible: ${name}`);
        });
      });
    }
    
    // Test a few of the predicted filenames
    if (missingEssays.length > 0) {
      console.log('\\n🧪 TESTING PREDICTED FILENAMES:');
      console.log('-'.repeat(40));
      
      const testFilenames = [
        'Debuiche_5_thumbnail.jpg',
        'Debuiche_8_thumbnail.jpg', 
        'Debuiche_11_thumbnail.jpg',
        'Debuiche_5_Thumbnail.jpg',
        'Debuiche_8_Thumbnail.jpg',
        'Debuiche_11_Thumbnail.jpg'
      ];
      
      for (const filename of testFilenames) {
        const testUrl = `https://edition-assets.makingandknowing.org/thumbnails/${filename}`;
        
        try {
          const response = await page.evaluate(async (url) => {
            try {
              const response = await fetch(url, { method: 'HEAD' });
              return {
                status: response.status,
                exists: response.ok
              };
            } catch (e) {
              return {
                status: 'ERROR',
                exists: false
              };
            }
          }, testUrl);
          
          console.log(`   ${response.exists ? '✅ FOUND' : '❌ NOT FOUND'} (${response.status}): ${filename}`);
          
        } catch (e) {
          console.log(`   ❌ ERROR: ${filename}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

investigateThumbnailPatterns().catch(console.error);