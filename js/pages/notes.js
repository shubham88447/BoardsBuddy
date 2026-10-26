/**
 * BoardsBuddy - Notes Page Controller
 * Manages Subject Selection (Wireframe 4) and Chapter Listing (Wireframe 5)
 */

document.addEventListener('DOMContentLoaded', async () => {
  UI.renderStudyNav('notes');

  const dropdown = document.getElementById('subject-dropdown');
  const pillsContainer = document.getElementById('subject-pills-container');
  const promptBox = document.getElementById('notes-unselected-prompt');
  const loading = document.getElementById('chapters-loading');
  const chaptersContainer = document.getElementById('chapters-container');

  try {
    const subjects = await DbService.getSubjects();

    // Populate Dropdown
    subjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      dropdown.appendChild(opt);
    });

    // Populate Quick Pills
    pillsContainer.innerHTML = subjects.map(sub => `
      <button class="subject-pill-btn" data-subject-id="${sub.id}">
        <span>${sub.name.replace('Mathematics', 'Math').replace('Science & Technology', 'Science')}</span>
      </button>
    `).join('');

    // Handle Selection Change
    async function selectSubject(subjectId) {
      if (!subjectId) {
        promptBox.classList.remove('hidden');
        chaptersContainer.classList.add('hidden');
        dropdown.value = '';
        document.querySelectorAll('.subject-pill-btn').forEach(b => b.classList.remove('active'));
        return;
      }

      dropdown.value = subjectId;
      document.querySelectorAll('.subject-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-subject-id') === subjectId);
      });

      promptBox.classList.add('hidden');
      chaptersContainer.classList.add('hidden');
      loading.classList.remove('hidden');

      // Save subject to URL and localStorage
      const url = new URL(window.location);
      url.searchParams.set('subjectId', subjectId);
      window.history.replaceState({}, '', url);
      localStorage.setItem(BOARDSBUDDY_CONFIG.STORAGE_KEYS.SELECTED_SUBJECT, subjectId);

      // Fetch chapters and notes
      const [chapters, notesResources] = await Promise.all([
        DbService.getChapters(subjectId),
        DbService.getResources({ type: 'notes', subjectId: subjectId })
      ]);

      loading.classList.add('hidden');
      chaptersContainer.classList.remove('hidden');

      if (!chapters || chapters.length === 0) {
        chaptersContainer.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <p class="text-muted">No chapters found for this subject yet. You can add chapters via the Admin Panel.</p>
          </div>
        `;
        return;
      }

      // Render Chapter Cards (Wireframe 5)
      chaptersContainer.innerHTML = chapters.map(ch => {
        const matchingNote = notesResources.find(n => n.chapter_id === ch.id);
        const hasNotes = !!matchingNote;
        const targetUrl = hasNotes 
          ? `viewer.html?subjectId=${subjectId}&chapterId=${ch.id}&type=notes&resourceId=${matchingNote.id}`
          : `viewer.html?subjectId=${subjectId}&chapterId=${ch.id}&type=notes`;

        return `
          <a href="${targetUrl}" class="chapter-card" id="chapter-card-${ch.chapter_number}">
            <div class="chapter-card-header">
              <span class="chapter-number-badge">Chapter ${ch.chapter_number}</span>
              <span class="status-indicator">
                <span class="status-dot ${hasNotes ? '' : 'coming-soon'}"></span>
                <span style="font-size: 0.75rem; font-weight: 600; color: ${hasNotes ? 'var(--success-600)' : 'var(--warning-600)'};">
                  ${hasNotes ? 'Notes Available' : 'Notes coming soon'}
                </span>
              </span>
            </div>
            <h3>${ch.title}</h3>
            <p>${ch.description || 'Theory concepts, derivations, and practice questions for board exams.'}</p>
            <div class="chapter-card-footer">
              <span style="display: flex; align-items: center; gap: 0.35rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>SSC Class 10 Syllabus</span>
              </span>
              <span style="font-weight: 600; color: var(--primary-600);">Open Notes &rarr;</span>
            </div>
          </a>
        `;
      }).join('');
    }

    // Event Listeners
    dropdown.addEventListener('change', (e) => selectSubject(e.target.value));

    pillsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.subject-pill-btn');
      if (btn) selectSubject(btn.getAttribute('data-subject-id'));
    });

    // Check query params or defaults
    const urlParams = new URLSearchParams(window.location.search);
    const paramSubjectId = urlParams.get('subjectId');
    const paramSubjectCode = urlParams.get('subject');

    let initialSubjectId = null;
    if (paramSubjectId) {
      initialSubjectId = paramSubjectId;
    } else if (paramSubjectCode) {
      const found = subjects.find(s => s.code.toLowerCase() === paramSubjectCode.toLowerCase());
      if (found) initialSubjectId = found.id;
    } else {
      // Default to first subject (Mathematics Part 1) or saved
      const saved = localStorage.getItem(BOARDSBUDDY_CONFIG.STORAGE_KEYS.SELECTED_SUBJECT);
      initialSubjectId = saved || subjects[0]?.id;
    }

    if (initialSubjectId) {
      selectSubject(initialSubjectId);
    }

  } catch (err) {
    console.error('Failed to initialize Notes page:', err);
    loading.innerHTML = `<div class="form-error">Error loading notes: ${err.message}</div>`;
  }
});
