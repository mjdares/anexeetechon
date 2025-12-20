# Blog Generation Guide for Content Team

This guide explains how to generate and publish SEO-optimized blogs at scale.

---

## Prerequisites

Before starting, ensure you have:

1. **Node.js installed** - Check with: `node --version`
2. **Anthropic API Key** - Get from: https://console.anthropic.com/settings/keys
3. **Terminal access** - Use Terminal (Mac/Linux) or Command Prompt (Windows)

---

## One-Time Setup

Run these commands once to set up the system:

```bash
# Navigate to blog-scripts folder
cd /home/mayank/Anexee_Motion_Website/blog-scripts

# Install required package
npm install @anthropic-ai/sdk
```

---

## Step-by-Step Workflow

### Step 1: Add Keywords to CSV

Open `keywords.csv` in Excel or Google Sheets and add your keywords:

| Column | What to Enter | Example |
|--------|---------------|---------|
| slug | URL-friendly name (no spaces) | `predictive-maintenance-guide` |
| title | SEO title (under 60 chars) | `Predictive Maintenance: Complete Guide 2025` |
| meta_description | Description (140-160 chars) | `Learn how predictive maintenance reduces...` |
| primary_keyword | Main keyword to rank for | `predictive maintenance` |
| secondary_keywords | Related terms (comma-separated) | `condition monitoring, PdM, equipment failure` |
| category | Blog category | `Maintenance` |
| search_intent | Type of search | `informational` or `commercial` |
| target_word_count | Target length | `1800` |
| author | Author name | `Anexee Engineering Team` |

Save the file when done.

---

### Step 2: Set API Key

**Linux/Mac:**
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
```

**Windows Command Prompt:**
```cmd
set ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Windows PowerShell:**
```powershell
$env:ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
```

---

### Step 3: Generate Content

```bash
# Generate content for all keywords in CSV
node generate-content.js
```

This creates JSON files in the `content/` folder for each keyword.

**Options:**

```bash
# Preview without generating (dry run)
node generate-content.js --dry-run

# Generate for single keyword only
node generate-content.js --single predictive-maintenance-guide

# Use better quality model (costs more)
node generate-content.js --model sonnet
```

**Model Costs:**

| Model | Quality | Cost per Blog |
|-------|---------|---------------|
| haiku (default) | Good | ~$0.01 |
| sonnet | Better | ~$0.05 |
| opus | Best | ~$0.25 |

---

### Step 4: Generate HTML Blogs

```bash
node generate-blogs.js
```

This converts content JSON files into HTML pages in the `blog/` folder.

---

### Step 5: Generate Sitemap

```bash
node generate-sitemap.js
```

This updates `sitemap.xml` and `robots.txt` with all your pages.

---

### Step 6: Submit for Indexing

**First time only - Setup IndexNow:**
```bash
node submit-indexnow.js --setup
```

**Submit all blogs for instant indexing:**
```bash
node submit-indexnow.js --all
```

---

### Step 7: Push to GitHub

```bash
cd /home/mayank/Anexee_Motion_Website
git add .
git commit -m "Add new blog posts"
git push
```

---

## Quick Reference Commands

Copy-paste these commands in order:

```bash
# Set API key (replace with your actual key)
export ANTHROPIC_API_KEY="sk-ant-api03-xxxxx"

# Navigate to folder
cd /home/mayank/Anexee_Motion_Website/blog-scripts

# Generate content from CSV
node generate-content.js

# Generate HTML blogs
node generate-blogs.js

# Update sitemap
node generate-sitemap.js

# Submit for indexing
node submit-indexnow.js --all

# Push to GitHub
cd .. && git add . && git commit -m "Add new blogs" && git push
```

---

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
You need to set the API key. See Step 2 above.

### "No content file found"
The content generator didn't create a file for that keyword. Check:
- Is the slug spelled correctly in CSV?
- Did `generate-content.js` run without errors?

### "@anthropic-ai/sdk not installed"
Run: `npm install @anthropic-ai/sdk`

### "Rate limited"
Wait 1 minute and try again. The system has built-in delays to prevent this.

### Blog not appearing on website
1. Check if HTML file exists in `blog/` folder
2. Make sure you ran `git push`
3. Wait a few minutes for deployment

---

## File Locations

| File | Purpose |
|------|---------|
| `keywords.csv` | Your keyword list (edit this) |
| `content/` | Generated content JSON files |
| `../blog/` | Generated HTML blog pages |
| `../sitemap.xml` | Sitemap for search engines |
| `generated-urls.txt` | URLs of newly generated blogs |

---

## Indexing Timeline

| Search Engine | Method | Time to Index |
|---------------|--------|---------------|
| Bing, Yandex | IndexNow | Minutes to hours |
| Google | Sitemap | Days to weeks |

For Google, also submit sitemap manually at:
https://search.google.com/search-console

---

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Contact the development team

---

*Last updated: December 2025*
