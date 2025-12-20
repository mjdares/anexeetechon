#!/usr/bin/env node
/**
 * Bulk Content Generator using Claude API
 *
 * Generates SEO-optimized blog content for all keywords in CSV
 *
 * Setup:
 *   1. npm install @anthropic-ai/sdk
 *   2. Set API key: export ANTHROPIC_API_KEY="your-key-here"
 *   3. Run: node generate-content.js
 *
 * Options:
 *   --dry-run     Preview without generating
 *   --single      Generate for one slug only
 *   --model       Choose model (haiku/sonnet/opus) - default: haiku
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    csvFile: path.join(__dirname, 'keywords.csv'),
    contentDir: path.join(__dirname, 'content'),
    seoTemplatePath: path.join(__dirname, '..', 'blog', 'SEO-BLOG-TEMPLATE.md'),

    // Model options (haiku is cheapest, ~$0.01 per blog)
    models: {
        haiku: 'claude-3-5-haiku-20241022',
        sonnet: 'claude-sonnet-4-20250514',
        opus: 'claude-opus-4-20250514'
    },

    // Rate limiting
    delayBetweenRequests: 1000, // 1 second
    maxRetries: 3
};

// ============================================================================
// CSV PARSER
// ============================================================================

function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim() : '';
        });
        rows.push(row);
    }

    return rows;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    return result.map(s => s.replace(/^"|"$/g, ''));
}

// ============================================================================
// CONTENT GENERATION PROMPT
// ============================================================================

function buildPrompt(row) {
    return `You are an expert SEO content writer for Anexee, an industrial IoT platform company. Generate a comprehensive, SEO-optimized blog post.

## Input Details
- **Title**: ${row.title}
- **Primary Keyword**: ${row.primary_keyword}
- **Secondary Keywords**: ${row.secondary_keywords}
- **Category**: ${row.category}
- **Search Intent**: ${row.search_intent}
- **Target Word Count**: ${row.target_word_count} words
- **Target Audience**: Manufacturing engineers, operations managers, plant directors

## Requirements

### SEO Requirements
1. Use primary keyword in first 100 words
2. Include secondary keywords naturally throughout
3. Use primary keyword in at least one H2 heading
4. Each paragraph should be "answer-ready" for AI extraction (GEO optimized)

### Structure Requirements
1. **Introduction** (100-150 words): Hook with pain point/stat, mention primary keyword, promise of value
2. **Definition Section** (H2): "What is {Primary Keyword}?" - clear definition, why it matters
3. **How It Works** (H2): Key components or mechanisms
4. **Benefits Section** (H2): 5-8 benefits with metrics where possible
5. **Implementation Guide** (H2): Step-by-step process (4-6 steps)
6. **Common Mistakes** (H2): 3-5 mistakes and how to avoid them
7. **FAQs** (H2): 4-6 natural language questions with direct answers
8. **Key Takeaways**: 4-5 actionable summary points

### Writing Style
- Professional but accessible
- Use specific numbers and metrics
- Short paragraphs (2-3 sentences)
- Active voice
- No fluff or filler

## Output Format

Return ONLY valid JSON (no markdown code blocks, no explanation) in this exact structure:

{
    "introduction": "Opening paragraph with hook and primary keyword...",
    "sections": [
        {
            "heading": "What is {Primary Keyword}?",
            "content": "Definition paragraph...",
            "subsections": [
                {"heading": "Subsection Title", "content": "Content..."}
            ]
        },
        {
            "heading": "How {Primary Keyword} Works",
            "content": "Overview paragraph...",
            "subsections": [
                {"heading": "Component 1", "content": "Details..."}
            ]
        },
        {
            "heading": "Benefits of {Primary Keyword}",
            "content": "Intro to benefits...",
            "list": [
                {"title": "Benefit Name (X% improvement)", "description": "Explanation with specifics..."}
            ]
        },
        {
            "heading": "How to Implement {Primary Keyword}: Step-by-Step",
            "content": "Overview...",
            "subsections": [
                {"heading": "Step 1: Action", "content": "Details..."}
            ]
        },
        {
            "heading": "Common {Topic} Mistakes to Avoid",
            "list": [
                {"title": "Mistake Name", "description": "Why it hurts and what to do instead..."}
            ]
        }
    ],
    "faqs": [
        {"question": "Natural question about topic?", "answer": "Direct 2-3 sentence answer."}
    ],
    "keyTakeaways": [
        {"title": "Key Point", "description": "Brief actionable explanation"}
    ]
}`;
}

// ============================================================================
// CLAUDE API CLIENT
// ============================================================================

async function generateWithClaude(prompt, modelName) {
    // Dynamic import for ES module
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic.default();

    const response = await client.messages.create({
        model: modelName,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].text;
}

async function generateWithRetry(prompt, modelName, retries = CONFIG.maxRetries) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await generateWithClaude(prompt, modelName);

            // Try to parse as JSON to validate
            const parsed = JSON.parse(response);
            return JSON.stringify(parsed, null, 4);

        } catch (error) {
            if (attempt === retries) {
                throw error;
            }
            console.log(`    Retry ${attempt}/${retries}: ${error.message}`);
            await sleep(CONFIG.delayBetweenRequests * attempt);
        }
    }
}

// ============================================================================
// UTILITIES
// ============================================================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function contentExists(slug) {
    const jsonPath = path.join(CONFIG.contentDir, `${slug}.json`);
    const mdPath = path.join(CONFIG.contentDir, `${slug}.md`);
    const htmlPath = path.join(CONFIG.contentDir, `${slug}.html`);
    return fs.existsSync(jsonPath) || fs.existsSync(mdPath) || fs.existsSync(htmlPath);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const singleSlug = args.includes('--single') ? args[args.indexOf('--single') + 1] : null;
    const modelArg = args.includes('--model') ? args[args.indexOf('--model') + 1] : 'haiku';
    const skipExisting = !args.includes('--overwrite');

    const modelName = CONFIG.models[modelArg] || CONFIG.models.haiku;

    console.log('Blog Content Generator (Claude API)\n');
    console.log('='.repeat(50));

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('\nError: ANTHROPIC_API_KEY not set\n');
        console.log('Set your API key:');
        console.log('  Linux/Mac: export ANTHROPIC_API_KEY="sk-ant-..."');
        console.log('  Windows:   set ANTHROPIC_API_KEY=sk-ant-...');
        console.log('\nGet your key at: https://console.anthropic.com/settings/keys');
        process.exit(1);
    }

    // Check for SDK
    try {
        require('@anthropic-ai/sdk');
    } catch {
        console.error('\nError: @anthropic-ai/sdk not installed\n');
        console.log('Install it with:');
        console.log('  npm install @anthropic-ai/sdk');
        process.exit(1);
    }

    // Ensure content directory exists
    if (!fs.existsSync(CONFIG.contentDir)) {
        fs.mkdirSync(CONFIG.contentDir, { recursive: true });
    }

    // Read CSV
    if (!fs.existsSync(CONFIG.csvFile)) {
        console.error('Error: keywords.csv not found');
        process.exit(1);
    }

    const csvContent = fs.readFileSync(CONFIG.csvFile, 'utf-8');
    let rows = parseCSV(csvContent);

    if (singleSlug) {
        rows = rows.filter(r => r.slug === singleSlug);
        if (rows.length === 0) {
            console.error(`Error: Slug "${singleSlug}" not found in CSV`);
            process.exit(1);
        }
    }

    console.log(`Model: ${modelArg} (${modelName})`);
    console.log(`Keywords: ${rows.length}`);
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'GENERATE'}\n`);

    let generated = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const progress = `[${i + 1}/${rows.length}]`;

        // Skip if content exists
        if (skipExisting && contentExists(row.slug)) {
            console.log(`${progress} SKIP: ${row.slug} (content exists)`);
            skipped++;
            continue;
        }

        console.log(`${progress} Generating: ${row.slug}`);

        if (dryRun) {
            console.log(`    Would generate content/${row.slug}.json`);
            generated++;
            continue;
        }

        try {
            const prompt = buildPrompt(row);
            const content = await generateWithRetry(prompt, modelName);

            const outputPath = path.join(CONFIG.contentDir, `${row.slug}.json`);
            fs.writeFileSync(outputPath, content);

            console.log(`    ✓ Saved: content/${row.slug}.json`);
            generated++;

        } catch (error) {
            console.log(`    ✗ Error: ${error.message}`);
            errors++;
        }

        // Rate limiting
        if (i < rows.length - 1) {
            await sleep(CONFIG.delayBetweenRequests);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Generated: ${generated} | Skipped: ${skipped} | Errors: ${errors}`);

    if (generated > 0 && !dryRun) {
        console.log('\nNext step: node generate-blogs.js');
    }

    // Cost estimate
    const estimatedCost = {
        haiku: 0.01,
        sonnet: 0.05,
        opus: 0.25
    };
    console.log(`\nEstimated cost: ~$${(generated * estimatedCost[modelArg]).toFixed(2)}`);
}

main().catch(console.error);
