/**
 * BoardsBuddy - Complete Private Admin Panel Controller
 * Handles Overview, Boards, Subjects, Chapters, Content Manager, File Uploads, and Live Preview.
 */

const Admin = (function () {
  let currentTab = 'overview';
  let cachedSubjects = [];
  let cachedChapters = [];

  // DOM Elements
  const navItems = document.querySelectorAll('.admin-nav-item');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');
  const pageTitle = document.getElementById('admin-page-title');
  const userEmailSpan = document.getElementById('admin-user-email');

  async function init() {
    // 1. Strict Security Check
    const isAuthorized = await AuthService.requireAdminAuth('login.html');
    if (!isAuthorized) return;

    const user = await AuthService.getCurrentUser();
    if (userEmailSpan) userEmailSpan.textContent = user.email || 'Admin User';

    // 2. Setup Nav Tabs
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    // 3. Setup Mobile Drawer
    document.getElementById('admin-menu-toggle')?.addEventListener('click', () => {
      document.getElementById('admin-sidebar').classList.toggle('open');
    });

    // 4. Logout
    document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
      AuthService.signOut();
    });

    // Load initial data
    await refreshSubjectCaches();
    await loadOverview();
    setupModalsAndEvents();
  }

  function switchTab(tabKey) {
    currentTab = tabKey;
    navItems.forEach(i => i.classList.toggle('active', i.getAttribute('data-tab') === tabKey));
    tabPanes.forEach(p => p.classList.toggle('active', p.id === `tab-${tabKey}`));

    const titles = {
      overview: 'Overview Dashboard',
      boards: 'Manage Curriculum Boards & Classes',
      subjects: 'Manage Subjects',
      chapters: 'Manage Chapters',
      content: 'Content Manager',
      uploads: 'Upload Manager (Storage)',
      preview: 'Student Viewer Simulator'
    };
    if (pageTitle) pageTitle.textContent = titles[tabKey] || 'Admin Portal';

    // Refresh tab content
    if (tabKey === 'overview') loadOverview();
    if (tabKey === 'boards') loadBoards();
    if (tabKey === 'subjects') loadSubjects();
    if (tabKey === 'chapters') loadChapters();
    if (tabKey === 'content') loadContent();
    if (tabKey === 'preview') updatePreview();
  }

  async function refreshSubjectCaches() {
    cachedSubjects = await DbService.getSubjects();
    populateSubjectSelects();
  }

  function populateSubjectSelects() {
    const selects = [
      document.getElementById('admin-chapter-subject-filter'),
      document.getElementById('admin-content-subject-filter'),
      document.getElementById('res-subject-select'),
      document.getElementById('chap-subject-select')
    ];

    selects.forEach(sel => {
      if (!sel) return;
      const isFilter = sel.id.includes('filter');
      sel.innerHTML = isFilter ? '<option value="">All Subjects</option>' : '';
      cachedSubjects.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.name;
        sel.appendChild(opt);
      });
    });
  }

  /* ==========================================================================
     Tab 1: Overview
     ========================================================================== */
  async function loadOverview() {
    try {
      const stats = await DbService.getAdminOverviewStats();
      document.getElementById('stat-total-subjects').textContent = stats.totalSubjects;
      document.getElementById('stat-total-chapters').textContent = stats.totalChapters;
      document.getElementById('stat-total-resources').textContent = stats.totalResources;
      document.getElementById('stat-published-drafts').textContent = `${stats.publishedResources} / ${stats.draftResources}`;

      // Recent Materials Table
      const recent = await DbService.getResources({ onlyPublished: false });
      const recentTable = document.getElementById('overview-recent-table-body');
      const recentSlice = recent.slice(0, 6);

      if (recentSlice.length === 0) {
        recentTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No materials created yet.</td></tr>`;
        return;
      }

      recentTable.innerHTML = recentSlice.map(r => `
        <tr>
          <td style="font-weight: 600;">${r.title}</td>
          <td><span class="badge badge-primary">${r.type.toUpperCase()}</span></td>
          <td>${r.subjects?.name || 'Class 10'}</td>
          <td>
            <span class="badge ${r.is_published ? 'badge-success' : 'badge-warning'}">
              ${r.is_published ? 'Published' : 'Draft'}
            </span>
          </td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${new Date(r.created_at).toLocaleDateString()}</td>
        </tr>
      `).join('');

    } catch (e) {
      console.error('Failed to load overview:', e);
    }
  }

  /* ==========================================================================
     Tab 2: Boards & Classes
     ========================================================================== */
  async function loadBoards() {
    const tableBody = document.getElementById('boards-table-body');
    const boards = await DbService.getBoards();

    tableBody.innerHTML = boards.map(b => `
      <tr>
        <td style="font-weight: 600;">${b.name}</td>
        <td><code>${b.code}</code></td>
        <td>Class 10 (SSC)</td>
        <td>
          <span class="badge ${b.is_active ? 'badge-success' : 'badge-warning'}">
            ${b.is_active ? 'Active & Published' : 'Upcoming'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-ghost" onclick="UI.showToast('Board settings are configured in schema.', 'info')">
            Configure
          </button>
        </td>
      </tr>
    `).join('');
  }

  /* ==========================================================================
     Tab 3: Subjects
     ========================================================================== */
  async function loadSubjects() {
    await refreshSubjectCaches();
    const tableBody = document.getElementById('subjects-table-body');

    tableBody.innerHTML = cachedSubjects.map(s => `
      <tr>
        <td>${s.display_order || 1}</td>
        <td style="font-weight: 600;">${s.name}</td>
        <td><code>${s.code}</code></td>
        <td>
          <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${s.color || '#4f46e5'}; vertical-align: middle; margin-right: 6px;"></span>
          <span>${s.icon || 'book'}</span>
        </td>
        <td><span class="badge badge-success">Active</span></td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-sm btn-secondary" onclick="Admin.editSubject('${s.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="Admin.deleteSubject('${s.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  /* ==========================================================================
     Tab 4: Chapters
     ========================================================================== */
  async function loadChapters() {
    const filterSelect = document.getElementById('admin-chapter-subject-filter');
    const subjectId = filterSelect.value || cachedSubjects[0]?.id;
    if (filterSelect && !filterSelect.value && subjectId) {
      filterSelect.value = subjectId;
    }

    const tableBody = document.getElementById('chapters-table-body');
    const countBadge = document.getElementById('admin-chapters-count');

    cachedChapters = await DbService.getChapters(subjectId);
    countBadge.textContent = `${cachedChapters.length} Chapters`;

    if (cachedChapters.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No chapters found for this subject.</td></tr>`;
      return;
    }

    tableBody.innerHTML = cachedChapters.map(ch => `
      <tr>
        <td><span class="chapter-number-badge">Ch ${ch.chapter_number}</span></td>
        <td style="font-weight: 600;">${ch.title}</td>
        <td style="font-size: 0.85rem; color: var(--text-secondary); max-width: 320px;">${ch.description || '—'}</td>
        <td><span class="badge badge-success">Active</span></td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-sm btn-secondary" onclick="Admin.editChapter('${ch.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="Admin.deleteChapter('${ch.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  /* ==========================================================================
     Tab 5: Content Manager
     ========================================================================== */
  async function loadContent() {
    const type = document.getElementById('admin-content-type-filter').value || null;
    const subjectId = document.getElementById('admin-content-subject-filter').value || null;
    const tableBody = document.getElementById('resources-table-body');

    const resources = await DbService.getResources({
      type: type,
      subjectId: subjectId,
      onlyPublished: false
    });

    if (resources.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No study materials found for selected filters.</td></tr>`;
      return;
    }

    tableBody.innerHTML = resources.map(r => `
      <tr>
        <td style="font-weight: 600;">
          <div>${r.title}</div>
          ${r.year ? `<span style="font-size: 0.75rem; color: var(--text-muted);">Year: ${r.year}</span>` : ''}
          ${r.marks ? `<span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">Marks: ${r.marks}</span>` : ''}
        </td>
        <td><span class="badge badge-primary">${r.type.toUpperCase().replace('_', ' ')}</span></td>
        <td>${r.subjects?.name || 'Class 10'}</td>
        <td>${r.chapters ? `Ch ${r.chapters.chapter_number}` : '—'}</td>
        <td>
          <span class="badge ${r.is_published ? 'badge-success' : 'badge-warning'}">
            ${r.is_published ? 'Published' : 'Draft'}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            <button class="btn btn-sm ${r.is_published ? 'btn-ghost' : 'btn-outline'}" onclick="Admin.togglePublish('${r.id}', ${!r.is_published})">
              ${r.is_published ? 'Unpublish' : 'Publish'}
            </button>
            <button class="btn btn-sm btn-secondary" onclick="Admin.editResource('${r.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="Admin.deleteResource('${r.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  /* ==========================================================================
     Tab 6: Upload Manager (Storage)
     ========================================================================== */
  function setupUploadManager() {
    const dropzone = document.getElementById('upload-dropzone');
    const fileInput = document.getElementById('file-input-picker');
    const progressWrapper = document.getElementById('upload-progress-wrapper');
    const progressPercent = document.getElementById('upload-progress-percent');
    const progressFill = document.getElementById('admin-upload-fill');
    const fileNameSpan = document.getElementById('uploading-file-name');
    const uploadsTable = document.getElementById('uploads-table-body');

    // Drag & Drop events
    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) handleFileUpload(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
    });

    async function handleFileUpload(file) {
      try {
        StorageService.validateFile(file);
      } catch (err) {
        UI.showToast(err.message, 'error');
        return;
      }

      progressWrapper.classList.remove('hidden');
      fileNameSpan.textContent = `Uploading ${file.name}...`;
      progressPercent.textContent = '30%';
      progressFill.style.width = '30%';

      try {
        setTimeout(() => { progressPercent.textContent = '75%'; progressFill.style.width = '75%'; }, 300);
        
        const uploaded = await StorageService.uploadFile(file);
        
        progressPercent.textContent = '100%';
        progressFill.style.width = '100%';
        UI.showToast(`Uploaded ${file.name} successfully to storage!`, 'success');

        // Add to uploaded table
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight: 600;">${uploaded.name}</td>
          <td><span class="badge badge-secondary">${file.type || 'PDF'}</span></td>
          <td>${(file.size / 1024 / 1024).toFixed(2)} MB</td>
          <td><code style="font-size: 0.8rem; word-break: break-all;">${uploaded.fullUrl}</code></td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="navigator.clipboard.writeText('${uploaded.fullUrl}'); UI.showToast('File URL copied to clipboard!', 'success');">
              Copy URL
            </button>
          </td>
        `;

        if (uploadsTable.querySelector('td[colspan]')) {
          uploadsTable.innerHTML = '';
        }
        uploadsTable.prepend(tr);

        // Pre-fill URL in resource modal
        document.getElementById('res-file-url-input').value = uploaded.fullUrl;

        setTimeout(() => {
          progressWrapper.classList.add('hidden');
          progressFill.style.width = '0%';
        }, 1200);

      } catch (err) {
        UI.showToast('Upload failed: ' + err.message, 'error');
        progressWrapper.classList.add('hidden');
      }
    }
  }

  /* ==========================================================================
     Tab 7: Live Preview
     ========================================================================== */
  function updatePreview() {
    const iframe = document.getElementById('admin-preview-iframe');
    if (iframe) iframe.src = '../pages/viewer.html';
  }

  /* ==========================================================================
     Modals & Event Handlers
     ========================================================================== */
  function setupModalsAndEvents() {
    // Subject filter change in chapters tab
    document.getElementById('admin-chapter-subject-filter')?.addEventListener('change', loadChapters);

    // Content filters
    document.getElementById('admin-content-type-filter')?.addEventListener('change', loadContent);
    document.getElementById('admin-content-subject-filter')?.addEventListener('change', loadContent);

    // Subject select in Resource Modal updates chapter options
    document.getElementById('res-subject-select')?.addEventListener('change', async (e) => {
      await updateModalChapters(e.target.value);
    });

    // Create Resource Button
    document.getElementById('create-resource-btn')?.addEventListener('click', async () => {
      document.getElementById('resource-modal-title').textContent = 'Create Study Resource';
      document.getElementById('resource-modal-form').reset();
      document.getElementById('res-edit-id').value = '';
      const subjectSelect = document.getElementById('res-subject-select');
      if (subjectSelect.options.length > 0) {
        subjectSelect.selectedIndex = 0;
        await updateModalChapters(subjectSelect.value);
      }
      document.getElementById('resource-modal').showModal();
    });

    // Save Resource Form
    document.getElementById('resource-modal-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('save-resource-submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      const editId = document.getElementById('res-edit-id').value.trim();
      const type = document.getElementById('res-type-select').value;
      const subjectId = document.getElementById('res-subject-select').value;
      const chapterId = document.getElementById('res-chapter-select').value || null;
      const year = document.getElementById('res-year-input').value ? parseInt(document.getElementById('res-year-input').value, 10) : null;
      const marks = document.getElementById('res-marks-input').value ? parseInt(document.getElementById('res-marks-input').value, 10) : null;
      const title = document.getElementById('res-title-input').value.trim();
      const desc = document.getElementById('res-desc-input').value.trim() || null;
      const fileUrl = document.getElementById('res-file-url-input').value.trim() || null;
      const contentText = document.getElementById('res-content-input').value || null;
      const isPublished = document.getElementById('res-publish-checkbox').checked;
      const allowDownload = document.getElementById('res-download-checkbox').checked;

      const resourcePayload = {
        type: type,
        board_id: '11111111-1111-1111-1111-111111111111',
        class_id: '33333333-3333-3333-3333-333333333333',
        subject_id: subjectId,
        chapter_id: chapterId,
        year: year,
        marks: marks,
        title: title,
        description: desc,
        file_url: fileUrl,
        content_text: contentText,
        is_published: isPublished,
        allow_download: allowDownload
      };

      if (editId) {
        resourcePayload.id = editId;
      }

      try {
        await DbService.saveResource(resourcePayload);

        UI.showToast(`Resource "${title}" saved successfully!`, 'success');
        document.getElementById('resource-modal').close();
        loadContent();
        loadOverview();

      } catch (err) {
        UI.showToast('Error saving resource: ' + err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Resource';
      }
    });

    // Add Chapter Button
    document.getElementById('add-chapter-btn')?.addEventListener('click', () => {
      document.getElementById('chapter-modal-title').textContent = 'Add New Chapter';
      document.getElementById('chapter-modal-form').reset();
      document.getElementById('chap-edit-id').value = '';
      const filterSub = document.getElementById('admin-chapter-subject-filter').value;
      if (filterSub) document.getElementById('chap-subject-select').value = filterSub;
      document.getElementById('chapter-modal').showModal();
    });

    // Save Chapter Form
    document.getElementById('chapter-modal-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('chap-edit-id').value.trim();
      const subjectId = document.getElementById('chap-subject-select').value;
      const num = parseInt(document.getElementById('chap-number-input').value, 10);
      const title = document.getElementById('chap-title-input').value.trim();
      const desc = document.getElementById('chap-desc-input').value.trim() || null;

      const chapterPayload = {
        subject_id: subjectId,
        chapter_number: num,
        title: title,
        description: desc,
        is_active: true
      };

      if (editId) {
        chapterPayload.id = editId;
      }

      try {
        await DbService.saveChapter(chapterPayload);
        UI.showToast('Chapter saved successfully!', 'success');
        document.getElementById('chapter-modal').close();
        loadChapters();
        loadOverview();
      } catch (err) {
        UI.showToast('Error saving chapter: ' + err.message, 'error');
      }
    });

    // Add Subject Button
    document.getElementById('add-subject-btn')?.addEventListener('click', () => {
      document.getElementById('subject-modal-title').textContent = 'Add New Subject';
      document.getElementById('subject-modal-form').reset();
      document.getElementById('sub-edit-id').value = '';
      document.getElementById('subject-modal').showModal();
    });

    // Save Subject Form
    document.getElementById('subject-modal-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('sub-edit-id').value.trim();
      const name = document.getElementById('sub-name-input').value.trim();
      const code = document.getElementById('sub-code-input').value.trim().toUpperCase();
      const desc = document.getElementById('sub-desc-input').value.trim() || null;

      const subjectPayload = {
        board_id: '11111111-1111-1111-1111-111111111111',
        class_id: '33333333-3333-3333-3333-333333333333',
        name: name,
        code: code,
        description: desc,
        is_active: true
      };

      if (editId) {
        subjectPayload.id = editId;
      }

      try {
        await DbService.saveSubject(subjectPayload);
        UI.showToast('Subject saved!', 'success');
        document.getElementById('subject-modal').close();
        loadSubjects();
        loadOverview();
      } catch (err) {
        UI.showToast('Error saving subject: ' + err.message, 'error');
      }
    });

    setupUploadManager();
  }

  async function updateModalChapters(subjectId) {
    const chapterSelect = document.getElementById('res-chapter-select');
    chapterSelect.innerHTML = '<option value="">-- General / No Chapter --</option>';
    if (!subjectId) return;

    const chapters = await DbService.getChapters(subjectId);
    chapters.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch.id;
      opt.textContent = `Ch ${ch.chapter_number}: ${ch.title}`;
      chapterSelect.appendChild(opt);
    });
  }

  /* ==========================================================================
     CRUD Helper Actions Called from Table Buttons
     ========================================================================== */
  async function editResource(id) {
    const r = await DbService.getResourceById(id);
    if (!r) return;

    document.getElementById('resource-modal-title').textContent = 'Edit Study Resource';
    document.getElementById('res-edit-id').value = r.id;
    document.getElementById('res-type-select').value = r.type;
    document.getElementById('res-subject-select').value = r.subject_id;
    await updateModalChapters(r.subject_id);
    document.getElementById('res-chapter-select').value = r.chapter_id || '';
    document.getElementById('res-year-input').value = r.year || '';
    document.getElementById('res-marks-input').value = r.marks || '';
    document.getElementById('res-title-input').value = r.title;
    document.getElementById('res-desc-input').value = r.description || '';
    document.getElementById('res-file-url-input').value = r.file_url || '';
    document.getElementById('res-content-input').value = r.content_text || '';
    document.getElementById('res-publish-checkbox').checked = !!r.is_published;
    document.getElementById('res-download-checkbox').checked = r.allow_download !== false;

    document.getElementById('resource-modal').showModal();
  }

  async function deleteResource(id) {
    if (confirm('Are you sure you want to delete this resource? This destructive action cannot be undone.')) {
      await DbService.deleteResource(id);
      UI.showToast('Resource deleted.', 'info');
      loadContent();
      loadOverview();
    }
  }

  async function togglePublish(id, isPublished) {
    await DbService.togglePublishResource(id, isPublished);
    UI.showToast(`Resource is now ${isPublished ? 'published' : 'saved as draft'}.`, 'success');
    loadContent();
    loadOverview();
  }

  async function editChapter(id) {
    const ch = cachedChapters.find(c => c.id === id);
    if (!ch) return;

    document.getElementById('chapter-modal-title').textContent = 'Edit Chapter';
    document.getElementById('chap-edit-id').value = ch.id;
    document.getElementById('chap-subject-select').value = ch.subject_id;
    document.getElementById('chap-number-input').value = ch.chapter_number;
    document.getElementById('chap-title-input').value = ch.title;
    document.getElementById('chap-desc-input').value = ch.description || '';

    document.getElementById('chapter-modal').showModal();
  }

  async function deleteChapter(id) {
    if (confirm('Are you sure you want to delete this chapter? All associated notes and resources will also be removed.')) {
      await DbService.deleteChapter(id);
      UI.showToast('Chapter deleted.', 'info');
      loadChapters();
      loadOverview();
    }
  }

  async function editSubject(id) {
    const s = cachedSubjects.find(sub => sub.id === id);
    if (!s) return;

    document.getElementById('subject-modal-title').textContent = 'Edit Subject';
    document.getElementById('sub-edit-id').value = s.id;
    document.getElementById('sub-name-input').value = s.name;
    document.getElementById('sub-code-input').value = s.code;
    document.getElementById('sub-desc-input').value = s.description || '';

    document.getElementById('subject-modal').showModal();
  }

  async function deleteSubject(id) {
    if (confirm('Are you sure you want to delete this subject? All chapters and study resources under it will be deleted.')) {
      await DbService.deleteSubject(id);
      UI.showToast('Subject deleted.', 'info');
      loadSubjects();
      loadOverview();
    }
  }

  // Self-initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  return {
    switchTab,
    editResource,
    deleteResource,
    togglePublish,
    editChapter,
    deleteChapter,
    editSubject,
    deleteSubject
  };
})();

window.Admin = Admin;
