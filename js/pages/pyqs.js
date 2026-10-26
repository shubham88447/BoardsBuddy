/**
 * BoardsBuddy - PYQs (Previous-Year Papers) Page Controller
 * Manages Year-Wise Complete Question Papers (Wireframe 7)
 */

document.addEventListener('DOMContentLoaded', async () => {
  UI.renderStudyNav('pyqs');

  const subjectFilter = document.getElementById('pyqs-subject-filter');
  const yearFilter = document.getElementById('pyqs-year-filter');
  const loading = document.getElementById('pyqs-loading');
  const container = document.getElementById('pyqs-container');
  const countBadge = document.getElementById('pyq-count-badge');

  try {
    const subjects = await DbService.getSubjects();

    subjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      subjectFilter.appendChild(opt);
    });

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('subjectId')) subjectFilter.value = urlParams.get('subjectId');
    if (urlParams.get('year')) yearFilter.value = urlParams.get('year');

    async function loadPapers() {
      container.classList.add('hidden');
      loading.classList.remove('hidden');

      const subjectId = subjectFilter.value || null;
      const year = yearFilter.value || null;

      const papers = await DbService.getResources({
        type: 'pyq',
        subjectId: subjectId,
        year: year
      });

      loading.classList.add('hidden');
      container.classList.remove('hidden');

      countBadge.textContent = `Showing ${papers.length} question paper${papers.length === 1 ? '' : 's'}`;

      if (!papers || papers.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <p class="text-muted">No question papers found matching your filters. Try selecting another year or subject.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = papers.map(paper => {
        const subject = subjects.find(s => s.id === paper.subject_id) || { name: 'Subject' };
        const viewerUrl = `viewer.html?resourceId=${paper.id}&type=pyq`;

        return `
          <div class="pyq-paper-card">
            <div class="pyq-paper-header">
              <span class="year-pill">SSC Exam ${paper.year || 'Board'}</span>
              <span class="badge badge-primary">Marks: ${paper.marks || 40}</span>
            </div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--primary-600); margin-bottom: 0.35rem;">
              ${subject.name}
            </div>
            <h3>${paper.title}</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; flex: 1;">
              ${paper.description || 'Complete official board paper with all sections Q.1 to Q.5.'}
            </p>
            <div class="pyq-actions">
              <a href="${viewerUrl}" class="btn btn-primary" style="flex: 1;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>Open Paper</span>
              </a>
              ${paper.file_url ? `
                <a href="${paper.file_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-icon-only" title="Download PDF">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    subjectFilter.addEventListener('change', loadPapers);
    yearFilter.addEventListener('change', loadPapers);

    loadPapers();

  } catch (err) {
    console.error('Error loading PYQs:', err);
    loading.innerHTML = `<div class="form-error">Error: ${err.message}</div>`;
  }
});
