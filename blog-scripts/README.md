# Blog Generation & Indexing System

Automated system for generating 1000+ SEO-optimized blog posts and getting them indexed.

## Quick Start

```bash
# 1. Add keywords to CSV
cp keywords-template.csv keywords.csv
# Edit keywords.csv with your topics

# 2. Generate content (see Content Generation section)
# Add .json or .md files to content/ folder

# 3. Generate HTML blogs
node generate-blogs.js

# 4. Generate sitemap
node generate-sitemap.js

# 5. Setup IndexNow (one-time)
node submit-indexnow.js --setup

# 6. Submit for indexing
node submit-indexnow.js --all
```

## Directory Structure

```
blog-scripts/
├── keywords.csv              # Your keyword list (copy from template)
├── keywords-template.csv     # Template with example entries
├── content/                  # Blog content files
│   ├── my-blog-slug.json     # Structured content (recommended)
│   ├── another-blog.md       # Markdown content
│   └── third-blog.html       # Raw HTML content
├── generate-blogs.js         # Generates HTML from CSV + content
├── generate-sitemap.js       # Creates sitemap.xml and robots.txt
├── submit-indexnow.js        # Instant indexing for Bing/Yandex
└── README.md                 # This file
```

## CSV Format

| Column | Description | Example |
|--------|-------------|---------|
| `slug` | URL slug (no spaces/special chars) | `industrial-iot-benefits` |
| `title` | SEO title (<60 chars) | `Industrial IoT Benefits: 12 Ways...` |
| `meta_description` | Meta description (140-160 chars) | `Discover 12 proven industrial IoT...` |
| `primary_keyword` | Main keyword to rank for | `industrial IoT benefits` |
| `secondary_keywords` | Comma-separated related terms | `IIoT advantages,smart manufacturing` |
| `category` | Blog category | `Industrial IoT` |
| `search_intent` | informational/commercial/transactional | `commercial` |
| `target_word_count` | Target length | `1800` |
| `author` | Author name | `Anexee Engineering Team` |

## Content Generation

### Option 1: JSON Format (Recommended)

Create `content/{slug}.json`:

```json
{
    "introduction": "Opening paragraph with primary keyword...",

    "sections": [
        {
            "heading": "What is {Primary Keyword}?",
            "content": "Definition paragraph...",
            "subsections": [
                {
                    "heading": "Subsection Title",
                    "content": "Subsection content..."
                }
            ],
            "list": [
                {
                    "title": "Benefit 1",
                    "description": "Description of benefit..."
                }
            ]
        }
    ],

    "faqs": [
        {
            "question": "Common question about topic?",
            "answer": "Direct answer in 2-3 sentences."
        }
    ],

    "keyTakeaways": [
        {
            "title": "Key point 1",
            "description": "Brief explanation"
        }
    ]
}
```

### Option 2: Markdown Format

Create `content/{slug}.md`:

```markdown
Opening paragraph with **primary keyword** naturally included.

## What is {Primary Keyword}?

Definition and explanation...

## Key Benefits

- **Benefit 1**: Description
- **Benefit 2**: Description

## How to Implement

### Step 1: First Step
Detailed instructions...

### Step 2: Second Step
More details...

## Frequently Asked Questions

### Question one?
Answer one.

### Question two?
Answer two.
```

### Option 3: Raw HTML

Create `content/{slug}.html` with the article body HTML only (no head/nav/footer).

## Bulk Content Generation with Claude

For 1000+ blogs, use Claude API to generate content:

```bash
# Install dependencies
npm install @anthropic-ai/sdk csv-parse

# Create generate-content.js (see below)
# Run batch generation
node generate-content.js
```

### Sample Batch Script

```javascript
// generate-content.js
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const client = new Anthropic();

async function generateContent(row) {
    const prompt = `Generate a comprehensive blog post following this structure:

Topic: ${row.title}
Primary Keyword: ${row.primary_keyword}
Secondary Keywords: ${row.secondary_keywords}
Target Word Count: ${row.target_word_count}
Search Intent: ${row.search_intent}

