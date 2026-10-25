/**
 * BoardsBuddy - Chapterwise PYQs Page Controller
 * Groups Previous-Year Questions by Chapter & Marks (Wireframe 8)
 */

document.addEventListener('DOMContentLoaded', async () => {
  UI.renderStudyNav('chapterwise-pyqs');

  const dropdown = document.getElementById('ch-pyqs-subject-dropdown');
  const pillsContainer = document.getElementById('ch-pyqs-pills-container');
  const loading = document.getElementById('ch-pyqs-loading');
  const container = document.getElementById('ch-pyqs-container');

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
                ${chQuestions.map((q, qIndex) => `
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
                      <button class="btn btn-sm btn-outline toggle-q-btn" style="flex-shrink: 0;">
                        <span>Show Details</span>
                      </button>
                    </div>
                    <div class="question-body">
                      <div style="margin-bottom: 1rem; line-height: 1.6;">
                        ${UI.formatContent(q.content_text || q.description || '')}
                      </div>
                      <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <a href="pyq-solutions.html?subjectId=${subjectId}&chapterId=${ch.id}" class="btn btn-sm btn-primary">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          <span>View Step-by-Step Solution</span>
                        </a>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        `;
      }).join('');

      // Accordion Toggle
      container.querySelectorAll('.question-header').forEach(header => {
        header.addEventListener('click', () => {
          const item = header.closest('.question-item');
          const isOpen = item.classList.toggle('open');
          const btnSpan = item.querySelector('.toggle-q-btn span');
          if (btnSpan) btnSpan.textContent = isOpen ? 'Hide Details' : 'Show Details';
        });
      });
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
    console.error('Error loading chapterwise PYQs:', err);
    loading.innerHTML = `<div class="form-error">Error: ${err.message}</div>`;
  }
});
