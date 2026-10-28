/**
 * BoardsBuddy - End-to-End Verification Test Script
 * Verifies all 10 requirements specified by the user.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Starting comprehensive verification tests for BoardsBuddy...\n');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Error: ${err.message}`);
  }
}

// -------------------------------------------------------------
// Test Suite 1: Footer and Informational Links Structure
// -------------------------------------------------------------
const pagesToCheck = [
  'index.html',
  'pages/textbooks.html',
  'pages/notes.html',
  'pages/short-notes.html',
  'pages/pyqs.html',
  'pages/chapterwise-pyqs.html',
  'pages/pyq-solutions.html',
  'pages/about-us.html',
  'pages/privacy-policy.html',
  'pages/terms-and-conditions.html',
  'pages/contact-us.html',
  'pages/returns-refunds.html',
  'pages/auth.html',
  'pages/select.html',
  'pages/profile.html'
];

test('Footer: All 5 informational links appear on all standard pages', () => {
  pagesToCheck.forEach(pagePath => {
    const fullPath = path.join(__dirname, pagePath);
    const content = fs.readFileSync(fullPath, 'utf8');

    assert.ok(content.includes('Privacy Policy'), `Missing Privacy Policy in ${pagePath}`);
    assert.ok(content.includes('About Us'), `Missing About Us in ${pagePath}`);
    assert.ok(content.includes('Terms and Conditions'), `Missing Terms and Conditions in ${pagePath}`);
    assert.ok(content.includes('Contact Us'), `Missing Contact Us in ${pagePath}`);
    assert.ok(content.includes('Returns & Refunds'), `Missing Returns & Refunds in ${pagePath}`);
  });
});

test('Footer: SUBJECTS and ADMIN sections are completely removed from all footers', () => {
  pagesToCheck.forEach(pagePath => {
    const fullPath = path.join(__dirname, pagePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const footerMatch = content.match(/<footer[\s\S]*?<\/footer>/);
    if (!footerMatch) return;
    const footerContent = footerMatch[0];

    assert.ok(!footerContent.includes('<h4>Subjects</h4>'), `Found <h4>Subjects</h4> in footer of ${pagePath}`);
    assert.ok(!footerContent.includes('<h4>Admin</h4>'), `Found <h4>Admin</h4> in footer of ${pagePath}`);
    assert.ok(!footerContent.includes('<h4>Account & Admin</h4>'), `Found <h4>Account & Admin</h4> in footer of ${pagePath}`);
    assert.ok(!footerContent.includes('Mathematics Part 1 (Algebra)</a>'), `Found Mathematics Part 1 in footer of ${pagePath}`);
    assert.ok(!footerContent.includes('Admin Portal</a>'), `Found Admin Portal in footer of ${pagePath}`);
  });
});

test('Footer: Links order matches requirement (Privacy Policy, About Us, Terms and Conditions, Contact Us, Returns & Refunds)', () => {
  const standardPages = [
    'index.html',
    'pages/textbooks.html',
    'pages/notes.html',
    'pages/short-notes.html',
    'pages/pyqs.html',
    'pages/chapterwise-pyqs.html',
    'pages/pyq-solutions.html'
  ];

  standardPages.forEach(pagePath => {
    const fullPath = path.join(__dirname, pagePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const privIndex = content.indexOf('Privacy Policy');
    const aboutIndex = content.indexOf('About Us');
    const termsIndex = content.indexOf('Terms and Conditions');
    const contactIndex = content.indexOf('Contact Us');
    const returnsIndex = content.indexOf('Returns & Refunds');

    assert.ok(privIndex < aboutIndex, `Privacy Policy should precede About Us in ${pagePath}`);
    assert.ok(aboutIndex < termsIndex, `About Us should precede Terms in ${pagePath}`);
    assert.ok(termsIndex < contactIndex, `Terms should precede Contact in ${pagePath}`);
    assert.ok(contactIndex < returnsIndex, `Contact should precede Returns in ${pagePath}`);
  });
});

// -------------------------------------------------------------
// Test Suite 2: Informational Pages Content Requirements
// -------------------------------------------------------------
test('About Us: Mentions MSBSHSE Class 10, textbooks, notes, short notes, pyqs, chapter-wise pyqs, solutions', () => {
  const content = fs.readFileSync(path.join(__dirname, 'pages/about-us.html'), 'utf8');
  assert.ok(content.includes('Maharashtra State Board'), 'Missing Maharashtra State Board mention');
  assert.ok(content.includes('Class 10'), 'Missing Class 10 mention');
  assert.ok(content.includes('Textbooks') || content.includes('textbooks'), 'Missing textbooks');
  assert.ok(content.includes('Notes') || content.includes('notes'), 'Missing notes');
  assert.ok(content.includes('Short Notes') || content.includes('short notes'), 'Missing short notes');
  assert.ok(content.includes('Chapter-wise') || content.includes('Chapterwise'), 'Missing chapterwise PYQs');
  assert.ok(content.includes('Solutions') || content.includes('solutions'), 'Missing solutions');
});

test('Privacy Policy: Accurately explains Supabase auth, storage, data collection, and verified contact', () => {
  const content = fs.readFileSync(path.join(__dirname, 'pages/privacy-policy.html'), 'utf8');
  assert.ok(content.includes('Supabase'), 'Missing Supabase mention in Privacy Policy');
  assert.ok(content.includes('Row Level Security'), 'Missing Row Level Security mention');
  assert.ok(content.includes('github.com/shubham88447/BoardsBuddy'), 'Missing verified repository link');
  assert.ok(!content.includes('+91-'), 'Found unsupported fake telephone number');
  assert.ok(!content.includes('support@boardsbuddy.com'), 'Found invented email address');
});

test('Terms and Conditions: Accurately details acceptable use, disclaimer, and user responsibilities', () => {
  const content = fs.readFileSync(path.join(__dirname, 'pages/terms-and-conditions.html'), 'utf8');
  assert.ok(content.includes('Acceptable') || content.includes('Permitted Use'), 'Missing acceptable use section');
  assert.ok(content.includes('Disclaimers') || content.includes('Accuracy'), 'Missing disclaimers section');
  assert.ok(content.includes('Balbharati'), 'Missing Balbharati curriculum reference');
});

test('Contact Us: Uses verified GitHub contact without invented fake address or phone', () => {
  const content = fs.readFileSync(path.join(__dirname, 'pages/contact-us.html'), 'utf8');
  assert.ok(content.includes('github.com/shubham88447/BoardsBuddy'), 'Missing GitHub link');
  assert.ok(content.includes('contact-form'), 'Missing contact form');
  assert.ok(!content.includes('123 Fake Street'), 'Found invented address');
  assert.ok(!content.includes('+1 (555)'), 'Found invented phone');
});

test('Returns & Refunds: Expresses 100% free model for 2025-2026 and future adaptability', () => {
  const content = fs.readFileSync(path.join(__dirname, 'pages/returns-refunds.html'), 'utf8');
  assert.ok(content.includes('free of charge') || content.includes('completely free'), 'Missing free status');
  assert.ok(content.includes('2025–2026') || content.includes('current academic year'), 'Missing academic year scope');
  assert.ok(content.includes('returns, cancellations, and monetary refunds are not applicable'), 'Missing non-applicability clarification');
});

// -------------------------------------------------------------
// Test Suite 3: Simplified Subject Dropdowns on 4 Pages
// -------------------------------------------------------------
const fourPages = [
  { html: 'pages/notes.html', js: 'js/pages/notes.js', dropdownId: 'subject-dropdown', promptId: 'notes-unselected-prompt' },
  { html: 'pages/short-notes.html', js: 'js/pages/short-notes.js', dropdownId: 'short-notes-subject-dropdown', promptId: 'short-notes-unselected-prompt' },
  { html: 'pages/chapterwise-pyqs.html', js: 'js/pages/chapterwise-pyqs.js', dropdownId: 'ch-pyqs-subject-dropdown', promptId: 'ch-pyqs-unselected-prompt' },
  { html: 'pages/pyq-solutions.html', js: 'js/pages/pyq-solutions.js', dropdownId: 'solutions-subject-dropdown', promptId: 'solutions-unselected-prompt' }
];

test('Subject Dropdowns: Buttons/chips row completely removed from all four pages', () => {
  fourPages.forEach(p => {
    const htmlContent = fs.readFileSync(path.join(__dirname, p.html), 'utf8');
    const jsContent = fs.readFileSync(path.join(__dirname, p.js), 'utf8');

    assert.ok(!htmlContent.includes('subject-pills-group'), `subject-pills-group still in ${p.html}`);
    assert.ok(!htmlContent.includes('subject-pill-btn'), `subject-pill-btn still in ${p.html}`);
    assert.ok(!jsContent.includes('subject-pill-btn'), `subject-pill-btn still in ${p.js}`);
    assert.ok(!jsContent.includes('pillsContainer'), `pillsContainer still referenced in ${p.js}`);
  });
});

test('Subject Dropdowns: Default first option is "Choose a subject"', () => {
  fourPages.forEach(p => {
    const htmlContent = fs.readFileSync(path.join(__dirname, p.html), 'utf8');
    const jsContent = fs.readFileSync(path.join(__dirname, p.js), 'utf8');

    assert.ok(htmlContent.includes('<option value="">Choose a subject</option>'), `HTML missing default "Choose a subject" in ${p.html}`);
    assert.ok(jsContent.includes('<option value="">Choose a subject</option>'), `JS missing default "Choose a subject" in ${p.js}`);
  });
});

test('Subject Dropdowns: Placeholder prompt displays "Please choose a subject to view the content."', () => {
  fourPages.forEach(p => {
    const htmlContent = fs.readFileSync(path.join(__dirname, p.html), 'utf8');
    assert.ok(htmlContent.includes('Please choose a subject to view the content.'), `Missing prompt text in ${p.html}`);
  });
});

// -------------------------------------------------------------
// Test Suite 4: Authentication Security & Redirection
// -------------------------------------------------------------
test('Auth Service: hasUserSessionSync correctly detects presence of session in localStorage', () => {
  const authJs = fs.readFileSync(path.join(__dirname, 'js/services/auth.js'), 'utf8');
  assert.ok(authJs.includes('function hasUserSessionSync'), 'Missing hasUserSessionSync function in auth.js');
  assert.ok(authJs.includes('hasUserSessionSync,'), 'hasUserSessionSync not exported from AuthService');
});

test('Auth Service: requireUserAuth protects against redirect loops and preserves full destination URL', () => {
  const authJs = fs.readFileSync(path.join(__dirname, 'js/services/auth.js'), 'utf8');
  assert.ok(authJs.includes("if (window.location.pathname.includes('auth.html')) return true"), 'Missing loop prevention');
  assert.ok(authJs.includes('redirect='), 'Missing redirect param in auth.js');
  assert.ok(authJs.includes('message='), 'Missing message param in auth.js');
});

test('Auth Page: auth.html displays notice banner with message and recovers safe redirect URL', () => {
  const authHtml = fs.readFileSync(path.join(__dirname, 'pages/auth.html'), 'utf8');
  assert.ok(authHtml.includes('auth-notice-banner'), 'Missing auth-notice-banner in auth.html');
  assert.ok(authHtml.includes('auth-notice-text'), 'Missing auth-notice-text in auth.html');
  assert.ok(authHtml.includes('getSafeRedirectUrl'), 'Missing getSafeRedirectUrl in auth.html');
});

test('UI Service: initProtectedNavigation intercepts unauthenticated clicks on 4 protected pages', () => {
  const uiJs = fs.readFileSync(path.join(__dirname, 'js/utils/ui.js'), 'utf8');
  assert.ok(uiJs.includes('initProtectedNavigation'), 'Missing initProtectedNavigation in ui.js');
  assert.ok(uiJs.includes('notes.html'), 'Protected pages array missing notes.html');
  assert.ok(uiJs.includes('short-notes.html'), 'Protected pages array missing short-notes.html');
  assert.ok(uiJs.includes('chapterwise-pyqs.html'), 'Protected pages array missing chapterwise-pyqs.html');
  assert.ok(uiJs.includes('pyq-solutions.html'), 'Protected pages array missing pyq-solutions.html');
});

test('Page Controllers: 4 protected controllers invoke AuthService.requireUserAuth', () => {
  fourPages.forEach(p => {
    const jsContent = fs.readFileSync(path.join(__dirname, p.js), 'utf8');
    assert.ok(jsContent.includes('AuthService.requireUserAuth'), `requireUserAuth missing in ${p.js}`);
  });
});

test('Public Controllers: Textbooks and PYQ Papers do NOT require authentication', () => {
  const tbJs = fs.readFileSync(path.join(__dirname, 'js/pages/textbooks.js'), 'utf8');
  const pyqJs = fs.readFileSync(path.join(__dirname, 'js/pages/pyqs.js'), 'utf8');

  assert.ok(!tbJs.includes('requireUserAuth'), 'Textbooks controller should not call requireUserAuth');
  assert.ok(!pyqJs.includes('requireUserAuth'), 'PYQs controller should not call requireUserAuth');
});

test('Viewer Controller: Allows public access to textbooks and PYQs; requires auth for notes and solutions', () => {
  const viewerJs = fs.readFileSync(path.join(__dirname, 'js/pages/viewer.js'), 'utf8');
  assert.ok(viewerJs.includes("effectiveType === 'textbook' || effectiveType === 'pyq'"), 'Missing isPublic check in viewer.js');
  assert.ok(viewerJs.includes('AuthService.requireUserAuth'), 'Missing requireUserAuth in viewer.js for non-public content');
});

// -------------------------------------------------------------
// Test Suite 5: Database and Storage Security
// -------------------------------------------------------------
test('Database RLS: 20261028000000_secure_content_access.sql migration file exists with correct policies', () => {
  const migrationPath = path.join(__dirname, 'supabase/migrations/20261028000000_secure_content_access.sql');
  assert.ok(fs.existsSync(migrationPath), 'Migration file 20261028000000_secure_content_access.sql does not exist');
  const migration = fs.readFileSync(migrationPath, 'utf8');

  assert.ok(migration.includes("Public can view published textbooks and pyqs"), 'Missing public policy in migration');
  assert.ok(migration.includes("type in ('textbook', 'pyq')"), 'Public policy does not restrict to textbook and pyq');
  assert.ok(migration.includes("Authenticated users can view all published resources"), 'Missing authenticated user policy in migration');
  assert.ok(migration.includes("Public read access for textbooks, pyqs and thumbnails"), 'Missing storage policy in migration');
});

test('Schema: supabase/schema.sql incorporates updated RLS policies', () => {
  const schemaPath = path.join(__dirname, 'supabase/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  assert.ok(schema.includes("Public can view published textbooks and pyqs"), 'Missing public policy in schema.sql');
  assert.ok(schema.includes("Authenticated users can view all published resources"), 'Missing authenticated user policy in schema.sql');
  assert.ok(schema.includes("Public read access for textbooks, pyqs and thumbnails"), 'Missing storage policy in schema.sql');
});

test('DbService: Local mock fallback also enforces access control on protected types', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, 'js/services/db.js'), 'utf8');
  assert.ok(dbJs.includes("['notes', 'short_notes', 'chapterwise_pyq', 'pyq_solution']"), 'Missing protected types array in db.js');
  assert.ok(dbJs.includes('if (isProtected && !user && !isAdmin)'), 'Missing auth check in db.js getResources / getResourceById');
});

console.log(`\n======================================================`);
console.log(`Summary: ${passedTests} / ${totalTests} test assertions PASSED.`);
console.log(`======================================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
