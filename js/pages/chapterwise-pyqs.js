/**
 * BoardsBuddy - Chapterwise PYQs Page Controller
 * Groups Previous-Year Questions by Chapter & Marks with Student Auth Guard
 */

document.addEventListener('DOMContentLoaded', async () => {
  UI.renderStudyNav('chapterwise-pyqs');

  // Enforce Student Authentication
  const isAuthed = await AuthService.requireUserAuth({
    message: 'Please log in or create an account to access this content.'
  });
  if (!isAuthed) return;

  const dropdown = document.getElementById('ch-pyqs-subject-dropdown');
  const promptBox = document.getElementById('ch-pyqs-unselected-prompt');
  const loading = document.getElementById('ch-pyqs-loading');
  const container = document.getElementById('ch-pyqs-container');

  try {
    const subjects = await DbService.getSubjects();

    dropdown.innerHTML = '<option value="">Choose a subject</option>';
    subjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      dropdown.appendChild(opt);
    });

    async function selectSubject(subjectId) {
      if (!subjectId) {
        promptBox.classList.remove('hidden');
        container.classList.add('hidden');
        dropdown.value = '';

        const url = new URL(window.location);
        url.searchParams.delete('subjectId');
        url.searchParams.delete('subject');
        window.history.replaceState({}, '', url);
        return;
      }

      dropdown.value = subjectId;
      promptBox.classList.add('hidden');
      container.classList.add('hidden');
      loading.classList.remove('hidden');

      const url = new URL(window.location);
      url.searchParams.set('subjectId', subjectId);
      window.history.replaceState({}, '', url);
      localStorage.setItem(BOARDSBUDDY_CONFIG.STORAGE_KEYS.SELECTED_SUBJECT, subjectId);

      const [chapters, questions] = await Promise.all([
        DbService.getChapters(subjectId),
        DbService.getResources({ type: 'chapterwise_pyq', subjectId: subjectId })
      ]);

      loading.classList.add('hidden');
      container.classList.remove('hidden');

      if (!chapters || chapters.length === 0) {
        container.innerHTML = `<div class="text-center text-muted" style="padding: 3rem;">No chapters found.</div>`;
        return;
      }

      container.innerHTML = chapters.map(ch => {
        const chQuestions = questions.filter(q => q.chapter_id === ch.id);

        return `
          <div style="margin-bottom: 2.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 2px solid var(--border-subtle); padding-bottom: 0.5rem;">
              <h2 style="font-size: 1.3rem; display: flex; align-items: center; gap: 0.65rem;">
                <span class="chapter-number-badge">Ch ${ch.chapter_number}</span>
                <span>${ch.title}</span>
              </h2>
              <span class="badge badge-secondary">${chQuestions.length} PYQ${chQuestions.length === 1 ? '' : 's'}</span>
            </div>

            ${chQuestions.length === 0 ? `
              <div style="padding: 1.5rem; background: var(--bg-surface); border: 1px dashed var(--border-default); border-radius: var(--radius-md); text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                No PYQs added for this chapter yet. You can add them via the Admin Panel.
              </div>
            ` : `
              <div class="questions-list">
                ${chQuestions.map((q, qIndex) => {
                  const pdfUrl = (q.file_url && typeof q.file_url === 'string' && q.file_url.trim() && q.file_url.trim() !== 'null' && q.file_url.trim() !== 'undefined')
                    ? q.file_url.trim()
                    : ((q.external_url && typeof q.external_url === 'string' && q.external_url.trim() && q.external_url.trim() !== 'null' && q.external_url.trim() !== 'undefined') ? q.external_url.trim() : null);
                  const hasPdf = Boolean(pdfUrl);
                  const viewerUrl = `viewer.html?resourceId=${encodeURIComponent(q.id)}&type=chapterwise_pyq&subjectId=${encodeURIComponent(subjectId)}&chapterId=${encodeURIComponent(ch.id)}`;

                  return `
                  <div class="question-item" id="q-${q.id}">
                    <div class="question-header">
                      <div style="flex: 1;">
                        <div class="question-meta">
                          <span class="badge badge-warning">SSC ${q.year || 'Board'}</span>
                          <span class="badge badge-primary">${q.marks ? q.marks + ' Marks' : 'Question'}</span>
                          ${q.topic ? `<span class="badge badge-secondary">${q.topic}</span>` : ''}
                        </div>
                        <div class="question-title">
                          Q${qIndex + 1}. ${q.title}
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end;">
                        ${hasPdf ? `
                          <a href="${viewerUrl}" class="btn btn-sm btn-outline full-viewer-btn" title="Open in dedicated viewer with chapter sidebar" onclick="event.stopPropagation()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                            <span>Full Viewer</span>
                          </a>
                        ` : ''}
                        <button class="btn btn-sm btn-ghost toggle-q-btn">
                          <span>Show Details</span>
                          <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                        </button>
                      </div>
                    </div>
                    <div class="question-body">
                      ${q.description ? `<p style="margin-bottom: 0.75rem; color: var(--text-secondary);">${q.description}</p>` : ''}
                      ${q.content_text ? `
                        <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 0.75rem;">
                          ${UI.formatContent(q.content_text)}
                        </div>
                      ` : ''}
                      <div style="display: flex; gap: 0.75rem; margin-top: 0.75rem; flex-wrap: wrap;">
                        <a href="pyq-solutions.html?subjectId=${subjectId}#sol-${q.id}" class="btn btn-sm btn-secondary">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                          <span>View Step-by-Step Solution</span>
                        </a>
                      </div>
                    </div>
                  </div>
                `}).join('')}
              </div>
            `}
          </div>
        `;
      }).join('');

      // Accordion Toggle
      container.querySelectorAll('.question-header').forEach(header => {
        header.addEventListener('click', (e) => {
          if (e.target.closest('a')) return;
          const item = header.closest('.question-item');
          const isOpen = item.classList.toggle('open');
          const btnSpan = item.querySelector('.toggle-q-btn span');
          if (btnSpan) btnSpan.textContent = isOpen ? 'Hide Details' : 'Show Details';
        });
      });
    }

    dropdown.addEventListener('change', (e) => selectSubject(e.target.value));

    const urlParams = new URLSearchParams(window.location.search);
    const urlSubject = urlParams.get('subjectId') || urlParams.get('subject');
    let initialSubject = null;
    if (urlSubject) {
      initialSubject = subjects.find(s => s.id === urlSubject || s.code === urlSubject);
    }

    if (initialSubject) {
      selectSubject(initialSubject.id);
    } else {
      dropdown.value = '';
      promptBox.classList.remove('hidden');
      container.classList.add('hidden');
    }

  } catch (err) {
    console.error('Error loading chapterwise PYQs:', err);
    loading.innerHTML = `<div class="form-error">Error: ${err.message}</div>`;
  }
});
