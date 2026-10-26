
/**
 * BoardsBuddy - Study Content Viewer Controller
 * Custom PDF.js viewer without native Print/Download toolbar buttons.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  let resourceId = urlParams.get('resourceId');
  let subjectId = urlParams.get('subjectId');
  let chapterId = urlParams.get('chapterId');
  let contentType = urlParams.get('type') || 'notes';

  // Elements
  const sidebar = document.getElementById('viewer-sidebar');
  const sidebarTitle = document.getElementById('sidebar-subject-title');
  const sidebarChaptersList = document.getElementById('sidebar-chapters-list');
  const subjectBadge = document.getElementById('viewer-subject-badge');

  const crumbSubject = document.getElementById('crumb-subject');
  const crumbChapter = document.getElementById('crumb-chapter');
  const crumbType = document.getElementById('crumb-type');

  const resourceTitle = document.getElementById('resource-title');
  const resourceDesc = document.getElementById('resource-description');
  const typeBadge = document.getElementById('resource-type-badge');
  const yearBadge = document.getElementById('resource-year-badge');
  const formattedContentArea = document.getElementById('formatted-content-area');

  const pdfSection = document.getElementById('pdf-viewer-section');
  const pdfCanvas = document.getElementById('pdf-canvas');
  const pdfContainer = document.getElementById('pdf-canvas-container');
  const pdfError = document.getElementById('pdf-error');

  let pdfDocument = null;
  let pdfPageNumber = 1;
  let pdfScale = 1;
  let pdfRenderTask = null;
  let pdfLoadTask = null;
  let pdfRenderId = 0;
  let pdfResizeTimer;

  const prevBtn = document.getElementById('prev-chapter-btn');
  const nextBtn = document.getElementById('next-chapter-btn');
  const prevLabel = document.getElementById('prev-chapter-label');
  const nextLabel = document.getElementById('next-chapter-label');

  const bookmarkBtn = document.getElementById('bookmark-btn');
  const bookmarkLabel = document.getElementById('bookmark-label');
  const completedBtn = document.getElementById('mark-completed-btn');
  const completedLabel = document.getElementById('completed-label');

  // PDF.js page rendering
  async function renderPdfPage() {
    if (!pdfDocument || !pdfCanvas) return;

    const renderId = ++pdfRenderId;

    if (pdfRenderTask) {
      try {
        pdfRenderTask.cancel();
      } catch (_) {
        // Previous rendering may already have finished.
      }
      pdfRenderTask = null;
    }

    try {
      const page = await pdfDocument.getPage(pdfPageNumber);

      if (renderId !== pdfRenderId) return;

      const viewport = page.getViewport({ scale: pdfScale });
      const context = pdfCanvas.getContext('2d');
      const outputScale = window.devicePixelRatio || 1;

      pdfCanvas.width = Math.floor(viewport.width * outputScale);
      pdfCanvas.height = Math.floor(viewport.height * outputScale);
      pdfCanvas.style.width = `${viewport.width}px`;
      pdfCanvas.style.height = `${viewport.height}px`;

      pdfRenderTask = page.render({
        canvasContext: context,
        viewport,
        transform: outputScale !== 1
          ? [outputScale, 0, 0, outputScale, 0, 0]
          : null
      });

      await pdfRenderTask.promise;

      if (renderId !== pdfRenderId) return;

      const currentPageLabel = document.getElementById('pdf-current-page');
      const totalPagesLabel = document.getElementById('pdf-total-pages');
      const zoomLabel = document.getElementById('pdf-zoom-level');
      const prevPageBtn = document.getElementById('pdf-prev-page');
      const nextPageBtn = document.getElementById('pdf-next-page');
      const floatPrevBtn = document.getElementById('pdf-float-prev');
      const floatNextBtn = document.getElementById('pdf-float-next');

      if (currentPageLabel) {
        currentPageLabel.textContent = String(pdfPageNumber);
      }

      if (totalPagesLabel) {
        totalPagesLabel.textContent = String(pdfDocument.numPages);
      }

      if (zoomLabel) {
        zoomLabel.textContent = `${Math.round(pdfScale * 100)}%`;
      }

      if (prevPageBtn) {
        prevPageBtn.disabled = pdfPageNumber <= 1;
      }

      if (nextPageBtn) {
        nextPageBtn.disabled = pdfPageNumber >= pdfDocument.numPages;
      }

      if (floatPrevBtn) {
        floatPrevBtn.disabled = pdfPageNumber <= 1;
      }

      if (floatNextBtn) {
        floatNextBtn.disabled = pdfPageNumber >= pdfDocument.numPages;
      }

      pdfError?.classList.add('hidden');
    } catch (error) {
      if (error?.name !== 'RenderingCancelledException') {
        console.error('PDF rendering error:', error);

        if (pdfError) {
          pdfError.textContent =
            'Could not render this PDF page. Please refresh and try again.';
          pdfError.classList.remove('hidden');
        }
      }
    } finally {
      pdfRenderTask = null;
    }
  }

  // Transient visual feedback when flipping pages
  let pageFeedbackTimer = null;
  function showPageTurnFeedback(direction) {
    const pill = document.getElementById('pdf-page-turn-pill');
    if (!pill || !pdfDocument) return;

    clearTimeout(pageFeedbackTimer);

    let msg = `Page ${pdfPageNumber} of ${pdfDocument.numPages}`;
    let icon = '';

    if (direction === 'next') {
      icon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>';
      pill.innerHTML = `<span>${msg}</span> ${icon}`;
    } else if (direction === 'prev') {
      icon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>';
      pill.innerHTML = `${icon} <span>${msg}</span>`;
    } else if (direction === 'start') {
      pill.innerHTML = `<span>First Page (${pdfPageNumber}/${pdfDocument.numPages})</span>`;
    } else if (direction === 'end') {
      pill.innerHTML = `<span>Last Page (${pdfPageNumber}/${pdfDocument.numPages})</span>`;
    }

    pill.classList.remove('hidden');
    pill.style.opacity = '1';

    pageFeedbackTimer = setTimeout(() => {
      pill.style.opacity = '0';
      setTimeout(() => pill.classList.add('hidden'), 250);
    }, 800);
  }

  // Next and Previous Page Navigation Helpers
  async function goToNextPdfPage() {
    if (!pdfDocument) return;
    if (pdfPageNumber < pdfDocument.numPages) {
      pdfPageNumber++;
      await renderPdfPage();
      if (pdfContainer) pdfContainer.scrollTop = 0;
      showPageTurnFeedback('next');
    } else {
      showPageTurnFeedback('end');
    }
  }

  async function goToPrevPdfPage() {
    if (!pdfDocument) return;
    if (pdfPageNumber > 1) {
      pdfPageNumber--;
      await renderPdfPage();
      if (pdfContainer) pdfContainer.scrollTop = 0;
      showPageTurnFeedback('prev');
    } else {
      showPageTurnFeedback('start');
    }
  }

  // PDF Toolbar page navigation
  document.getElementById('pdf-prev-page')?.addEventListener('click', async () => {
    await goToPrevPdfPage();
  });

  document.getElementById('pdf-next-page')?.addEventListener('click', async () => {
    await goToNextPdfPage();
  });

  // Floating prev/next button navigation
  document.getElementById('pdf-float-prev')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    await goToPrevPdfPage();
  });

  document.getElementById('pdf-float-next')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    await goToNextPdfPage();
  });

  // Click on Left side of page (backward) or Right side of page (forward)
  let clickPointerStartX = 0;
  let clickPointerStartY = 0;

  if (pdfContainer) {
    pdfContainer.addEventListener('pointerdown', (e) => {
      clickPointerStartX = e.clientX;
      clickPointerStartY = e.clientY;
    });

    pdfContainer.addEventListener('click', async (e) => {
      // Don't trigger if clicked on buttons, toolbar, or links
      if (e.target.closest('.pdf-float-nav') || e.target.closest('.pdf-toolbar') || e.target.closest('a') || e.target.closest('button')) {
        return;
      }

      // Ignore drag/selection gestures
      const moveDistance = Math.hypot(e.clientX - clickPointerStartX, e.clientY - clickPointerStartY);
      if (moveDistance > 8) return;

      if (!pdfDocument) return;

      let isRightSide = false;
      if (pdfCanvas && (e.target === pdfCanvas || pdfCanvas.contains(e.target))) {
        const rect = pdfCanvas.getBoundingClientRect();
        isRightSide = (e.clientX - rect.left) > (rect.width / 2);
      } else {
        const rect = pdfContainer.getBoundingClientRect();
        isRightSide = (e.clientX - rect.left) > (rect.width / 2);
      }

      if (isRightSide) {
        await goToNextPdfPage();
      } else {
        await goToPrevPdfPage();
      }
    });

    // Dynamic cursor feedback when moving across canvas
    if (pdfCanvas) {
      pdfCanvas.addEventListener('mousemove', (e) => {
        const rect = pdfCanvas.getBoundingClientRect();
        const isRightSide = (e.clientX - rect.left) > (rect.width / 2);
        if (isRightSide) {
          pdfCanvas.style.cursor = 'e-resize';
          pdfCanvas.title = 'Click right side to go forward (→)';
        } else {
          pdfCanvas.style.cursor = 'w-resize';
          pdfCanvas.title = 'Click left side to go backward (←)';
        }
      });
    }

    pdfContainer.addEventListener('mousemove', (e) => {
      if (e.target === pdfCanvas || e.target.closest('.pdf-float-nav') || e.target.closest('.pdf-toolbar')) return;
      const rect = pdfContainer.getBoundingClientRect();
      const isRightSide = (e.clientX - rect.left) > (rect.width / 2);
      pdfContainer.style.cursor = isRightSide ? 'e-resize' : 'w-resize';
    });
  }

  // Keyboard Navigation: Arrow Keys & Page Keys
  window.addEventListener('keydown', async (e) => {
    // Skip if focus is in an input or contenteditable
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable)) {
      return;
    }

    const searchModal = document.getElementById('search-modal');
    if (searchModal && !searchModal.classList.contains('hidden')) {
      return;
    }

    if (!pdfDocument || !pdfSection || pdfSection.classList.contains('hidden')) {
      return;
    }

    // Forward Navigation: Right Arrow or PageDown
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      await goToNextPdfPage();
    }
    // Backward Navigation: Left Arrow or PageUp
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      await goToPrevPdfPage();
    }
    // First Page: Home
    else if (e.key === 'Home') {
      e.preventDefault();
      if (pdfPageNumber !== 1) {
        pdfPageNumber = 1;
        await renderPdfPage();
        if (pdfContainer) pdfContainer.scrollTop = 0;
        showPageTurnFeedback('start');
      }
    }
    // Last Page: End
    else if (e.key === 'End') {
      e.preventDefault();
      if (pdfPageNumber !== pdfDocument.numPages) {
        pdfPageNumber = pdfDocument.numPages;
        await renderPdfPage();
        if (pdfContainer) pdfContainer.scrollTop = 0;
        showPageTurnFeedback('end');
      }
    }
    // Toggle Full View Mode with 'f' or 'F'
    else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullViewMode();
    }
    // Exit Full View Mode with 'Escape'
    else if (e.key === 'Escape' && pdfSection?.classList.contains('full-view-mode')) {
      e.preventDefault();
      toggleFullViewMode(false);
    }
  });

  // Full view mode controls (for Textbooks, Notes & PYQs)
  const fullViewBtn = document.getElementById('pdf-full-view-btn');
  const fullViewText = document.getElementById('pdf-full-view-text');
  const fullViewEnterIcon = document.querySelector('.pdf-full-view-icon-enter');
  const fullViewExitIcon = document.querySelector('.pdf-full-view-icon-exit');

  async function toggleFullViewMode(forceState) {
    if (!pdfSection) return;

    const shouldEnter = typeof forceState === 'boolean'
      ? forceState
      : !pdfSection.classList.contains('full-view-mode');

    if (shouldEnter) {
      pdfSection.classList.add('full-view-mode');
      document.body.classList.add('pdf-full-view-active');
      fullViewEnterIcon?.classList.add('hidden');
      fullViewExitIcon?.classList.remove('hidden');
      if (fullViewText) fullViewText.textContent = 'Exit full view';
      if (fullViewBtn) fullViewBtn.title = 'Exit Full View (Esc or F)';
      UI.showToast('Full View mode active (Press Esc or F to exit)', 'info', 2200);
    } else {
      pdfSection.classList.remove('full-view-mode');
      document.body.classList.remove('pdf-full-view-active');
      fullViewEnterIcon?.classList.remove('hidden');
      fullViewExitIcon?.classList.add('hidden');
      if (fullViewText) fullViewText.textContent = 'Full view';
      if (fullViewBtn) fullViewBtn.title = 'Full view mode (F)';
    }

    // Auto recalculate fit-width for the full screen dimensions
    if (pdfDocument && pdfContainer) {
      setTimeout(async () => {
        try {
          const page = await pdfDocument.getPage(pdfPageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const availableWidth = Math.max(260, pdfContainer.clientWidth - 48);
          pdfScale = Math.max(0.5, Math.min(availableWidth / baseViewport.width, 3));
          await renderPdfPage();
        } catch (_) {}
      }, 60);
    }
  }

  fullViewBtn?.addEventListener('click', () => {
    toggleFullViewMode();
  });

  // PDF zoom controls
  document.getElementById('pdf-zoom-in')?.addEventListener('click', async () => {
    pdfScale = Math.min(pdfScale + 0.2, 3);
    await renderPdfPage();
  });

  document.getElementById('pdf-zoom-out')?.addEventListener('click', async () => {
    pdfScale = Math.max(pdfScale - 0.2, 0.5);
    await renderPdfPage();
  });

  document.getElementById('pdf-fit-width')?.addEventListener('click', async () => {
    if (!pdfDocument || !pdfContainer) return;

    try {
      const page = await pdfDocument.getPage(pdfPageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const availableWidth = Math.max(260, pdfContainer.clientWidth - 32);

      pdfScale = Math.max(
        0.5,
        Math.min(availableWidth / baseViewport.width, 3)
      );

      await renderPdfPage();
    } catch (error) {
      console.error('Could not fit PDF to width:', error);
    }
  });

  // Re-render when the viewport changes
  window.addEventListener('resize', () => {
    if (!pdfDocument) return;

    clearTimeout(pdfResizeTimer);
    pdfResizeTimer = setTimeout(() => renderPdfPage(), 150);
  });

  // Mobile sidebar
  document.getElementById('mobile-sidebar-toggle-btn')?.addEventListener('click', () => {
    sidebar?.classList.toggle('drawer-open');
  });

  document.getElementById('close-mobile-sidebar-btn')?.addEventListener('click', () => {
    sidebar?.classList.remove('drawer-open');
  });

  // Fullscreen
  const fullscreenBtn = document.getElementById('fullscreen-toggle-btn');

  fullscreenBtn?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(error => {
        UI.showToast('Fullscreen not supported: ' + error.message, 'warning');
      });
    } else {
      document.exitFullscreen();
    }
  });

  // Load PDF with PDF.js supporting Supabase Storage, authenticated private streams, and CORS fallbacks
  async function loadPdfDocument(resource) {
    const fileUrl = resource?.file_url || resource?.external_url;
    const bodyContainer = document.getElementById('viewer-body-container');

    if (!resource || !fileUrl || !pdfSection) {
      pdfSection?.classList.add('hidden');
      bodyContainer?.classList.remove('has-pdf');
      return;
    }

    pdfSection.classList.remove('hidden');
    bodyContainer?.classList.add('has-pdf');
    pdfError?.classList.add('hidden');

    // Remove any previous CORS fallback notice
    const existingFallback = document.getElementById('pdf-cors-fallback-box');
    if (existingFallback) existingFallback.remove();

    // Ensure toolbar and canvas container are visible
    const toolbar = pdfSection.querySelector('.pdf-toolbar');
    if (toolbar) toolbar.classList.remove('hidden');
    if (pdfContainer) pdfContainer.classList.remove('hidden');

    // Reset previous tasks
    if (pdfRenderTask) {
      try { pdfRenderTask.cancel(); } catch (_) {}
      pdfRenderTask = null;
    }
    if (pdfLoadTask) {
      try { pdfLoadTask.destroy(); } catch (_) {}
      pdfLoadTask = null;
    }
    pdfDocument = null;

    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF.js library is not available. Please verify your connection.');
      }

      const isExternal = window.StorageService?.isExternalUrl(fileUrl);
      const pdfSource = window.StorageService?.getPdfSource
        ? await window.StorageService.getPdfSource(fileUrl)
        : { type: 'url', url: fileUrl, isExternal };

      let docInitParams;
      if (pdfSource.type === 'data') {
        // Authenticated direct ArrayBuffer load: avoids all CORS and public URL restrictions
        docInitParams = { data: pdfSource.data };
      } else {
        docInitParams = { url: pdfSource.url };
      }

      pdfLoadTask = pdfjsLib.getDocument(docInitParams);
      pdfDocument = await pdfLoadTask.promise;
      pdfPageNumber = 1;

      // Automatically calculate fit-width scale on initial load to extend to full page
      try {
        const firstPage = await pdfDocument.getPage(1);
        const baseViewport = firstPage.getViewport({ scale: 1 });
        const availableWidth = Math.max(260, (pdfContainer?.clientWidth || window.innerWidth - 320) - 32);
        pdfScale = Math.max(0.6, Math.min(availableWidth / baseViewport.width, 2.5));
      } catch (_) {
        pdfScale = 1.35;
      }

      const totalPagesLabel = document.getElementById('pdf-total-pages');
      if (totalPagesLabel) {
        totalPagesLabel.textContent = String(pdfDocument.numPages);
      }

      await renderPdfPage();

    } catch (error) {
      console.error('PDF loading error:', error);
      pdfDocument = null;

      const isExternal = window.StorageService?.isExternalUrl(fileUrl);
      const isCorsError = isExternal ||
        (error?.message && /cross-origin|cors|network|access-control|fetch/i.test(error.message)) ||
        (error?.name === 'MissingPDFException') ||
        (error?.name === 'UnexpectedResponseException');

      if (isCorsError && isExternal) {
        await renderCorsErrorState(resource);
      } else {
        if (pdfError) {
          pdfError.textContent =
            `Unable to load PDF: ${error.message || 'Check storage permissions and file accessibility.'}`;
          pdfError.classList.remove('hidden');
        }
      }
    }
  }

  // Render informative CORS fallback card when external server blocks in-browser fetches
  async function renderCorsErrorState(resource) {
    if (!pdfSection) return;

    // Hide canvas and toolbar so user gets clear options
    const toolbar = pdfSection.querySelector('.pdf-toolbar');
    if (toolbar) toolbar.classList.add('hidden');
    if (pdfContainer) pdfContainer.classList.add('hidden');
    if (pdfError) pdfError.classList.add('hidden');

    const prev = document.getElementById('pdf-cors-fallback-box');
    if (prev) prev.remove();

    const isAdmin = await AuthService.checkIsAdmin();
    const fallbackFileUrl = resource.file_url || resource.external_url;
    let hostname = 'cart.ebalbharati.in';
    try {
      hostname = new URL(fallbackFileUrl).hostname;
    } catch (_) {}

    const fallbackDiv = document.createElement('div');
    fallbackDiv.id = 'pdf-cors-fallback-box';
    fallbackDiv.className = 'pdf-cors-fallback';
    fallbackDiv.innerHTML = `
      <div class="pdf-cors-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h3 class="pdf-cors-title">External PDF Access Restricted</h3>
      <div class="pdf-cors-desc">
        <p>This textbook is hosted on an external server (<code>${hostname}</code>) that does not provide <code>Access-Control-Allow-Origin</code> headers. Web browsers block client-side JavaScript from fetching external documents cross-origin for security.</p>
        <p style="margin-top: 0.5rem; color: var(--text-muted); font-size: 0.85rem;">You can open the original textbook in a new tab or download it directly to your device:</p>
      </div>

      <div class="pdf-cors-actions">
        <a href="${fallbackFileUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          <span>Open Official Textbook in New Tab</span>
        </a>
        <a href="${fallbackFileUrl}" download target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Download PDF</span>
        </a>
      </div>

      ${isAdmin ? `
        <div class="pdf-cors-admin-box">
          <h4>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Administrator Action: Upload to Supabase Storage</span>
          </h4>
          <p>
            Upload the official textbook PDF to our Supabase <code>study-materials</code> bucket. Once saved, the custom in-browser PDF.js reader will render it smoothly for all students without CORS restrictions.
          </p>
          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <input type="file" id="viewer-admin-file-input" accept="application/pdf" style="display: none;">
            <button id="viewer-admin-upload-btn" class="btn btn-sm btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Upload PDF to Supabase Storage</span>
            </button>
            <span id="viewer-upload-status" style="font-size: 0.8rem; color: var(--text-muted);"></span>
          </div>
        </div>
      ` : ''}
    `;

    pdfSection.appendChild(fallbackDiv);

    if (isAdmin) {
      const fileInput = document.getElementById('viewer-admin-file-input');
      const uploadBtn = document.getElementById('viewer-admin-upload-btn');
      const statusSpan = document.getElementById('viewer-upload-status');

      uploadBtn?.addEventListener('click', () => {
        fileInput?.click();
      });

      fileInput?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
          StorageService.validateFile(file);
        } catch (vErr) {
          UI.showToast(vErr.message, 'error');
          return;
        }

        if (uploadBtn) uploadBtn.disabled = true;
        if (statusSpan) statusSpan.textContent = `Uploading ${file.name} to Supabase Storage...`;
        UI.showToast(`Uploading ${file.name} to study-materials bucket...`, 'info');

        try {
          const uploaded = await StorageService.uploadAndSaveResource(file, resource.id, 'study-materials', 'textbooks');
          resource.file_url = uploaded.fullUrl;
          UI.showToast('Textbook uploaded to Supabase Storage and saved! Loading in viewer...', 'success');

          const downloadBtn = document.getElementById('download-resource-btn');
          if (downloadBtn) {
            downloadBtn.href = uploaded.fullUrl;
            downloadBtn.classList.remove('hidden');
          }

          // Re-load into custom PDF.js viewer
          await loadPdfDocument(resource);
        } catch (uErr) {
          console.error('Failed to upload textbook to storage:', uErr);
          UI.showToast(`Upload failed: ${uErr.message}`, 'error');
          if (uploadBtn) uploadBtn.disabled = false;
          if (statusSpan) statusSpan.textContent = 'Upload failed.';
        }
      });
    }
  }

  try {
    let currentResource = null;

    if (resourceId) {
      currentResource = await DbService.getResourceById(resourceId);

      if (currentResource) {
        subjectId = currentResource.subject_id;
        chapterId = currentResource.chapter_id;
        contentType = currentResource.type;
      }
    }

    // Default subject
    if (!subjectId) {
      const subjects = await DbService.getSubjects();
      subjectId = subjects[0]?.id;
    }

    const currentSubject = await DbService.getSubjectById(subjectId);
    const subjectChapters = await DbService.getChapters(subjectId);

    const isPyq = contentType === 'pyq' || currentResource?.type === 'pyq';

    if (!chapterId && subjectChapters.length > 0 && !isPyq) {
      chapterId = subjectChapters[0].id;
    }

    const currentChapter = isPyq
      ? null
      : (subjectChapters.find(chapter => chapter.id === chapterId) || subjectChapters[0]);

    // Load resource for the selected chapter and type
    if (!currentResource) {
      if (isPyq) {
        const matchingResources = await DbService.getResources({
          type: 'pyq',
          subjectId
        });
        currentResource = matchingResources[0] || null;
      } else if (currentChapter) {
        const matchingResources = await DbService.getResources({
          type: contentType,
          subjectId,
          chapterId: currentChapter.id
        });
        currentResource = matchingResources[0] || null;
      }
    }

    // Header and breadcrumbs
    if (subjectBadge) {
      subjectBadge.textContent = currentSubject?.name || 'Class 10';
    }

    if (sidebarTitle) {
      sidebarTitle.textContent = currentSubject?.name || 'Chapters';
    }

    if (crumbSubject) {
      crumbSubject.textContent = currentSubject?.name || 'Subject';
    }

    const viewerRoot = document.getElementById('viewer-root');
    const mobileSidebarBtn = document.getElementById('mobile-sidebar-toggle-btn');
    const crumbChapterSep = document.getElementById('crumb-chapter-sep');

    // 1. Remove chapter list from PYQ tab (PYQs cover whole syllabus, not individual chapters)
    if (isPyq) {
      if (viewerRoot) viewerRoot.classList.add('no-sidebar');
      if (sidebar) sidebar.style.display = 'none';
      if (mobileSidebarBtn) mobileSidebarBtn.style.display = 'none';

      if (crumbChapter) crumbChapter.style.display = 'none';
      if (crumbChapterSep) crumbChapterSep.style.display = 'none';
      if (crumbType) crumbType.textContent = 'PYQ';
      if (completedBtn) completedBtn.style.display = 'none';
    } else {
      if (viewerRoot) viewerRoot.classList.remove('no-sidebar');
      if (sidebar) sidebar.style.display = '';
      if (mobileSidebarBtn) mobileSidebarBtn.style.display = '';

      if (crumbChapter) {
        crumbChapter.style.display = '';
        crumbChapter.textContent = currentChapter
          ? `Ch ${currentChapter.chapter_number}: ${currentChapter.title}`
          : 'General';
      }
      if (crumbChapterSep) crumbChapterSep.style.display = '';
      if (crumbType) {
        crumbType.textContent = contentType.toUpperCase().replaceAll('_', ' ');
      }
      if (completedBtn) completedBtn.style.display = '';
    }

    // Student progress
    const currentUser = await AuthService.getCurrentUser();
    let studentProgress = [];

    if (currentUser) {
      studentProgress = await DbService.getStudentProgress(currentUser.id);
    }

    // Chapter sidebar (rendered only when NOT viewing full PYQs)
    if (sidebarChaptersList) {
      if (isPyq) {
        sidebarChaptersList.innerHTML = '';
      } else {
        sidebarChaptersList.innerHTML = subjectChapters.map(chapter => {
          const isCompleted = studentProgress.some(
            progress =>
              progress.chapter_id === chapter.id &&
              progress.status === 'completed'
          );

          const isActive = currentChapter && chapter.id === currentChapter.id;
          const chapterUrl =
            `viewer.html?subjectId=${subjectId}&chapterId=${chapter.id}&type=${contentType}`;

          return `
            <a href="${chapterUrl}" class="sidebar-chapter-item ${isActive ? 'active' : ''}">
              <span style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;font-size:.75rem;font-weight:700;background:${isActive ? 'var(--primary-600)' : 'var(--bg-surface-muted)'};color:${isActive ? '#fff' : 'var(--text-secondary)'};">
                ${isCompleted ? '✓' : chapter.chapter_number}
              </span>
              <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                ${chapter.title}
              </span>
            </a>
          `;
        }).join('');
      }
    }

    // Content area
    if (typeBadge) {
      typeBadge.textContent = contentType.toUpperCase().replaceAll('_', ' ');
    }

    // Update exit viewer button destination
    const exitBtn = document.getElementById('exit-viewer-btn');
    if (exitBtn) {
      const exitRoutes = {
        textbook: 'textbooks.html',
        notes: 'notes.html',
        short_notes: 'short-notes.html',
        pyq: 'pyqs.html',
        chapterwise_pyq: 'chapterwise-pyqs.html',
        pyq_solution: 'pyq-solutions.html'
      };
      const targetPage = exitRoutes[contentType] || 'chapterwise-pyqs.html';
      exitBtn.href = subjectId ? `${targetPage}?subjectId=${encodeURIComponent(subjectId)}` : targetPage;
      exitBtn.title = `Back to ${contentType.toUpperCase().replaceAll('_', ' ')}`;
    }

    if (currentResource) {
      resourceTitle.textContent = currentResource.title || 'Study Resource';
      resourceDesc.textContent = currentResource.description || '';

      if (yearBadge) {
        const badges = [];
        if (currentResource.year) badges.push(`SSC ${currentResource.year}`);
        if (currentResource.marks) badges.push(`${currentResource.marks} Marks`);
        yearBadge.textContent = badges.length > 0 ? badges.join(' • ') : 'Class 10 SSC';
      }

      const formattedText = currentResource.content_text || currentResource.description;
      if (formattedText) {
        formattedContentArea.classList.remove('hidden');
        formattedContentArea.innerHTML =
          UI.formatContent(formattedText);
      } else {
        formattedContentArea.classList.add('hidden');
      }

      // Setup Download button in header
      const downloadBtn = document.getElementById('download-resource-btn');
      const activeFileUrl = currentResource.file_url || currentResource.external_url;
      if (downloadBtn && activeFileUrl && currentResource.allow_download !== false) {
        downloadBtn.classList.remove('hidden');
        downloadBtn.href = activeFileUrl;
        downloadBtn.setAttribute('download', `${currentResource.title || 'study-material'}.pdf`);
        downloadBtn.target = '_blank';
        downloadBtn.rel = 'noopener noreferrer';
      } else if (downloadBtn) {
        downloadBtn.classList.add('hidden');
      }

      // Load PDF with PDF.js (handles Supabase Storage, private access, and external CORS fallbacks)
      await loadPdfDocument(currentResource);
    } else if (currentChapter) {
      // Empty / Coming Soon state
      resourceTitle.textContent =
        `${currentChapter.title} — ${contentType.toUpperCase().replaceAll('_', ' ')}`;

      resourceDesc.textContent = currentChapter.description || '';
      formattedContentArea.classList.remove('hidden');

      formattedContentArea.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;">
          <div style="font-size:2.5rem;margin-bottom:1rem;">📚</div>
          <h2 style="font-size:1.4rem;margin-bottom:.5rem;">
            Study Materials Coming Soon
          </h2>
          <p class="text-muted" style="max-width:500px;margin:0 auto 1.5rem;">
            Our subject experts are reviewing the latest verified notes and
            PYQ solutions for Chapter ${currentChapter.chapter_number}
            (${currentChapter.title}).
          </p>
          <a href="textbooks.html" class="btn btn-primary">
            <span>Read Textbook for Chapter ${currentChapter.chapter_number}</span>
          </a>
        </div>
      `;

      pdfSection?.classList.add('hidden');
    }

    // Previous chapter
    const currentIndex = subjectChapters.findIndex(
      chapter => chapter.id === currentChapter?.id
    );

    if (currentIndex > 0) {
      const previousChapter = subjectChapters[currentIndex - 1];

      if (prevLabel) {
        prevLabel.textContent =
          `Ch ${previousChapter.chapter_number}: ${previousChapter.title}`;
      }

      if (prevBtn) {
        prevBtn.onclick = () => {
          window.location.href =
            `viewer.html?subjectId=${subjectId}&chapterId=${previousChapter.id}&type=${contentType}`;
        };
        prevBtn.disabled = false;
      }
    } else {
      if (prevLabel) prevLabel.textContent = 'First Chapter';
      if (prevBtn) prevBtn.disabled = true;
    }

    // Next chapter
    if (currentIndex >= 0 && currentIndex < subjectChapters.length - 1) {
      const nextChapter = subjectChapters[currentIndex + 1];

      if (nextLabel) {
        nextLabel.textContent =
          `Ch ${nextChapter.chapter_number}: ${nextChapter.title}`;
      }

      if (nextBtn) {
        nextBtn.onclick = () => {
          window.location.href =
            `viewer.html?subjectId=${subjectId}&chapterId=${nextChapter.id}&type=${contentType}`;
        };
        nextBtn.disabled = false;
      }
    } else {
      if (nextLabel) nextLabel.textContent = 'Completed Subject!';
      if (nextBtn) nextBtn.disabled = true;
    }

    // Bookmark toggle
    if (currentUser && currentResource && bookmarkBtn) {
      const bookmarks = await DbService.getBookmarks(currentUser.id);
      const isBookmarked = bookmarks.some(
        bookmark => bookmark.resource_id === currentResource.id
      );

      if (bookmarkLabel) {
        bookmarkLabel.textContent = isBookmarked ? 'Bookmarked' : 'Bookmark';
      }

      if (isBookmarked) bookmarkBtn.classList.add('btn-primary');

      bookmarkBtn.onclick = async () => {
        const added = await DbService.toggleBookmark(
          currentUser.id,
          currentResource.id
        );

        if (bookmarkLabel) {
          bookmarkLabel.textContent = added ? 'Bookmarked' : 'Bookmark';
        }

        bookmarkBtn.classList.toggle('btn-primary', added);

        UI.showToast(
          added ? 'Added to your bookmarks!' : 'Removed from bookmarks',
          'info'
        );
      };
    } else if (bookmarkBtn) {
      bookmarkBtn.onclick = () => {
        UI.showToast(
          'Log in to bookmark study materials to your account',
          'info'
        );
      };
    }

    // Mark chapter completed
    if (currentUser && currentChapter && completedBtn) {
      const isDone = studentProgress.some(
        progress =>
          progress.chapter_id === currentChapter.id &&
          progress.status === 'completed'
      );

      if (completedLabel) {
        completedLabel.textContent = isDone ? 'Completed ✓' : 'Mark as Done';
      }

      if (isDone) completedBtn.classList.add('btn-primary');

      completedBtn.onclick = async () => {
        const newStatus = await DbService.toggleChapterProgress(
          currentUser.id,
          currentChapter.id
        );

        const done = newStatus === 'completed';

        if (completedLabel) {
          completedLabel.textContent = done ? 'Completed ✓' : 'Mark as Done';
        }

        completedBtn.classList.toggle('btn-primary', done);

        UI.showToast(
          done
            ? 'Great job! Chapter marked as completed.'
            : 'Chapter marked in progress.',
          'success'
        );
      };
    } else if (completedBtn) {
      completedBtn.onclick = () => {
        UI.showToast(
          'Log in to track your study progress across chapters',
          'info'
        );
      };
    }
  } catch (error) {
    console.error('Failed to load study content in viewer:', error);

    if (resourceTitle) {
      resourceTitle.textContent = 'Error Loading Material';
    }

    if (formattedContentArea) {
      formattedContentArea.innerHTML =
        `<div class="form-error">Could not display study content: ${error.message}</div>`;
    }
  }
});
