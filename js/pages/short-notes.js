/**
 * BoardsBuddy - Short Notes Page Controller
 * Manages Chapter Formula Sheets & Fast Revision Cards (Wireframe 6)
 */

document.addEventListener('DOMContentLoaded', async () => {
  UI.renderStudyNav('short-notes');

  const dropdown = document.getElementById('short-notes-subject-dropdown');
  const pillsContainer = document.getElementById('short-notes-pills-container');
  const loading = document.getElementById('short-notes-loading');
  const container = document.getElementById('short-notes-container');

  try {
    const subjects = await DbService.getSubjects();

    // Populate Dropdown
    subjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      dropdown.appendChild(opt);
    });

    // Populate Pills
    pillsContainer.innerHTML = subjects.map(sub => `
      <button class="subject-pill-btn" data-subject-id="${sub.id}">
        <span>${sub.name.replace('Mathematics', 'Math').replace('Science & Technology', 'Science')}</span>
      </button>
    `).join('');

    async function selectSubject(subjectId) {
      if (!subjectId) return;

      dropdown.value = subjectId;
      document.querySelectorAll('.subject-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-subject-id') === subjectId);
      });

      container.classList.add('hidden');
      loading.classList.remove('hidden');

      const url = new URL(window.location);
      url.searchParams.set('subjectId', subjectId);
      window.history.replaceState({}, '', url);

      const [chapters, shortNotesResources] = await Promise.all([
        DbService.getChapters(subjectId),
        DbService.getResources({ type: 'short_notes', subjectId: subjectId })
      ]);

      loading.classList.add('hidden');
      container.classList.remove('hidden');

      if (!chapters || chapters.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <p class="text-muted">No chapters available for this subject.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = chapters.map(ch => {
        const matchingSN = shortNotesResources.find(n => n.chapter_id === ch.id);
        const hasShortNotes = !!matchingSN;
        const targetUrl = hasShortNotes
          ? `viewer.html?subjectId=${subjectId}&chapterId=${ch.id}&type=short_notes&resourceId=${matchingSN.id}`
          : `viewer.html?subjectId=${subjectId}&chapterId=${ch.id}&type=short_notes`;

        return `
          <div class="chapter-card" style="border-top: 4px solid var(--warning-500);">
            <div class="chapter-card-header">
              <span class="chapter-number-badge" style="background: var(--warning-50); color: #92400e;">
                Formula Sheet • Ch ${ch.chapter_number}
              </span>
              <span class="status-indicator">
                <span class="status-dot ${hasShortNotes ? '' : 'coming-soon'}"></span>
                <span style="font-size: 0.75rem; font-weight: 600; color: ${hasShortNotes ? 'var(--success-600)' : 'var(--warning-600)'};">
                  ${hasShortNotes ? 'Cheat Sheet Ready' : 'Coming Soon'}
                </span>
              </span>
            </div>
            <h3>${ch.title}</h3>
            <p>${ch.description || 'Important formulas, key definitions, theorems, and exam points.'}</p>
            <div class="chapter-card-footer">
              <span style="display: flex; align-items: center; gap: 0.35rem; color: var(--text-muted);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>Quick Revision</span>
              </span>
              <a href="${targetUrl}" class="btn btn-sm btn-outline">
                <span>Open Formula Sheet &rarr;</span>
              </a>
            </div>
          </div>
        `;
      }).join('');
    }

    dropdown.addEventListener('change', (e) => selectSubject(e.target.value));
    pillsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.subject-pill-btn');
      if (btn) selectSubject(btn.getAttribute('data-subject-id'));
    });

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
      initialSubjectId = subjects[0]?.id;
    }

    if (initialSubjectId) selectSubject(initialSubjectId);

  } catch (err) {
    console.error('Error loading short notes:', err);
    loading.innerHTML = `<div class="form-error">Error: ${err.message}</div>`;
  }
});