Return ONLY valid JSON in this exact format:
{
    "introduction": "Opening paragraph (100-150 words)...",
    "sections": [
        {
            "heading": "H2 heading",
            "content": "Section content...",
            "subsections": [{"heading": "H3", "content": "..."}],
            "list": [{"title": "Item", "description": "..."}]
        }
    ],
    "faqs": [{"question": "?", "answer": "..."}],
    "keyTakeaways": [{"title": "Point", "description": "..."}]
}

Follow SEO best practices:
- Use primary keyword in first 100 words
- Include secondary keywords naturally
- Answer-first paragraphs (GEO optimized)
- Specific metrics and examples
- Actionable advice`;

    const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].text;
}

async function main() {
    const csv = fs.readFileSync('keywords.csv', 'utf-8');
    const rows = parse(csv, { columns: true });

    for (const row of rows) {
        console.log(`Generating: ${row.slug}`);
        try {
            const content = await generateContent(row);
            fs.writeFileSync(`content/${row.slug}.json`, content);
            console.log(`  ✓ Saved content/${row.slug}.json`);
        } catch (err) {
            console.log(`  ✗ Error: ${err.message}`);
        }
        // Rate limiting
        await new Promise(r => setTimeout(r, 1000));
    }
}

main();
```

## Indexing Strategy

### 1. Sitemap (All Search Engines)

```bash
# Generate sitemap
node generate-sitemap.js

# Submit to:
# - Google Search Console: https://search.google.com/search-console
# - Bing Webmaster Tools: https://www.bing.com/webmasters
```

### 2. IndexNow (Instant - Bing, Yandex, Seznam, Naver)

```bash
# One-time setup
node submit-indexnow.js --setup
# Commit and push the generated key file

# Submit all blogs
node submit-indexnow.js --all

# Submit single URL
node submit-indexnow.js --url /blog/my-new-post
```

### 3. Google Indexing API (For Job/Event Pages)

Google's Indexing API is officially only for JobPosting and BroadcastEvent pages. For regular blog content, rely on sitemap submission.

## Automation with GitHub Actions

Create `.github/workflows/blog-indexing.yml`:

```yaml
name: Blog Generation & Indexing

on:
  push:
    paths:
      - 'blog-scripts/keywords.csv'
      - 'blog-scripts/content/**'

jobs:
  generate-and-index:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Generate blogs
        run: node blog-scripts/generate-blogs.js

      - name: Generate sitemap
        run: node blog-scripts/generate-sitemap.js

      - name: Submit to IndexNow
        run: node blog-scripts/submit-indexnow.js --all

      - name: Commit changes
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add blog/ sitemap.xml robots.txt
          git commit -m "Auto-generate blogs and sitemap" || exit 0
          git push
```

## Cost Analysis (1000 Blogs)

| Item | Cost |
|------|------|
| Claude API (content generation) | ~$30-50 (using Haiku) |
| GitHub Pages hosting | FREE |
| IndexNow API | FREE |
| Google Search Console | FREE |
| Bing Webmaster Tools | FREE |
| **Total** | **~$30-50** |

## SEO Template Reference

All generated blogs follow the structure in `../blog/SEO-BLOG-TEMPLATE.md`:

1. **Title & Meta**: Keyword-optimized, <60 chars
2. **Introduction**: Hook + keyword in first 100 words
3. **Definition Section**: What is X?
4. **How It Works**: Key components
5. **Benefits**: Bulleted with metrics
6. **Implementation Guide**: Step-by-step
7. **Common Mistakes**: What to avoid
8. **FAQs**: Natural language questions (GEO)
9. **Key Takeaways**: Summary bullets
10. **CTA**: Single clear action

## Troubleshooting

### "No content file found"
Create a content file in `content/` matching the slug from your CSV.

### IndexNow 403 Error
Your API key file isn't accessible. Ensure `{key}.txt` is in the root directory and deployed.

### Sitemap not updating
Run `node generate-sitemap.js` after generating new blogs.

## Next Steps

1. Export 1000 keywords from Ubersuggest/Ahrefs/SEMrush
2. Add to `keywords.csv`
3. Generate content using Claude API batch script
4. Run `node generate-blogs.js`
5. Run `node generate-sitemap.js`
6. Commit and push to deploy
7. Run `node submit-indexnow.js --all`
8. Submit sitemap to Google Search Console
