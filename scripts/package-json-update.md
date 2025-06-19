# Package.json Updates for Static Essays

## Add these scripts to your package.json:

```json
{
  "scripts": {
    "generate-static-essays": "node scripts/generate-static-essays.js",
    "demo-static-essays": "node scripts/demo-static-generator.js",
    "build-with-static-essays": "npm-run-all build-css generate-static-essays build-js",
    "serve-static": "cd static-essays && python3 -m http.server 8000"
  }
}
```

## Usage:

### Generate static essays:
```bash
npm run generate-static-essays
```

### Test the generator (safe to run even without data):
```bash
npm run demo-static-essays
```

### Build everything including static essays:
```bash
npm run build-with-static-essays
```

### Serve the static site locally for testing:
```bash
npm run serve-static
# Then open http://localhost:8000/essays/
```

## Integration Options:

### Option 1: Replace React essays entirely
- Update main React router to redirect `/essays` to `/static-essays/essays/`
- Generate static files to `public/static-essays/` instead

### Option 2: Hybrid approach  
- Keep React for main app
- Serve static essays from subdomain (essays.makingandknowing.org)
- Or serve from `/static-essays/` path

### Option 3: Gradual migration
- Generate static versions alongside React
- A/B test performance and user experience
- Switch over when satisfied