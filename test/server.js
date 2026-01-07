#!/usr/bin/env node
/**
 * Tiny test server for mrmd-sync browser testing
 *
 * Provides:
 * - Static file serving (HTML, JS)
 * - File browser API (list directories)
 *
 * Usage:
 *   node test/server.js [directory] [port]
 *   node test/server.js ~ 3000
 */

import http from 'http';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Config
const args = process.argv.slice(2);
const browseDir = resolve(args[0] || process.env.HOME || '.');
const port = parseInt(args[1]) || 3000;
const syncPort = parseInt(args[2]) || 4444;

// MIME types
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

/**
 * List directory contents
 */
function listDirectory(baseDir, subPath = '') {
  const targetPath = join(baseDir, subPath);

  // Security: no escaping base dir
  const resolved = resolve(baseDir, subPath);
  if (!resolved.startsWith(resolve(baseDir))) {
    return { error: 'Invalid path' };
  }

  try {
    if (!existsSync(targetPath)) {
      return { error: 'Path not found' };
    }

    const stat = statSync(targetPath);
    if (!stat.isDirectory()) {
      return { error: 'Not a directory' };
    }

    const entries = readdirSync(targetPath, { withFileTypes: true });
    const items = [];

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const itemPath = subPath ? `${subPath}/${entry.name}` : entry.name;
      const fullPath = join(targetPath, entry.name);

      try {
        const itemStat = statSync(fullPath);
        const ext = extname(entry.name).toLowerCase();

        if (entry.isDirectory()) {
          items.push({ name: entry.name, path: itemPath, type: 'directory' });
        } else if (entry.isFile()) {
          items.push({
            name: entry.name,
            path: itemPath.replace(/\.md$/, ''),
            type: 'file',
            ext,
            size: itemStat.size,
            isMarkdown: ext === '.md',
          });
        }
      } catch (e) { /* skip */ }
    }

    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return { path: subPath || '/', items };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Serve static file
 */
function serveFile(res, filePath) {
  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(content);
  } catch (err) {
    res.writeHead(404);
    res.end('Not found');
  }
}

// Create server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: List directory
  if (url.pathname === '/api/list' || url.pathname.startsWith('/api/list/')) {
    const subPath = decodeURIComponent(url.pathname.replace('/api/list', '').replace(/^\//, ''));
    const result = listDirectory(browseDir, subPath);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // API: Config (tells browser where sync server is)
  if (url.pathname === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ syncUrl: `localhost:${syncPort}`, browseDir }));
    return;
  }

  // Static files
  if (url.pathname === '/' || url.pathname === '/index.html') {
    serveFile(res, join(__dirname, 'browser.html'));
    return;
  }

  // Serve mrmd-editor from parent package
  if (url.pathname.startsWith('/mrmd-editor/')) {
    const filePath = join(__dirname, '../../mrmd-editor', url.pathname.replace('/mrmd-editor/', ''));
    serveFile(res, filePath);
    return;
  }

  // Other static files in test dir
  serveFile(res, join(__dirname, url.pathname));
});

server.listen(port, () => {
  console.log(`
┌─────────────────────────────────────────────┐
│  mrmd-sync Test Server                      │
├─────────────────────────────────────────────┤
│  Browse: http://localhost:${port}             │
│  Sync:   ws://localhost:${syncPort}             │
│  Dir:    ${browseDir.slice(0, 35).padEnd(35)}│
└─────────────────────────────────────────────┘

1. Start mrmd-sync in another terminal:
   node bin/cli.js --i-know-what-i-am-doing ${browseDir}

2. Open http://localhost:${port} in 2+ browsers

3. Click a .md file and start typing!
`);
});
