/**
 * BoardsBuddy - Zero-Dependency Local Development Server
 * Runs with pure Node.js (no npm install required).
 * 
 * Usage:
 *   node serve.js
 *   or
 *   npm start
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize root path
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  // If pointing to a folder, append index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>404 Not Found - BoardsBuddy</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 4rem;">
            <h1>404 - Page Not Found</h1>
            <p>The requested file <code>${pathname}</code> does not exist.</p>
            <p><a href="/index.html">&larr; Return to BoardsBuddy Home</a></p>
          </body>
          </html>
        `);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 BoardsBuddy Learning Platform is running locally!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📚 Student Home:  http://localhost:${PORT}/index.html`);
  console.log(`🛡️  Admin Portal:  http://localhost:${PORT}/admin/login.html`);
  console.log(`======================================================\n`);
});
