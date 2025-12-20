#!/usr/bin/env node
/**
 * IndexNow Submission Script for Anexee
 *
 * IndexNow is a FREE protocol for instant URL indexing on:
 * - Bing
 * - Yandex
 * - Seznam.cz
 * - Naver
 *
 * Usage:
 *   node submit-indexnow.js                      # Submit all URLs from generated-urls.txt
 *   node submit-indexnow.js --all                # Submit all blog URLs
 *   node submit-indexnow.js --url /blog/my-post  # Submit single URL
 *   node submit-indexnow.js --setup              # Generate API key file
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    siteUrl: 'https://www.anexee.com',
    host: 'www.anexee.com',
    // IndexNow API key - you need to generate one and host it
    keyLocation: path.join(__dirname, '..', 'indexnow-key.txt'),
    generatedUrlsFile: path.join(__dirname, 'generated-urls.txt'),
    blogDir: path.join(__dirname, '..', 'blog')
};

// IndexNow endpoints (they share data)
const INDEXNOW_ENDPOINTS = [
    'api.indexnow.org',
    'www.bing.com'
];

function generateApiKey() {
    // Generate a random 32-character hex key
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
        key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
}

function setupIndexNow() {
    console.log('IndexNow Setup\n');
    console.log('='.repeat(50));

    const apiKey = generateApiKey();

    // Save key to file
    fs.writeFileSync(CONFIG.keyLocation, apiKey);
    console.log(`Generated API key: ${apiKey}`);
    console.log(`Saved to: ${CONFIG.keyLocation}\n`);

    // Create verification file
    const verificationFile = path.join(__dirname, '..', `${apiKey}.txt`);
    fs.writeFileSync(verificationFile, apiKey);
    console.log(`Created verification file: ${apiKey}.txt`);

    console.log('\n' + '='.repeat(50));
    console.log('\nIMPORTANT: Next steps:');
    console.log('1. Commit and push both files to your repository');
    console.log('2. Verify the key is accessible at:');
    console.log(`   ${CONFIG.siteUrl}/${apiKey}.txt`);
    console.log('3. Then run: node submit-indexnow.js --all');
}

function getApiKey() {
    if (!fs.existsSync(CONFIG.keyLocation)) {
        console.error('Error: IndexNow API key not found.');
        console.error('Run: node submit-indexnow.js --setup');
        process.exit(1);
    }
    return fs.readFileSync(CONFIG.keyLocation, 'utf-8').trim();
}

function getBlogUrls() {
    const urls = [];
    const files = fs.readdirSync(CONFIG.blogDir);

    for (const file of files) {
        if (file.endsWith('.html') && !file.startsWith('.')) {
            const slug = file.replace('.html', '');
            urls.push(`${CONFIG.siteUrl}/blog/${slug}`);
        }
    }

    return urls;
}

function getGeneratedUrls() {
    if (!fs.existsSync(CONFIG.generatedUrlsFile)) {
        return [];
    }
    const content = fs.readFileSync(CONFIG.generatedUrlsFile, 'utf-8');
    return content.split('\n').filter(url => url.trim());
}

async function submitToIndexNow(urls) {
    const apiKey = getApiKey();

    if (urls.length === 0) {
        console.log('No URLs to submit.');
        return;
    }

    console.log(`Submitting ${urls.length} URL(s) to IndexNow...\n`);

    // IndexNow accepts up to 10,000 URLs per request
    const batchSize = 10000;

    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);

        const payload = JSON.stringify({
            host: CONFIG.host,
            key: apiKey,
            keyLocation: `${CONFIG.siteUrl}/${apiKey}.txt`,
            urlList: batch
        });

        // Submit to first endpoint (they share data with each other)
        const endpoint = INDEXNOW_ENDPOINTS[0];

        const options = {
            hostname: endpoint,
            port: 443,
            path: '/indexnow',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        try {
            const response = await new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve({ status: res.statusCode, data }));
                });
                req.on('error', reject);
                req.write(payload);
                req.end();
            });

            if (response.status === 200 || response.status === 202) {
                console.log(`[OK] Batch ${Math.floor(i / batchSize) + 1}: Submitted ${batch.length} URLs`);
            } else if (response.status === 400) {
                console.log(`[ERROR] Bad request - check your API key and URL format`);
            } else if (response.status === 403) {
                console.log(`[ERROR] Key not valid - make sure ${apiKey}.txt is accessible`);
            } else if (response.status === 422) {
                console.log(`[ERROR] Invalid URLs in the batch`);
            } else if (response.status === 429) {
                console.log(`[WARN] Rate limited - wait and try again`);
            } else {
                console.log(`[WARN] Unexpected response: ${response.status}`);
            }

        } catch (error) {
            console.log(`[ERROR] Request failed: ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Submission complete!');
    console.log('\nURLs submitted to:');
    console.log('- Bing (via api.indexnow.org)');
    console.log('- Yandex, Seznam, Naver (shared via IndexNow protocol)');
    console.log('\nNote: Google does NOT support IndexNow.');
    console.log('For Google, submit sitemap.xml to Search Console.');
}

async function main() {
    const args = process.argv.slice(2);

    console.log('IndexNow Submission for Anexee\n');
    console.log('='.repeat(50));

    if (args.includes('--setup')) {
        setupIndexNow();
        return;
    }

    if (args.includes('--url')) {
        const urlIndex = args.indexOf('--url') + 1;
        let url = args[urlIndex];
        if (!url) {
            console.error('Error: --url requires a path');
            process.exit(1);
        }
        if (!url.startsWith('http')) {
            url = CONFIG.siteUrl + url;
        }
        await submitToIndexNow([url]);
        return;
    }

    if (args.includes('--all')) {
        const urls = getBlogUrls();
        console.log(`Found ${urls.length} blog pages\n`);
        await submitToIndexNow(urls);
        return;
    }

    // Default: submit generated URLs
    const urls = getGeneratedUrls();
    if (urls.length === 0) {
        console.log('No URLs in generated-urls.txt');
        console.log('\nOptions:');
        console.log('  --all           Submit all blog URLs');
        console.log('  --url /path     Submit single URL');
        console.log('  --setup         Generate IndexNow API key');
        return;
    }

    await submitToIndexNow(urls);
}

main();
