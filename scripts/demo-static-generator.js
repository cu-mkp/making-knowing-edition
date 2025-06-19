#!/usr/bin/env node

/**
 * Demo script to test the static essays generator
 */

const StaticEssaysGenerator = require('./generate-static-essays');
const fs = require('fs');
const path = require('path');

async function demo() {
  console.log('🧪 Running Static Essays Generator Demo...');
  
  try {
    const generator = new StaticEssaysGenerator();
    await generator.generate();
    
    // Show what was generated
    const outputDir = path.join(__dirname, '../static-essays');
    
    console.log('\\n📋 Generated Files:');
    console.log('='.repeat(50));
    
    if (fs.existsSync(outputDir)) {
      showDirectoryContents(outputDir, '');
    } else {
      console.log('❌ Output directory not found');
    }
    
    console.log('\\n🌐 To test the generated static site:');
    console.log('1. cd static-essays');
    console.log('2. python3 -m http.server 8000');
    console.log('3. Open http://localhost:8000/essays/');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('\\n💡 This is expected if data files are not in the expected location.');
    console.log('   The script looks for data in: public/bnf-ms-fr-640/staging031824-0/');
  }
}

function showDirectoryContents(dir, indent) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      console.log(`${indent}📁 ${item}/`);
      showDirectoryContents(itemPath, indent + '  ');
    } else {
      const size = (stats.size / 1024).toFixed(1);
      console.log(`${indent}📄 ${item} (${size}KB)`);
    }
  });
}

demo();