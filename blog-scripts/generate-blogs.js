#!/usr/bin/env node
/**
 * Blog Generator for Anexee
 * Generates SEO-optimized blog HTML files from CSV + content files
 *
 * Usage:
 *   node generate-blogs.js                    # Generate all blogs from keywords.csv
 *   node generate-blogs.js --dry-run          # Preview without writing files
 *   node generate-blogs.js --single my-blog   # Generate single blog by slug
 *
 * Workflow:
 *   1. Add keywords to keywords.csv
 *   2. Create content files in content/ folder (slug.md or slug.json)
 *   3. Run this script to generate HTML files in ../blog/
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    csvFile: path.join(__dirname, 'keywords.csv'),
    contentDir: path.join(__dirname, 'content'),
    outputDir: path.join(__dirname, '..', 'blog'),
    siteUrl: 'https://www.anexee.com',
    defaultAuthor: 'Anexee Engineering Team'
};

// ============================================================================
// HTML TEMPLATE (Matches existing blog structure)
// ============================================================================

function generateBlogHTML(data) {
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const readTime = Math.ceil(data.wordCount / 200);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(data.title)}</title>
    <meta name="description" content="${escapeHtml(data.metaDescription)}">

    <!-- SEO Meta Tags -->
    <meta name="keywords" content="${escapeHtml(data.primaryKeyword)}, ${escapeHtml(data.secondaryKeywords)}">
    <meta name="author" content="${escapeHtml(data.author)}">
    <link rel="canonical" href="${CONFIG.siteUrl}/blog/${data.slug}">

    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(data.title)}">
    <meta property="og:description" content="${escapeHtml(data.metaDescription)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${CONFIG.siteUrl}/blog/${data.slug}">
    <meta property="og:site_name" content="Anexee">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(data.title)}">
    <meta name="twitter:description" content="${escapeHtml(data.metaDescription)}">

    <!-- Schema.org Article Markup -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${escapeHtml(data.title)}",
        "description": "${escapeHtml(data.metaDescription)}",
        "author": {
            "@type": "Organization",
            "name": "${escapeHtml(data.author)}"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Anexee",
            "url": "${CONFIG.siteUrl}"
        },
        "datePublished": "${today.toISOString().split('T')[0]}",
        "dateModified": "${today.toISOString().split('T')[0]}",
        "mainEntityOfPage": "${CONFIG.siteUrl}/blog/${data.slug}"
    }
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <style>
        :root {
            --c-bg: #030305;
            --c-text: #e0e0e0;
            --c-accent: #00f2ea;
            --c-accent-2: #ff0055;
            --font-display: 'Space Grotesk', sans-serif;
            --font-body: 'Inter', sans-serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background: var(--c-bg);
            color: var(--c-text);
            font-family: var(--font-body);
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            line-height: 1.7;
        }

        /* Navigation */
        nav {
            position: fixed; top: 0; left: 0; width: 100%;
            padding: 30px 50px;
            display: flex; justify-content: space-between; align-items: center;
            z-index: 100;
            background: rgba(3, 3, 5, 0.95);
            backdrop-filter: blur(10px);
        }
        .logo { font-family: var(--font-display); font-weight: 700; font-size: 24px; letter-spacing: -1px; color: white; }
        .logo-subtitle { display: block; font-size: 10px; letter-spacing: 2px; opacity: 0.6; text-transform: uppercase; margin-top: 2px; }
        .nav-links { display: flex; gap: 30px; align-items: center; }
        .nav-item {
            font-size: 14px; text-transform: uppercase; letter-spacing: 1px;
            opacity: 0.7; transition: opacity 0.3s;
            position: relative; color: white; text-decoration: none;
        }
        .nav-item:hover { opacity: 1; }
        .btn-cta {
            padding: 10px 24px;
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 50px;
            font-size: 12px; text-transform: uppercase;
            transition: all 0.3s ease; color: white; text-decoration: none;
            display: inline-block;
        }
        .btn-cta:hover { background: white; color: black; }
        .btn-cta-primary {
            background: var(--c-accent);
            border-color: var(--c-accent);
            color: #030305;
            font-weight: 600;
        }
        .btn-cta-primary:hover {
            background: #00d4cd;
            border-color: #00d4cd;
            color: #030305;
        }

        /* Blog Article Layout */
        .blog-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 140px 20px 80px;
        }

        /* Blog Header */
        .blog-header {
            margin-bottom: 50px;
        }
        .blog-category {
            display: inline-block;
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: var(--c-accent);
            margin-bottom: 20px;
        }
        .blog-title {
            font-family: var(--font-display);
            font-size: clamp(32px, 5vw, 48px);
            font-weight: 500;
            line-height: 1.2;
            margin-bottom: 25px;
            background: linear-gradient(to right, #fff, #ccc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .blog-meta {
            display: flex;
            gap: 25px;
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            flex-wrap: wrap;
        }
        .blog-meta span { display: flex; align-items: center; gap: 8px; }

        /* Article Content */
        .blog-content h2 {
            font-family: var(--font-display);
            font-size: 28px;
            font-weight: 500;
            margin: 50px 0 25px;
            color: #fff;
            scroll-margin-top: 120px;
        }
        .blog-content h3 {
            font-family: var(--font-display);
            font-size: 22px;
            font-weight: 500;
            margin: 35px 0 18px;
            color: #fff;
            scroll-margin-top: 120px;
        }
        .blog-content h4 {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 500;
            margin: 25px 0 15px;
            color: rgba(255,255,255,0.9);
        }
        .blog-content p {
            font-size: 17px;
            line-height: 1.8;
            margin-bottom: 20px;
            color: rgba(255,255,255,0.8);
        }
        .blog-content strong {
            color: #fff;
            font-weight: 600;
        }
        .blog-content ul, .blog-content ol {
            margin: 20px 0 25px 25px;
            color: rgba(255,255,255,0.8);
        }
        .blog-content li {
            margin-bottom: 12px;
            font-size: 17px;
            line-height: 1.7;
        }
        .blog-content a {
            color: var(--c-accent);
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: border-color 0.3s;
        }
        .blog-content a:hover {
            border-bottom-color: var(--c-accent);
        }

        /* Highlight Box */
        .highlight-box {
            background: rgba(0, 242, 234, 0.08);
            border-left: 4px solid var(--c-accent);
            padding: 25px 30px;
            margin: 30px 0;
            border-radius: 0 12px 12px 0;
        }
        .highlight-box p {
            margin-bottom: 0;
            font-size: 16px;
        }

        /* Comparison Table */
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            font-size: 15px;
        }
        .comparison-table th, .comparison-table td {
            padding: 15px 20px;
            text-align: left;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .comparison-table th {
            background: rgba(255,255,255,0.05);
            color: var(--c-accent);
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .comparison-table td {
            color: rgba(255,255,255,0.8);
        }
        .comparison-table tr:hover td {
            background: rgba(255,255,255,0.02);
        }

        /* FAQ Section */
        .faq-item {
            margin-bottom: 30px;
            padding-bottom: 30px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .faq-item:last-child {
            border-bottom: none;
        }
        .faq-item h3 {
            margin-top: 0;
            color: #fff;
        }

        /* Checklist */
        .checklist {
            background: rgba(255,255,255,0.03);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
        }
        .checklist ul {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        .checklist li {
            position: relative;
            padding-left: 35px;
            margin-bottom: 15px;
        }
        .checklist li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 5px;
            width: 20px;
            height: 20px;
            border: 2px solid var(--c-accent);
            border-radius: 4px;
        }

        /* Key Takeaways */
        .key-takeaways {
            background: linear-gradient(135deg, rgba(0, 242, 234, 0.1), rgba(255, 0, 85, 0.05));
            border: 1px solid rgba(0, 242, 234, 0.2);
            border-radius: 16px;
            padding: 35px;
            margin: 50px 0;
        }
        .key-takeaways h2 {
            margin-top: 0;
            font-size: 24px;
            color: var(--c-accent);
        }
        .key-takeaways ul {
            margin-bottom: 0;
        }

        /* CTA Section */
        .cta-section {
            text-align: center;
            padding: 60px 40px;
            background: rgba(255,255,255,0.03);
            border-radius: 20px;
            margin: 60px 0 40px;
            border: 1px solid rgba(255,255,255,0.08);
        }
        .cta-section h2 {
            margin-top: 0;
            font-size: 32px;
        }
        .cta-section p {
            max-width: 500px;
            margin: 0 auto 30px;
        }

        /* Footer */
        .site-footer {
            background: rgba(0,0,0,0.5);
            padding: 80px 50px 40px;
            margin-top: 80px;
        }
        .footer-grid {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1.5fr;
            gap: 50px;
        }
        .footer-logo {
            font-family: var(--font-display);
            font-size: 28px;
            font-weight: 700;
            display: block;
            margin-bottom: 20px;
        }
        .footer-brand p {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            max-width: 280px;
        }
        .footer-social {
            display: flex;
            gap: 15px;
            margin-top: 25px;
        }
        .footer-social a {
            width: 40px; height: 40px;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: white;
            transition: all 0.3s;
        }
        .footer-social a:hover {
            background: var(--c-accent);
            border-color: var(--c-accent);
            color: #030305;
        }
        .footer-links h4 {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 25px;
            color: white;
        }
        .footer-links a {
            display: block;
            color: rgba(255,255,255,0.6);
            text-decoration: none;
            margin-bottom: 12px;
            font-size: 14px;
            transition: color 0.3s;
        }
        .footer-links a:hover { color: var(--c-accent); }
        .footer-contact h4 {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 25px;
            color: white;
        }
        .footer-contact p {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            margin-bottom: 10px;
        }
        .footer-contact a {
            color: rgba(255,255,255,0.6);
            text-decoration: none;
            transition: color 0.3s;
        }
        .footer-contact a:hover { color: var(--c-accent); }
        .footer-bottom {
            max-width: 1200px;
            margin: 60px auto 0;
            padding-top: 30px;
            border-top: 1px solid rgba(255,255,255,0.1);
            text-align: center;
            font-size: 13px;
            color: rgba(255,255,255,0.4);
        }

        /* Responsive */
        @media (max-width: 768px) {
            nav { padding: 20px; }
            .nav-links { display: none; }
            .blog-container { padding: 120px 20px 60px; }
            .blog-title { font-size: 28px; }
            .blog-content h2 { font-size: 24px; }
            .blog-content h3 { font-size: 20px; }
            .footer-grid { grid-template-columns: 1fr; gap: 40px; }
            .comparison-table { font-size: 13px; }
            .comparison-table th, .comparison-table td { padding: 10px 12px; }
        }
    </style>
    <link rel="stylesheet" href="../css/global.css">
</head>
<body>

    <nav>
        <a href="../index.html" class="logo" style="text-decoration: none;">
            <span>ANEXEE</span>
            <span class="logo-subtitle">Analytical Excellence</span>
        </a>
        <div class="nav-links">
            <a href="../platform/overview.html" class="nav-item">Platform</a>
            <a href="../applications/energy-monitoring.html" class="nav-item">Applications</a>
            <a href="../pricing/anexee-suite.html" class="nav-item">Pricing</a>
            <a href="../support.html" class="nav-item">Support</a>
            <a href="../blog.html" class="nav-item">Blog</a>
        </div>
        <a href="../index.html#get-started" class="btn-cta">Get Started</a>
    </nav>

    <article class="blog-container">

        <header class="blog-header">
            <span class="blog-category">${escapeHtml(data.category)}</span>
            <h1 class="blog-title">${escapeHtml(data.title)}</h1>
            <div class="blog-meta">
                <span><i class="fa-regular fa-calendar"></i> ${dateFormatted}</span>
                <span><i class="fa-regular fa-clock"></i> ${readTime} min read</span>
                <span><i class="fa-regular fa-user"></i> ${escapeHtml(data.author)}</span>
            </div>
        </header>

        <div class="blog-content">
${data.htmlContent}

            <div class="cta-section">
                <h2>Ready to Transform Your Manufacturing Operations?</h2>
                <p>See how Anexee's unified industrial platform connects your devices, systems, and people in a single environment built for the demands of modern manufacturing.</p>
                <a href="../index.html#get-started" class="btn-cta btn-cta-primary">Schedule a Demo</a>
            </div>

        </div>

    </article>

    <footer class="site-footer">
        <div class="footer-grid">
            <div class="footer-brand">
                <span class="footer-logo">ANEXEE</span>
                <p>The unified industrial platform that connects devices, intelligence, and people across every site.</p>
                <div class="footer-social">
                    <a href="https://www.linkedin.com/company/anexee" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
                    <a href="https://x.com/anexee" target="_blank" rel="noopener" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="https://instagram.com/anexee" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                </div>
            </div>
            <div class="footer-links">
                <h4>Explore</h4>
                <a href="../platform/overview.html">Platform</a>
                <a href="../applications/energy-monitoring.html">Applications</a>
                <a href="../pricing/anexee-suite.html">Pricing</a>
            </div>
            <div class="footer-links">
                <h4>Company</h4>
                <a href="../blog.html">Blog</a>
                <a href="../careers.html">Careers</a>
                <a href="../support.html">Support</a>
            </div>
            <div class="footer-contact">
                <h4>Contact Us</h4>
                <p>Phone: <a href="tel:+919529618916">+91 95296 18916</a></p>
                <p>Email: <a href="mailto:connect@anexee.com">connect@anexee.com</a></p>
                <p><strong>Visit Us</strong><br>H1-27, IT Park, MIA Extn.<br>Udaipur - 313003 INDIA</p>
            </div>
        </div>
        <div class="footer-bottom">
            <span>&copy; ${today.getFullYear()} Anexee Platform. All Rights Reserved.</span>
        </div>
    </footer>

</body>
</html>`;
}

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
// CONTENT LOADER
// ============================================================================

function loadContent(slug) {
    // Try JSON first (structured content)
    const jsonPath = path.join(CONFIG.contentDir, `${slug}.json`);
    if (fs.existsSync(jsonPath)) {
        const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        return {
            html: json.htmlContent || convertSectionsToHTML(json),
            wordCount: countWords(json.htmlContent || '')
        };
    }

    // Try HTML file
    const htmlPath = path.join(CONFIG.contentDir, `${slug}.html`);
    if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf-8');
        return { html, wordCount: countWords(html) };
    }

    // Try Markdown file
    const mdPath = path.join(CONFIG.contentDir, `${slug}.md`);
    if (fs.existsSync(mdPath)) {
        const md = fs.readFileSync(mdPath, 'utf-8');
        return { html: convertMarkdownToHTML(md), wordCount: countWords(md) };
    }

    return null;
}

function convertSectionsToHTML(json) {
    let html = '';

    // Introduction
    if (json.introduction) {
        html += `            <p>${json.introduction}</p>\n\n`;
    }

    // Sections
    if (json.sections) {
        for (const section of json.sections) {
            html += `            <h2 id="${slugify(section.heading)}">${section.heading}</h2>\n\n`;

            if (section.content) {
                html += `            <p>${section.content}</p>\n\n`;
            }

            if (section.subsections) {
                for (const sub of section.subsections) {
                    html += `            <h3>${sub.heading}</h3>\n`;
                    html += `            <p>${sub.content}</p>\n\n`;
                }
            }

            if (section.list) {
                html += `            <ul>\n`;
                for (const item of section.list) {
                    html += `                <li><strong>${item.title}</strong>: ${item.description}</li>\n`;
                }
                html += `            </ul>\n\n`;
            }
        }
    }

    // FAQs
    if (json.faqs) {
        html += `            <h2 id="faqs">Frequently Asked Questions</h2>\n\n`;
        for (const faq of json.faqs) {
            html += `            <div class="faq-item">\n`;
            html += `                <h3>${faq.question}</h3>\n`;
            html += `                <p>${faq.answer}</p>\n`;
            html += `            </div>\n\n`;
        }
    }

    // Key Takeaways
    if (json.keyTakeaways) {
        html += `            <div class="key-takeaways">\n`;
        html += `                <h2>Key Takeaways</h2>\n`;
        html += `                <ul>\n`;
        for (const takeaway of json.keyTakeaways) {
            html += `                    <li><strong>${takeaway.title}</strong>: ${takeaway.description}</li>\n`;
        }
        html += `                </ul>\n`;
        html += `            </div>\n\n`;
    }

    return html;
}

function convertMarkdownToHTML(md) {
    // Basic Markdown to HTML conversion
    let html = md
        // Headers
        .replace(/^### (.+)$/gm, '            <h3>$1</h3>')
        .replace(/^## (.+)$/gm, '            <h2>$1</h2>')
        .replace(/^# (.+)$/gm, '            <h2>$1</h2>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Lists
        .replace(/^- (.+)$/gm, '                <li>$1</li>')
        // Paragraphs
        .replace(/^(?!<|            )(.+)$/gm, '            <p>$1</p>');

    // Wrap consecutive li elements in ul
    html = html.replace(/((?:                <li>.*<\/li>\n)+)/g, '            <ul>\n$1            </ul>\n');

    return html;
}

// ============================================================================
// UTILITIES
// ============================================================================

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function slugify(str) {
    return str.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function countWords(text) {
    return text.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const singleSlug = args.includes('--single') ? args[args.indexOf('--single') + 1] : null;

    console.log('Blog Generator for Anexee\n');
    console.log('='.repeat(50));

    // Ensure directories exist
    if (!fs.existsSync(CONFIG.contentDir)) {
        fs.mkdirSync(CONFIG.contentDir, { recursive: true });
        console.log(`Created content directory: ${CONFIG.contentDir}`);
    }

    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Check for CSV file
    if (!fs.existsSync(CONFIG.csvFile)) {
        // Copy template to keywords.csv
        const templatePath = path.join(__dirname, 'keywords-template.csv');
        if (fs.existsSync(templatePath)) {
            fs.copyFileSync(templatePath, CONFIG.csvFile);
            console.log('Created keywords.csv from template');
        } else {
            console.error('Error: keywords.csv not found');
            process.exit(1);
        }
    }

    // Parse CSV
    const csvContent = fs.readFileSync(CONFIG.csvFile, 'utf-8');
    let rows = parseCSV(csvContent);

    if (singleSlug) {
        rows = rows.filter(r => r.slug === singleSlug);
        if (rows.length === 0) {
            console.error(`Error: Blog with slug "${singleSlug}" not found in CSV`);
            process.exit(1);
        }
    }

    console.log(`Found ${rows.length} blog(s) to process\n`);

    let generated = 0;
    let skipped = 0;
    const generatedUrls = [];

    for (const row of rows) {
        const content = loadContent(row.slug);

        if (!content) {
            console.log(`[SKIP] ${row.slug} - No content file found`);
            console.log(`       Create: content/${row.slug}.json or content/${row.slug}.md\n`);
            skipped++;
            continue;
        }

        const blogData = {
            slug: row.slug,
            title: row.title,
            metaDescription: row.meta_description,
            primaryKeyword: row.primary_keyword,
            secondaryKeywords: row.secondary_keywords,
            category: row.category || 'Industrial IoT',
            author: row.author || CONFIG.defaultAuthor,
            wordCount: content.wordCount || parseInt(row.target_word_count) || 1500,
            htmlContent: content.html
        };

        const outputPath = path.join(CONFIG.outputDir, `${row.slug}.html`);

        if (dryRun) {
            console.log(`[DRY-RUN] Would generate: ${outputPath}`);
        } else {
            const html = generateBlogHTML(blogData);
            fs.writeFileSync(outputPath, html);
            console.log(`[OK] Generated: blog/${row.slug}.html`);
            generatedUrls.push(`${CONFIG.siteUrl}/blog/${row.slug}`);
        }

        generated++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Generated: ${generated} | Skipped: ${skipped}`);

    if (generatedUrls.length > 0 && !dryRun) {
        // Write URLs to file for IndexNow
        const urlsFile = path.join(__dirname, 'generated-urls.txt');
        fs.writeFileSync(urlsFile, generatedUrls.join('\n'));
        console.log(`\nURLs written to: ${urlsFile}`);
        console.log('Run "node submit-indexnow.js" to submit for indexing');
    }
}

main();
