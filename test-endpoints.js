const http = require('http');

const endpoints = [
  '/',
  '/index.html',
  '/pages/select.html',
  '/pages/textbooks.html',
  '/pages/notes.html',
  '/pages/short-notes.html',
  '/pages/pyqs.html',
  '/pages/chapterwise-pyqs.html',
  '/pages/pyq-solutions.html',
  '/pages/viewer.html',
  '/pages/auth.html',
  '/pages/profile.html',
  '/admin/login.html',
  '/admin/index.html',
  '/css/variables.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/admin.css',
  '/js/config.js',
  '/js/supabase-client.js',
  '/js/data/mock-seed.js',
  '/js/services/auth.js',
  '/js/services/db.js',
  '/js/services/storage.js',
  '/js/utils/ui.js',
  '/js/pages/textbooks.js',
  '/js/pages/notes.js',
  '/js/pages/short-notes.js',
  '/js/pages/pyqs.js',
  '/js/pages/chapterwise-pyqs.js',
  '/js/pages/pyq-solutions.js',
  '/js/pages/viewer.js',
  '/js/pages/admin.js'
];

async function checkUrl(endpoint) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${endpoint}`, (res) => {
      resolve({ endpoint, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ endpoint, status: err.message });
    });
  });
}

async function runTests() {
  console.log(`Verifying all ${endpoints.length} routes & static assets on http://localhost:3000...\n`);
  let passed = 0;
  let failed = 0;

  for (const ep of endpoints) {
    const result = await checkUrl(ep);
    if (result.status === 200) {
      console.log(`✅ [200 OK] ${ep}`);
      passed++;
    } else {
      console.error(`❌ [FAILED] ${ep} - Status: ${result.status}`);
      failed++;
    }
  }

  console.log(`\n==========================================`);
  console.log(`Summary: ${passed} PASSED, ${failed} FAILED.`);
  console.log(`==========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
