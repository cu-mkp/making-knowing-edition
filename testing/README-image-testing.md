# Image Testing Scripts for Making & Knowing Edition

This directory contains scripts to test for missing images on the edition-staging.makingandknowing.org website.

## Directory Structure

```
testing/
├── test-images-standalone.js    # Full React testing script (requires Playwright)
├── test-images-simple.js        # Simple HTML testing script (no dependencies)
└── README-image-testing.md      # This documentation

../dependencies/                 # Dependencies directory (gitignored)
├── package.json                 # Playwright and other testing dependencies
└── node_modules/               # Installed dependencies (created after npm install)
```

**Note**: The `dependencies/` directory is gitignored to keep the repository clean while allowing local testing dependencies.

## Scripts Overview

### 1. `test-images-standalone.js` - **Recommended for React Sites**
- **Best for**: Full testing of React-rendered content
- **Technology**: Uses Playwright for headless browser automation
- **Capabilities**: 
  - Handles client-side rendering
  - Detects dynamically loaded images
  - Tests both `<img>` tags and CSS background images
  - Waits for React components to fully render
  - Provides comprehensive network request monitoring

### 2. `test-images-simple.js` - **Basic HTML Testing**
- **Best for**: Quick testing of static HTML content
- **Technology**: Uses Node.js built-in modules only
- **Capabilities**:
  - No external dependencies
  - Fast execution
  - Tests images found in static HTML
  - Limited to server-side rendered content

## Quick Start

### Option 1: Full React Testing (Recommended)

```bash
# Easy setup using the provided script (only needed once)
./setup.sh

# Or manual setup:
# cd ../dependencies
# npm install
# npx playwright install
# cd ../testing

# Run the comprehensive test
node test-images-standalone.js
```

### Option 2: Simple HTML Testing

```bash
# No installation needed - uses Node.js built-ins only
node test-images-simple.js
```

## Detailed Usage

### Comprehensive Testing with Playwright

The `test-images-standalone.js` script provides the most thorough testing:

```bash
node test-images-standalone.js
```

**What it does:**
1. Tests connectivity to the staging site
2. Discovers additional routes by crawling the homepage
3. For each page:
   - Loads the page in a headless browser
   - Waits for React to render content
   - Extracts all `<img>` elements and CSS background images
   - Monitors network requests for image resources
   - Reports any HTTP 4xx/5xx errors or failed image loads

**Routes tested by default:**
- `/` (Homepage)
- `/essays` (Essays listing)
- `/content/about/overview` (About page)
- `/content/about/manuscript` (Manuscript info)
- `/entries` (Entries listing)
- `/folios` (Folios browser)
- `/folios/001r/normalized` (Sample folio)
- `/folios/001r/translated` (Sample folio translation)
- `/folios/001r/diplomatic` (Sample folio diplomatic)
- `/search` (Search page)

### Simple Testing

The `test-images-simple.js` script provides basic testing:

```bash
node test-images-simple.js
```

**What it does:**
1. Fetches HTML content of each page
2. Parses HTML for `<img>` tags and CSS background images
3. Tests each image URL with HTTP HEAD requests
4. Reports any HTTP errors

**Limitations:**
- Only detects images in static HTML
- Cannot see React-rendered content
- May miss dynamically loaded images

## Output and Reports

Both scripts generate detailed reports:

### Console Output
- Real-time progress for each page tested
- Summary of images found and any issues
- Final summary with totals

### Generated Files

**Playwright Script:**
- `image-test-report.json` - Detailed JSON report
- `image-test-report.txt` - Human-readable summary

**Simple Script:**
- `simple-image-test-report.json` - Basic JSON report  
- `simple-image-test-report.txt` - Basic text summary

### Sample Report Content

```
SUMMARY
- Pages tested: 15
- Total images: 127
- Missing images: 3
- Pages with errors: 0

MISSING IMAGES FOUND:
1. https://edition-staging.makingandknowing.org/img/missing-figure.png
   Page: https://edition-staging.makingandknowing.org/folios/045r/normalized
   Reason: HTTP 404 - Not Found
   Type: DOM_IMG
```

## Customization

### Adding More Routes

Edit the `ROUTES_TO_TEST` array in either script:

```javascript
const ROUTES_TO_TEST = [
  '/',
  '/essays',
  '/your-custom-route',
  // ... more routes
];
```

### Changing Configuration

Key configuration options at the top of each script:

```javascript
const BASE_URL = 'https://edition-staging.makingandknowing.org';
const TIMEOUT = 30000; // 30 seconds
const VIEWPORT = { width: 1920, height: 1080 }; // Browser viewport
```

## Troubleshooting

### Playwright Issues

```bash
# If Playwright browser download fails
npx playwright install --force

# On some systems, you may need system dependencies
npx playwright install-deps
```

### Network Issues

If you get connection errors:
1. Check VPN/firewall settings
2. Verify the staging site is accessible in your browser
3. Try increasing the `TIMEOUT` value in the script

### False Positives

Some images may be reported as missing but are actually:
- Lazy-loaded (loaded on scroll)
- Conditionally loaded based on user interaction
- Protected by authentication
- Using different CDN endpoints

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Image Link Check
on: [push, pull_request]
jobs:
  test-images:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install playwright
      - run: npx playwright install --with-deps
      - run: node test-images-standalone.js
```

### Exit Codes

- `0` - All images loaded successfully
- `1` - Missing images found or script error

## Advanced Features

### Custom User Agent

The Playwright script uses a realistic browser user agent. To customize:

```javascript
// In test-images-standalone.js
const context = await this.browser.newContext({
  viewport: VIEWPORT,
  userAgent: 'Your Custom User Agent'
});
```

### Request Filtering

To ignore certain types of requests or domains:

```javascript
page.on('request', (request) => {
  const url = request.url();
  
  // Skip certain domains
  if (url.includes('analytics.google.com')) {
    request.abort();
    return;
  }
  
  request.continue();
});
```

## Best Practices

1. **Run regularly**: Set up automated testing to catch issues early
2. **Test staging first**: Always test staging before production deployments
3. **Monitor performance**: Large image sets may take time to test
4. **Review reports**: Don't just check exit codes - review the detailed reports
5. **Handle dynamic content**: Some missing images may be expected (user-generated content, etc.)

## Support

For issues with these scripts:
1. Check the generated report files for detailed error information
2. Verify the staging site is accessible in a browser
3. Try the simple script first to isolate browser-specific issues
4. Check network connectivity and firewall settings