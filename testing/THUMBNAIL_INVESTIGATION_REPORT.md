# Thumbnail Investigation Report
**Date**: June 19, 2025  
**Issue**: Missing thumbnails on essays page showing as white boxes with borders

## How to Replicate This Investigation

### Step 1: Identify the Missing Thumbnails
1. Go to: https://edition-staging.makingandknowing.org/essays
2. Scroll through the page and look for **white boxes with borders** instead of thumbnail images
3. Count how many you see and note their approximate positions

**Expected Result**: You should see 3 white boxes at positions roughly 5, 8, and 11 in the grid

### Step 2: Inspect the Missing Thumbnails in Browser
1. Right-click on a white box → "Inspect Element"
2. Look for the element with class `MuiCardMedia-root`
3. In the CSS styles panel, check the `background-image` property

**Expected Result**: You'll see `background-image: none` instead of a URL

### Step 3: Check What the Working Thumbnails Look Like
1. Right-click on a working thumbnail → "Inspect Element" 
2. Look at the `background-image` property in CSS
3. Note the URL pattern

**Expected Result**: You'll see URLs like:
```
background-image: url("https://edition-assets.makingandknowing.org/thumbnails/Smith_thumbnail.jpg")
```

### Step 4: Map Essays to Their Expected Thumbnails
Open browser developer tools and run this JavaScript in the console:

```javascript
// Get essay titles and thumbnail URLs
Array.from(document.querySelectorAll('.MuiCard-root')).slice(0, 15).map((card, index) => {
  const media = card.querySelector('.MuiCardMedia-root');
  const style = media ? window.getComputedStyle(media) : null;
  const content = card.querySelector('.MuiCardContent-root');
  const title = content ? content.textContent.trim() : 'Unknown';
  
  let imageUrl = 'MISSING';
  if (style && style.backgroundImage !== 'none') {
    const match = style.backgroundImage.match(/url\("([^"]+)"\)/);
    imageUrl = match ? match[1].split('/').pop() : 'ERROR';
  }
  
  return {
    position: index + 1,
    title: title.split('\n')[0].replace('An Introduction', '').trim(),
    thumbnail: imageUrl
  };
});
```

**Expected Result**: You'll see output like:
```
1. "Introduction to Ms. Fr. 640 (1)" → Smith_thumbnail.jpg
2. "Physical Construction (2)" → Hagadorn_thumbnail.jpg  
3. "Le contexte toulousain (3)" → Contexte-Toulousain_Thumbnail.jpg
4. "The Toulouse Context (4)" → Context-Toulouse-TL_Thumbnail.jpg
5. "Le Ms. Fr. 640 et la collection Béthune (5)" → MISSING
6. "Ms. Fr. 640 and the Béthune Collection (6)" → [some filename]
7. [title] → Masse-TL_Thumbnail.jpg
8. "Raymond Masse, marchand-orfèvre (8)" → MISSING  
9. [title] → Munoz_Thumbnail-Fraysse.jpg
10. [title] → Bertin-TL_Thumbnail.jpg
11. "Dominique Bertin et Hélie Bachelier (11)" → MISSING
```

### Step 5: Identify the Naming Conflict
Look at the results from Step 4 and notice:

- **Essay #7** uses `Masse-TL_Thumbnail.jpg`
- **Essay #8** is about "Raymond Masse" but has NO thumbnail
- **Essay #10** uses `Bertin-TL_Thumbnail.jpg`  
- **Essay #11** is about "Dominique Bertin" but has NO thumbnail

**Conclusion**: The thumbnails for essays #8 and #11 appear to have been uploaded with names that were already taken by essays #7 and #10.

### Step 6: Verify the Conflict Theory
Test if the thumbnail files exist by checking these URLs directly in your browser:

1. https://edition-assets.makingandknowing.org/thumbnails/Masse-TL_Thumbnail.jpg
2. https://edition-assets.makingandknowing.org/thumbnails/Bertin-TL_Thumbnail.jpg

**Expected Result**: Both should load images, but they're being used by the wrong essays.

## Summary of Findings

### The Real Issue
- **NOT** 133 missing images (that was a testing error)
- **Just 3 specific thumbnails** missing from newly added essays
- **Root cause**: Filename conflicts during upload process

### Missing Essays (by Colin Debuiche)
1. **Essay #5**: "Le Ms. Fr. 640 et la collection Béthune (5)"
2. **Essay #8**: "Raymond Masse, marchand-orfèvre (8)" 
3. **Essay #11**: "Dominique Bertin et Hélie Bachelier (11)"

### The Naming Conflict
- Essay #8 about "Raymond Masse" should have `Masse-TL_Thumbnail.jpg` but it's taken by essay #7
- Essay #11 about "Dominique Bertin" should have `Bertin-TL_Thumbnail.jpg` but it's taken by essay #10
- Essay #5 about "Béthune Collection" needs a new filename entirely

## Recommended Solution

Upload new thumbnail files with unique names:
- `Bethune-Collection-TL_Thumbnail.jpg` (for essay #5)
- `Raymond-Masse-TL_Thumbnail.jpg` (for essay #8)  
- `Dominique-Bertin-TL_Thumbnail.jpg` (for essay #11)

Then update the content management system to reference these new filenames.

## Testing Scripts Created
All investigation scripts are in `/testing/` directory:
- `identify-new-thumbnails.js` - Identifies missing thumbnails
- `investigate-thumbnail-patterns.js` - Analyzes naming patterns
- `test-essays-page.js` - Full essay page analysis

You can run any of these to verify the findings.