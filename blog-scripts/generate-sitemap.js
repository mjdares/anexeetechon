#!/usr/bin/env node
/**
 * Sitemap & Robots.txt Generator for Anexee
 * Auto-generates sitemap.xml with all HTML pages
 *
 * Usage:
 *   node generate-sitemap.js              # Generate sitemap.xml and robots.txt
 *   node generate-sitemap.js --blogs-only # Only include blog pages
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    siteUrl: 'https://www.anexee.com',
    rootDir: path.join(__dirname, '..'),
    outputSitemap: path.join(__dirname, '..', 'sitemap.xml'),
    outputRobots: path.join(__dirname, '..', 'robots.txt')
};

// Priority rules based on URL patterns
const PRIORITY_RULES = [
    { pattern: /^index\.html$/, priority: '1.0', changefreq: 'weekly' },
    { pattern: /^blog\.html$/, priority: '0.9', changefreq: 'daily' },
    { pattern: /^blog\//, priority: '0.8', changefreq: 'monthly' },
    { pattern: /^platform\//, priority: '0.7', changefreq: 'monthly' },
    { pattern: /^applications\//, priority: '0.7', changefreq: 'monthly' },
    { pattern: /^pricing\//, priority: '0.7', changefreq: 'weekly' },
    { pattern: /^know-us\//, priority: '0.5', changefreq: 'monthly' },
    { pattern: /\.html$/, priority: '0.6', changefreq: 'monthly' }
];

function findHtmlFiles(dir, baseDir = dir, files = []) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        // Skip hidden dirs, node_modules, scripts
        if (stat.isDirectory()) {
            if (!item.startsWith('.') && item !== 'node_modules' && item !== 'blog-scripts') {
                findHtmlFiles(fullPath, baseDir, files);
            }
        } else if (item.endsWith('.html')) {
            const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            files.push(relativePath);
        }
    }

    return files;
}

function getPriorityAndFreq(filePath) {
    for (const rule of PRIORITY_RULES) {
        if (rule.pattern.test(filePath)) {
            return { priority: rule.priority, changefreq: rule.changefreq };
        }
    }
    return { priority: '0.5', changefreq: 'monthly' };
}

function getLastModified(filePath) {
    try {
        const fullPath = path.join(CONFIG.rootDir, filePath);
        const stat = fs.statSync(fullPath);
        return stat.mtime.toISOString().split('T')[0];
    } catch {
        return new Date().toISOString().split('T')[0];
    }
}

function generateSitemap(blogsOnly = false) {
    let files = findHtmlFiles(CONFIG.rootDir);

    if (blogsOnly) {
        files = files.filter(f => f.startsWith('blog/') || f === 'blog.html');
    }

    // Sort: index first, then by path
    files.sort((a, b) => {
        if (a === 'index.html') return -1;
        if (b === 'index.html') return 1;
        return a.localeCompare(b);
    });

    const today = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const file of files) {
        let url = file;

        // Clean up URL
        if (url === 'index.html') {
            url = '';
        } else {
            // Remove .html extension for clean URLs
            url = url.replace(/\.html$/, '');
        }

        const { priority, changefreq } = getPriorityAndFreq(file);
        const lastmod = getLastModified(file);

        xml += `  <url>\n`;
        xml += `    <loc>${CONFIG.siteUrl}/${url}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>${changefreq}</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += `  </url>\n`;
    }

    xml += '</urlset>\n';

    fs.writeFileSync(CONFIG.outputSitemap, xml);
    console.log(`Generated sitemap.xml with ${files.length} URLs`);

    return files.length;
}

function generateRobots() {
    const robots = `# Robots.txt for anexee.com
# Generated: ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /

# Sitemap location
Sitemap: ${CONFIG.siteUrl}/sitemap.xml

# Disallow scripts and non-public directories
Disallow: /blog-scripts/
Disallow: /*.json$

# Crawl-delay (be respectful)
Crawl-delay: 1

# Specific bot rules
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /
`;

    fs.writeFileSync(CONFIG.outputRobots, robots);
    console.log('Generated robots.txt');
}

function main() {
    const args = process.argv.slice(2);
    const blogsOnly = args.includes('--blogs-only');

    console.log('Sitemap Generator for Anexee\n');
    console.log('='.repeat(50));

    const urlCount = generateSitemap(blogsOnly);
    generateRobots();

    console.log('\n' + '='.repeat(50));
    console.log('\nNext steps:');
    console.log('1. Commit and push sitemap.xml and robots.txt');
    console.log('2. Submit sitemap to Google Search Console:');
    console.log('   https://search.google.com/search-console');
    console.log('3. Submit sitemap to Bing Webmaster Tools:');
    console.log('   https://www.bing.com/webmasters');
    console.log('4. Run "node submit-indexnow.js" for instant Bing indexing');
}

main();
