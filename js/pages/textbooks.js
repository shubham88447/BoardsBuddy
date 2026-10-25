/**
 * BoardsBuddy - Textbooks Page Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  UI.renderStudyNav('textbooks');

  const container = document.getElementById('textbooks-container');
  const loading = document.getElementById('textbooks-loading');

  try {
    const [subjects, resources] = await Promise.all([
      DbService.getSubjects(),
      DbService.getResources({ type: 'textbook' })
    ]);

    loading.classList.add('hidden');
    container.classList.remove('hidden');

    if (!resources || resources.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
          <p class="text-muted">No published textbooks found. Please check back soon or add one via the Admin Panel.</p>
        </div>
      `;
      return;
    }

    // Palette gradients for mock book covers
    const gradients = [
      'linear-gradient(135deg, #4338ca, #6366f1)',
      'linear-gradient(135deg, #0e7490, #06b6d4)',
      'linear-gradient(135deg, #1d4ed8, #3b82f6)',
      'linear-gradient(135deg, #047857, #10b981)'
    ];

    container.innerHTML = resources.map((tb, idx) => {
      const subject = subjects.find(s => s.id === tb.subject_id) || { name: 'Subject', code: 'SSC' };
      const coverGradient = gradients[idx % gradients.length];
      const viewerUrl = `viewer.html?resourceId=${tb.id}&type=textbook`;

      return `
        <div class="textbook-card">
          <div class="textbook-cover-wrapper">
            <div class="textbook-mock-book" style="background: ${coverGradient};">
              <div style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; opacity: 0.9;">
                Balbharati SSC
              </div>
              <div style="font-size: 1rem; font-weight: 800; line-height: 1.25;">
                ${subject.name}
              </div>
              <div style="font-size: 0.75rem; opacity: 0.85; font-weight: 600;">
                Class 10
              </div>
            </div>
          </div>
          <div class="textbook-card-body">
            <div style="margin-bottom: 0.5rem;">
              <span class="badge badge-primary">Class 10</span>
            </div>
            <h3>${tb.title}</h3>
            <p>${tb.description || 'Complete official textbook for Maharashtra State Board examinations.'}</p>
            <div style="display: flex; gap: 0.5rem; margin-top: auto;">
              <a href="${viewerUrl}" class="btn btn-primary" style="flex: 1;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                <span>Open Textbook</span>
              </a>
              ${tb.file_url ? `
                <a href="${tb.file_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-icon-only" title="Open Source / Download PDF">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading textbooks:', err);
    loading.innerHTML = `<div class="form-error">Failed to load textbooks: ${err.message}</div>`;
  }
});
