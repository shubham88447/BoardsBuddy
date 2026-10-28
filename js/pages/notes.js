/**
 * BoardsBuddy - Notes Page Controller
 * Manages Subject Selection and Chapter Listing with Mandatory Student Authentication
 */

document.addEventListener('DOMContentLoaded', async () => {
  UI.renderStudyNav('notes');

  // Enforce Student Authentication
  const isAuthed = await AuthService.requireUserAuth({
    message: 'Please log in or create an account to access this content.'
  });
  if (!isAuthed) return;

  const dropdown = document.getElementById('subject-dropdown');
  const promptBox = document.getElementById('notes-unselected-prompt');
  const loading = document.getElementById('chapters-loading');
  const chaptersContainer = document.getElementById('chapters-container');

  try {
    const subjects = await DbService.getSubjects();

    // Populate Dropdown
    dropdown.innerHTML = '<option value="">Choose a subject</option>';
    subjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      dropdown.appendChild(opt);
    });

    // Handle Selection Change
    async function selectSubject(subjectId) {
      if (!subjectId) {
        promptBox.classList.remove('hidden');
        chaptersContainer.classList.add('hidden');
        dropdown.value = '';

        const url = new URL(window.location);
        url.searchParams.delete('subjectId');
        url.searchParams.delete('subject');
        window.history.replaceState({}, '', url);
        return;
      }

      dropdown.value = subjectId;
      promptBox.classList.add('hidden');
      chaptersContainer.classList.add('hidden');
      loading.classList.remove('hidden');

      // Update URL query parameter dynamically without page refresh
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
            <p class="text-muted">No chapters found for this subject yet.</p>
          </div>
        `;
        return;
      }

      // Render Chapter Cards
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

    // Event Listener for Dropdown Selection
    dropdown.addEventListener('change', (e) => selectSubject(e.target.value));

    // Check query params
    const urlParams = new URLSearchParams(window.location.search);
    const paramSubjectId = urlParams.get('subjectId');
    const paramSubjectCode = urlParams.get('subject');

    let initialSubjectId = null;
    if (paramSubjectId && subjects.some(s => s.id === paramSubjectId)) {
      initialSubjectId = paramSubjectId;
    } else if (paramSubjectCode) {
      const found = subjects.find(s => s.code.toLowerCase() === paramSubjectCode.toLowerCase());
      if (found) initialSubjectId = found.id;
    }

    // Default: If no subject in URL, keep "Choose a subject" and show prompt
    if (initialSubjectId) {
      selectSubject(initialSubjectId);
    } else {
      dropdown.value = '';
      promptBox.classList.remove('hidden');
      chaptersContainer.classList.add('hidden');
    }

  } catch (err) {
    console.error('Failed to initialize Notes page:', err);
    loading.innerHTML = `<div class="form-error">Error loading notes: ${err.message}</div>`;
  }
});
