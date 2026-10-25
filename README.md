# BoardsBuddy — Complete Board Exam Learning Platform 🎓

A modern, responsive, functional educational web platform built for board exam students, initially focusing on **Maharashtra State Board (MSBSHSE), Class 10 (SSC), Mathematics and Science**, with an extensible architecture designed to scale to other boards (CBSE, ICSE), classes, and subjects.

Built with **HTML5, Vanilla CSS3, Vanilla ES6+ JavaScript, and Supabase (PostgreSQL, Auth & Storage)**.

---

## Table of Contents
1. [Architecture & Folder Structure](#1-architecture--folder-structure)
2. [How the Frontend Communicates with Supabase](#2-how-the-frontend-communicates-with-supabase)
3. [How Authentication Works](#3-how-authentication-works)
4. [How the Admin Role is Protected](#4-how-the-admin-role-is-protected)
5. [Database Architecture & Table Relationships](#5-database-architecture--table-relationships)
6. [How to Upload a PDF and Publish a Chapter](#6-how-to-upload-a-pdf-and-publish-a-chapter)
7. [How to Run the Project Locally](#7-how-to-run-the-project-locally)
8. [Configuring Environment Variables](#8-configuring-environment-variables)
9. [Deployment Guide (GitHub & Vercel)](#9-deployment-guide-github--vercel)
10. [Git Workflow & Version Control Commands](#10-git-workflow--version-control-commands)
11. [Troubleshooting Common Issues](#11-troubleshooting-common-issues)

---

## 1. Architecture & Folder Structure

```
boards-buddy/
├── index.html                # Page 1: Landing Page (Hero, Features, Board info, Auth triggers)
├── pages/
│   ├── select.html           # Page 2: Board & Class Curriculum Selection Card
│   ├── textbooks.html        # Page 3: TextBooks (Balbharati official e-textbooks)
│   ├── notes.html            # Page 4 & 5: Chapter Notes Landing & Listing
│   ├── short-notes.html      # Page 6: Quick Revision Notes & Formula Cheat Sheets
│   ├── pyqs.html             # Page 7: Year-wise Previous-Year Question Papers (2020-2024)
│   ├── chapterwise-pyqs.html # Page 8: Chapterwise Previous-Year Questions (1, 2, 3, 4 marks)
│   ├── pyq-solutions.html    # Page 9: Step-by-Step Solved Questions with mathematical working
│   ├── viewer.html           # Page 10: Immersive Study Content Viewer (Dual-panel, PDF embed)
│   ├── auth.html             # Student Login, Sign Up & Password Reset forms
│   └── profile.html          # Student Account Dashboard (Curriculum, Progress, Bookmarks)
├── admin/
│   ├── login.html            # Dedicated Secure Administrator Portal Login
│   └── index.html            # Private Admin Dashboard (Overview, Content, Uploads, Preview)
├── css/
│   ├── variables.css         # Design tokens, color palette, dark/light theme overrides
│   ├── base.css              # Resets, typography, buttons, form controls, modals, toasts
│   ├── layout.css            # Header, unified 6-tab horizontal navigation, container, footer
│   ├── components.css        # Cards, hero section, accordions, PDF frame, search dialog
│   └── admin.css             # Admin dashboard layout, stats KPI grid, tables, dropzones
├── js/
│   ├── config.js             # Supabase project URL, Anon key, and storage key configurations
│   ├── supabase-client.js    # Supabase CDN client bridge with offline fallback
│   ├── data/
│   │   └── mock-seed.js      # Complete offline fallback dataset mirroring database schema
│   ├── services/
│   │   ├── auth.js           # Student & Admin Supabase Auth service
│   │   ├── db.js             # Database queries, filters, bookmarks, progress, admin CRUD
│   │   └── storage.js        # Supabase Storage file uploader, size/MIME validators
│   ├── utils/
│   │   └── ui.js             # Toasts, Light/Dark toggle, search dialog, math & markdown formatting
│   └── pages/
│       ├── textbooks.js      # Textbooks page controller
│       ├── notes.js          # Notes page controller
│       ├── short-notes.js    # Short notes page controller
│       ├── pyqs.js           # Year-wise PYQ papers controller
│       ├── chapterwise-pyqs.js # Chapterwise PYQs controller
│       ├── pyq-solutions.js  # PYQ solutions controller
│       ├── viewer.js         # Full study content viewer controller
│       └── admin.js          # Complete admin portal controller
├── supabase/
│   ├── schema.sql            # Master SQL schema, triggers, RLS policies, and seed data
│   └── migrations/
│       └── 20240101000000_init_boardsbuddy.sql
├── serve.js                  # Zero-dependency local Node.js HTTP server
├── vercel.json               # Vercel deployment routing and security headers
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules for credentials and cache
└── README.md                 # Complete documentation guide
```

---

## 2. How the Frontend Communicates with Supabase

BoardsBuddy communicates directly with Supabase from the browser using the official **Supabase JavaScript Client v2** loaded via CDN (`https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`).

1. **Client Initialization (`js/supabase-client.js`)**:
   Reads `CONFIG.SUPABASE_URL` and `CONFIG.SUPABASE_ANON_KEY` from `js/config.js`. It creates a singleton client instance:
   ```javascript
   const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
     auth: { persistSession: true, autoRefreshToken: true }
   });
   ```
2. **Encapsulated Service Layer (`js/services/`)**:
   Pages never write raw database calls. Instead:
   - `AuthService` handles authentication and session verification.
   - `DbService` executes typed queries on tables (`boards`, `subjects`, `chapters`, `resources`).
   - `StorageService` uploads and manages files in Supabase Storage.
3. **Zero-Config Smart Fallback**:
   If credentials have not been configured yet in `js/config.js`, the platform seamlessly falls back to `js/data/mock-seed.js` and `localStorage`. This allows instant exploration, testing, and UI review right out of the box without waiting for a database to be provisioned!

---

## 3. How Authentication Works

Authentication is powered by **Supabase Auth** (JSON Web Tokens stored in browser storage):

1. **Sign Up (`AuthService.signUp`)**:
   - Creates a user account in `auth.users`.
   - A PostgreSQL trigger (`on_auth_user_created`) automatically inserts a matching row into `public.profiles` (storing the student's name) and `public.user_roles` with the default role of `'student'`.
2. **Sign In (`AuthService.signIn`)**:
   - Calls `supabase.auth.signInWithPassword({ email, password })`.
   - Returns an encrypted JWT access token and refresh token that persists across page refreshes.
3. **Session Persistence**:
   - Supabase automatically checks token validity on load.
   - `UI.updateHeaderContext()` reflects the student's name in the header and shows their account profile button.
4. **Sign Out**:
   - Invalidates the active session and cleans up local state.

---

## 4. How the Admin Role is Protected

Security is designed with **Defense-in-Depth**:

1. **No Client-Only Security**:
   Hiding an admin button or link in CSS is NOT security. In BoardsBuddy, every administrative database operation (`insert`, `update`, `delete` on subjects, chapters, and resources) is protected by **PostgreSQL Row Level Security (RLS)**.
2. **Database-Verified Role (`user_roles` table)**:
   A dedicated table `public.user_roles` tracks user permissions. The table can only be modified by existing admins or via direct Supabase Dashboard SQL execution.
3. **Security Definer Function (`is_admin()`)**:
   ```sql
   create or replace function public.is_admin()
   returns boolean
   language sql
   security definer
   as $$
     select exists (
       select 1 from public.user_roles
       where user_id = auth.uid() and role = 'admin'
     );
   $$;
   ```
4. **Row Level Security Enforcement**:
   Even if a malicious user inspects network traffic and sends an API request directly to Supabase to insert a resource or chapter, the PostgreSQL engine evaluates `with check (public.is_admin())` and rejects the unauthorized request with a `403 Forbidden` error!
5. **Admin Route Guard (`AuthService.requireAdminAuth`)**:
   When entering `/admin/index.html`, the script immediately queries `user_roles`. If the authenticated user is not an admin, they are instantly redirected to `/admin/login.html`.

---

## 5. Database Architecture & Table Relationships

The database schema is organized into normalized relational tables:

```
  auth.users
      │
      ├── (1:1) ──> public.profiles (Name, Avatar, Curriculum)
      │
      └── (1:N) ──> public.user_roles (Role: 'admin' | 'student')

  public.boards (e.g. Maharashtra State Board)
      │
      └── (1:N) ──> public.classes (e.g. Class 10 SSC)
                        │
                        └── (1:N) ──> public.subjects (e.g. Math 1, Science 1)
                                          │
                                          ├── (1:N) ──> public.chapters (Ch 1, Ch 2...)
                                          │                 │
                                          │                 └── (1:N) ──> public.resources
                                          │
                                          └── (1:N) ────────────────────> public.resources
                                                                               (Textbooks, Notes,
                                                                                Formula Sheets, PYQs,
                                                                                Chapterwise PYQs, Solutions)
```

### Resource Types Supported:
- `textbook`: Official Balbharati e-textbook references.
- `notes`: Comprehensive theory, derivations, and examples.
- `short_notes`: 1-page formula sheets and key revision points.
- `pyq`: Year-wise examination papers (2020 to 2024).
- `chapterwise_pyq`: Questions sorted by chapter and mark weightage (1 to 4 marks).
- `pyq_solution`: Solved previous-year questions with complete mathematical working.

---

## 6. How to Upload a PDF and Publish a Chapter

Follow these simple steps in the Admin Panel:

1. **Step 1: Open the Admin Portal**:
   - Navigate to `/admin/login.html` and sign in with your verified admin account.
2. **Step 2: Upload the PDF in Upload Manager**:
   - Click on the **Upload Manager** tab in the sidebar.
   - Drag and drop your PDF file (or click "Browse Local Files").
   - The file is securely uploaded to the Supabase Storage bucket `study-materials`.
   - Click **Copy URL** next to the uploaded file.
3. **Step 3: Create or Select the Chapter**:
   - In the **Chapters** tab, verify that your chapter exists (or click "+ Add Chapter" to create it).
4. **Step 4: Create and Publish the Resource**:
   - Switch to the **Content Manager** tab and click **Create New Study Resource**.
   - Select the **Resource Type** (e.g., *Notes* or *Short Notes*).
   - Select the **Subject** (e.g., *Mathematics Part 1 (Algebra)*) and **Chapter** (e.g., *Ch 1: Linear Equations in Two Variables*).
   - Paste the copied PDF URL into the **PDF File URL** field.
   - (Optional) Enter formatted markdown or formulas in the text editor.
   - Ensure the **"Publish to Students immediately"** checkbox is checked.
   - Click **Save Resource**.
5. **Step 5: Verify on the Student Site**:
   - Open `/pages/notes.html` or `/pages/textbooks.html`. The newly published chapter and PDF are immediately accessible to students without touching any code!

---

## 7. How to Run the Project Locally

BoardsBuddy includes a zero-dependency local development server requiring only Node.js:

```bash
# 1. Open your terminal in the boards-buddy folder
cd C:\Users\shubh\.gemini\antigravity-ide\scratch\boards-buddy

# 2. Launch the local server
node serve.js
# or
npm start
```

Open your browser at **`http://localhost:3000`**:
- **Student Home:** `http://localhost:3000/index.html`
- **Curriculum Selection:** `http://localhost:3000/pages/select.html`
- **TextBooks:** `http://localhost:3000/pages/textbooks.html`
- **Chapter Notes:** `http://localhost:3000/pages/notes.html`
- **Short Notes:** `http://localhost:3000/pages/short-notes.html`
- **PYQs:** `http://localhost:3000/pages/pyqs.html`
- **Chapterwise PYQs:** `http://localhost:3000/pages/chapterwise-pyqs.html`
- **PYQ Solutions:** `http://localhost:3000/pages/pyq-solutions.html`
- **Study Viewer:** `http://localhost:3000/pages/viewer.html`
- **Admin Portal:** `http://localhost:3000/admin/login.html`

---

## 8. Configuring Environment Variables & Live Supabase

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. Under **Project Settings > API**, note your:
   - **Project URL** (e.g., `https://abcdefghijkl.supabase.co`)
   - **Project Anon/Public Key** (starts with `eyJhbGci...`)

### Step 2: Run the Database Migration
1. In your Supabase Dashboard, click on **SQL Editor**.
2. Open the file `supabase/schema.sql` from this repository.
3. Paste the entire SQL script and click **Run**.
4. This creates all tables, triggers, Row Level Security policies, storage buckets (`study-materials`, `chapter-thumbnails`), and seeds complete Maharashtra Board Class 10 content!

### Step 3: Assign the First Admin Role to Your Account
1. In your Supabase project, go to **Authentication > Users** and click **Add User** (or register via `pages/auth.html#signup`).
2. Copy the newly created user's **User UID** (UUID).
3. In the **SQL Editor**, run:
   ```sql
   insert into public.user_roles (user_id, role)
   values ('YOUR_USER_UID_HERE', 'admin')
   on conflict do nothing;
   ```
4. Your account is now a database-verified administrator!

### Step 4: Update Frontend Config
Open `js/config.js` and paste your project values:
```javascript
const CONFIG = {
  SUPABASE_URL: 'https://YOUR_ACTUAL_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_ACTUAL_ANON_KEY',
  // ...
};
```

---

## 9. Deployment Guide (GitHub & Vercel)

### Option A: Deploy to Vercel (Recommended)
1. Push your code to a GitHub repository (see section 10).
2. Go to [https://vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `boards-buddy` GitHub repository.
4. **Framework Preset:** Select **Other**.
5. **Root Directory:** `./`
6. Click **Deploy**. Vercel will host your site with worldwide CDN caching, SSL, and clean URLs using `vercel.json`!
7. In your Supabase project under **Authentication > URL Configuration**, add your Vercel URL (e.g., `https://boards-buddy.vercel.app`) to the **Redirect URLs** allowlist.

### Option B: Deploy to GitHub Pages
1. Go to your repository on GitHub.
2. Navigate to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **Deploy from a branch** and choose `main` / `root`.
4. Click **Save**.

---

## 10. Git Workflow & Version Control Commands

Here is a beginner-friendly cheat sheet for Git:

### Initializing and Committing
```bash
# 1. Initialize git in the folder
git init

# 2. Stage all files
git add .

# 3. Create your first commit
git commit -m "feat: initial commit of BoardsBuddy learning platform"

# 4. Set default branch to main
git branch -M main

# 5. Link to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/boards-buddy.git

# 6. Push to GitHub
git push -u origin main
```

### Making Changes Safely with Branches
Before implementing a major feature, create a separate branch:
```bash
# Create and switch to a new branch
git checkout -b feature/cbse-curriculum

# Make your edits, then stage and commit
git add .
git commit -m "feat: add CBSE Class 10 syllabus structure"

# Merge back into main when tested
git checkout main
git merge feature/cbse-curriculum
git push origin main
```

### Restoring a Previous Working Version
If something breaks:
```bash
# Discard uncommitted changes in your working directory
git restore .

# View commit history
git log --oneline

# Revert to a specific commit
git checkout <commit-hash>
```

---

## 11. Troubleshooting Common Issues

| Issue | Cause | Solution |
|---|---|---|
| **"Admin Access Denied" on login** | Account does not have `admin` role in `user_roles` table | Run `insert into public.user_roles (user_id, role) values ('<USER_ID>', 'admin');` in Supabase SQL editor. |
| **PDF does not display in Study Viewer** | Browser security blocks mixed HTTP content or third-party iframe | Click "Open PDF in New Tab" or use a Supabase Storage URL starting with `https://`. |
| **"Failed to fetch" on Supabase requests** | Invalid Supabase URL or Anon key in `js/config.js` | Double-check `js/config.js` credentials copied from Supabase Project Settings > API. |
| **Uploaded file rejected** | File exceeds 25 MB or has unsupported MIME type | Ensure file is a PDF, PNG, JPG, or WEBP under 25 MB. |
| **Changes not updating on screen** | Browser cached old JavaScript or CSS | Perform a hard refresh using `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac). |

---

## License & Credits
BoardsBuddy is designed for students preparing for State Board examinations. Educational syllabus references are aligned with the Maharashtra State Bureau of Textbook Production and Curriculum Research (Balbharati).
