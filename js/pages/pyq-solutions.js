/**
 * BoardsBuddy - PYQ Solutions Page Controller
 * Displays step-by-step solved board questions (Wireframe 9)
 */

document.addEventListener('DOMContentLoaded', async () => {
  UI.renderStudyNav('pyq-solutions');

  const dropdown = document.getElementById('solutions-subject-dropdown');
  const pillsContainer = document.getElementById('solutions-pills-container');
  const loading = document.getElementById('solutions-loading');
  const container = document.getElementById('solutions-container');

  try {
    const subjects = await DbService.getSubjects();

    subjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      dropdown.appendChild(opt);
    });

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

      const [chapters, solutions] = await Promise.all([
        DbService.getChapters(subjectId),
        DbService.getResources({ type: 'pyq_solution', subjectId: subjectId })
      ]);

      loading.classList.add('hidden');
      container.classList.remove('hidden');

      if (!solutions || solutions.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 3rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-default);">
            <p class="text-muted">No published solutions available for this subject yet. You can add step-by-step solutions via the Admin Panel.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = solutions.map(sol => {
        const chapter = chapters.find(c => c.id === sol.chapter_id);
        const viewerUrl = `viewer.html?resourceId=${sol.id}&type=pyq_solution`;

        return `
          <div class="solution-box" id="sol-${sol.id}">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
                  <span class="badge badge-warning">SSC ${sol.year || 'Exam'}</span>
                  <span class="badge badge-primary">${sol.marks ? sol.marks + ' Marks' : 'Model Answer'}</span>
                  ${chapter ? `<span class="badge badge-secondary">Ch ${chapter.chapter_number}: ${chapter.title}</span>` : ''}
                </div>
                <h3 style="font-size: 1.15rem; line-height: 1.35;">${sol.title}</h3>
              </div>
              <a href="${viewerUrl}" class="btn btn-sm btn-outline" title="Open in dedicated viewer with chapter sidebar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                <span>Full Viewer</span>
              </a>
            </div>

            <div style="line-height: 1.7; font-size: 0.95rem;">
              ${UI.formatContent(sol.content_text || sol.description || '')}
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
    const initialSubjectId = urlParams.get('subjectId') || subjects[0]?.id;
    if (initialSubjectId) selectSubject(initialSubjectId);

  } catch (err) {
    console.error('Error loading PYQ solutions:', err);
    loading.innerHTML = `<div class="form-error">Error: ${err.message}</div>`;
  }
});
