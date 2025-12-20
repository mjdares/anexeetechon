# Anexee Logo Update Guide

## Where to Save Your Logo Files

```
Anexee_Motion_Website/
├── images/
│   ├── logo/
│   │   ├── anexee-logo.svg          ← Main logo (BEST - scalable)
│   │   ├── anexee-logo.png          ← Fallback (2x size: 400px wide)
│   │   ├── anexee-logo-white.svg    ← White version for dark backgrounds
│   │   └── anexee-logo-dark.svg     ← Dark version for light backgrounds
│   └── favicons/
│       ├── favicon.ico              ← Browser tab icon (32x32)
│       ├── favicon-16x16.png        ← 16x16 PNG
│       ├── favicon-32x32.png        ← 32x32 PNG
│       ├── apple-touch-icon.png     ← iOS icon (180x180)
│       └── og-image.png             ← Social media preview (1200x630)
```

---

## Recommended Logo Sizes

| File | Format | Size | Use Case |
|------|--------|------|----------|
| **Main Logo** | SVG | Vector | Navigation, footer |
| **Main Logo PNG** | PNG | 400x100px @2x | Fallback for old browsers |
| **Favicon** | ICO | 32x32 | Browser tab |
| **Apple Touch** | PNG | 180x180 | iOS home screen |
| **OG Image** | PNG/JPG | 1200x630 | Social media sharing |

---

## Step 1: Save Your Logo Files

### Option A: You Have SVG (Recommended)
```bash
# Copy your logo file to:
/home/mayank/Anexee_Motion_Website/images/logo/anexee-logo.svg
```

### Option B: You Have PNG/JPG
```bash
# Copy your logo file to:
/home/mayank/Anexee_Motion_Website/images/logo/anexee-logo.png

# Make sure it's at least 400px wide for retina displays
```

---

## Step 2: Update Navigation Logo

After saving your logo file, I'll help you update the HTML automatically.

**Currently (text-based):**
```html
<a href="index.html" class="logo">
    <span>ANEXEE</span>
    <span class="logo-subtitle">Analytical Excellence</span>
</a>
```

**Will become (image-based):**
```html
<a href="index.html" class="logo">
    <img src="images/logo/anexee-logo.svg" alt="Anexee" class="logo-img">
</a>
```

---

## Step 3: Update Favicon (Browser Tab Icon)

Save your favicon as:
```
/home/mayank/Anexee_Motion_Website/images/favicons/favicon.ico
```

---

## Quick Test

After saving your logo, test it:

1. **Local preview:**
   - Open `index.html` in browser
   - Check if logo shows correctly

2. **Multiple pages:**
   - Navigation logo appears on all pages
   - Footer logo (optional)
   - Blog pages

---

## Logo Design Best Practices

### ✅ Good Logo Files:
- **SVG format** (scalable, crisp on all screens)
- **Transparent background**
- **Optimized file size** (<100KB)
- **Properly named** (no spaces, lowercase)

### ⚠️ Avoid:
- ❌ JPEG with white background
- ❌ Too large file size (>500KB)
- ❌ Very tall logos (hard to fit in nav)
- ❌ Poor resolution PNGs (<200px wide)

---

## Example: Creating Favicon from Logo

If you have a logo but no favicon:

### Online Tools (Free):
1. **Favicon.io** - https://favicon.io/favicon-converter/
   - Upload your logo PNG
   - Download generated favicons
   - Save to `images/favicons/`

2. **RealFaviconGenerator** - https://realfavicongenerator.net/
   - Upload logo
   - Customize for different platforms
   - Download package

---

## Logo File Naming Convention

```
✅ Good:
- anexee-logo.svg
- anexee-logo-white.svg
- anexee-icon.png

❌ Bad:
- Logo Final v3 FINAL.png
- ANEXEE LOGO.svg
- logo (1).png
```

---

## After You Save Your Logo

Just let me know and I'll:
1. Update all HTML files to use the new logo
2. Add proper favicon links
3. Update social media meta tags
4. Ensure it displays correctly on all pages

---

## Current Status

- ✅ Directories created: `images/logo/` and `images/favicons/`
- ⏳ Waiting for logo files
- ⏳ HTML update pending

---

*Once you save your logo file(s), I'll update everything automatically!*
