/**
 * BoardsBuddy - Study Content Viewer Controller (Wireframe 10)
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
  const pdfIframe = document.getElementById('pdf-iframe');
  const pdfFallbackLink = document.getElementById('pdf-fallback-link');
  const downloadBtn = document.getElementById('download-resource-btn');

  const prevBtn = document.getElementById('prev-chapter-btn');
  const nextBtn = document.getElementById('next-chapter-btn');
  const prevLabel = document.getElementById('prev-chapter-label');
  const nextLabel = document.getElementById('next-chapter-label');

  const bookmarkBtn = document.getElementById('bookmark-btn');
  const bookmarkLabel = document.getElementById('bookmark-label');
  const completedBtn = document.getElementById('mark-completed-btn');
  const completedLabel = document.getElementById('completed-label');

  // Mobile Drawer Toggle
  document.getElementById('mobile-sidebar-toggle-btn')?.addEventListener('click', () => {
    sidebar.classList.toggle('drawer-open');
  });
  document.getElementById('close-mobile-sidebar-btn')?.addEventListener('click', () => {
    sidebar.classList.remove('drawer-open');
  });

  // Fullscreen Toggle
  const fullscreenBtn = document.getElementById('fullscreen-toggle-btn');
  fullscreenBtn?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        UI.showToast('Fullscreen not supported: ' + err.message, 'warning');
      });
    } else {
      document.exitFullscreen();
    }
  });

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

    // Default subject if still missing
    if (!subjectId) {
      const subjects = await DbService.getSubjects();
      subjectId = subjects[0]?.id;
    }

    const currentSubject = await DbService.getSubjectById(subjectId);
    const subjectChapters = await DbService.getChapters(subjectId);

    // Default chapter if missing
    if (!chapterId && subjectChapters.length > 0) {
      chapterId = subjectChapters[0].id;
    }

    const currentChapter = subjectChapters.find(c => c.id === chapterId) || subjectChapters[0];

    // If resource wasn't loaded by ID, load the first published resource for this chapter & type
    if (!currentResource && currentChapter) {
      const matchingResources = await DbService.getResources({
        type: contentType,
        subjectId: subjectId,
        chapterId: currentChapter.id
      });
      currentResource = matchingResources[0] || null;
    }

    // Update Header and Breadcrumbs
    subjectBadge.textContent = currentSubject ? currentSubject.name : 'Class 10';
    sidebarTitle.textContent = currentSubject ? currentSubject.name : 'Chapters';

    crumbSubject.textContent = currentSubject ? currentSubject.name : 'Subject';
    crumbChapter.textContent = currentChapter ? `Ch ${currentChapter.chapter_number}: ${currentChapter.title}` : 'General';
    crumbType.textContent = contentType.toUpperCase().replace('_', ' ');

    // Render Sidebar Chapters List (Wireframe 10)
    const currentUser = await AuthService.getCurrentUser();
    let studentProgress = [];
    if (currentUser) {
      studentProgress = await DbService.getStudentProgress(currentUser.id);
    }

    sidebarChaptersList.innerHTML = subjectChapters.map(ch => {
      const isCompleted = studentProgress.some(p => p.chapter_id === ch.id && p.status === 'completed');
      const isActive = currentChapter && ch.id === currentChapter.id;
      const chUrl = `viewer.html?subjectId=${subjectId}&chapterId=${ch.id}&type=${contentType}`;

      return `
        <a href="${chUrl}" class="sidebar-chapter-item ${isActive ? 'active' : ''}">
          <span style="display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; font-size: 0.75rem; font-weight: 700; background: ${isActive ? 'var(--primary-600)' : 'var(--bg-surface-muted)'}; color: ${isActive ? '#fff' : 'var(--text-secondary)'};">
            ${isCompleted ? '✓' : ch.chapter_number}
          </span>
          <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${ch.title}
          </span>
        </a>
      `;
    }).join('');

    // Render Content Area
    typeBadge.textContent = contentType.toUpperCase().replace('_', ' ');

    if (currentResource) {
      resourceTitle.textContent = currentResource.title;
      resourceDesc.textContent = currentResource.description || '';
      yearBadge.textContent = currentResource.year ? `Exam Year ${currentResource.year}` : 'Class 10 SSC';

      // Check if text content exists
      if (currentResource.content_text) {
        formattedContentArea.classList.remove('hidden');
        formattedContentArea.innerHTML = UI.formatContent(currentResource.content_text);
      } else {
        formattedContentArea.classList.add('hidden');
      }

      // Check if PDF exists
      if (currentResource.file_url) {
        pdfSection.classList.remove('hidden');
        pdfIframe.src = currentResource.file_url;
        pdfFallbackLink.href = currentResource.file_url;
      } else {
        pdfSection.classList.add('hidden');
      }

      // Download Button
      if (currentResource.allow_download && currentResource.file_url) {
        downloadBtn.classList.remove('hidden');
        downloadBtn.href = currentResource.file_url;
      } else {
        downloadBtn.classList.add('hidden');
      }

    } else if (currentChapter) {
      // Empty / Coming Soon state for this chapter
      resourceTitle.textContent = `${currentChapter.title} — ${contentType.toUpperCase().replace('_', ' ')}`;
      resourceDesc.textContent = currentChapter.description || '';
      formattedContentArea.classList.remove('hidden');
      formattedContentArea.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">📚</div>
          <h2 style="font-size: 1.4rem; margin-bottom: 0.5rem;">Study Materials Coming Soon</h2>
          <p class="text-muted" style="max-width: 500px; margin: 0 auto 1.5rem;">
            Our subject experts are reviewing the latest verified notes and PYQ solutions for Chapter ${currentChapter.chapter_number} (${currentChapter.title}).
          </p>
          <a href="textbooks.html" class="btn btn-primary">
            <span>Read Textbook for Chapter ${currentChapter.chapter_number}</span>
          </a>
        </div>
      `;
      pdfSection.classList.add('hidden');
      downloadBtn.classList.add('hidden');
    }

    // Previous & Next Chapter Buttons
    const currentIdx = subjectChapters.findIndex(c => c.id === currentChapter?.id);
    if (currentIdx > 0) {
      const prevCh = subjectChapters[currentIdx - 1];
      prevLabel.textContent = `Ch ${prevCh.chapter_number}: ${prevCh.title}`;
      prevBtn.onclick = () => {
        window.location.href = `viewer.html?subjectId=${subjectId}&chapterId=${prevCh.id}&type=${contentType}`;
      };
      prevBtn.disabled = false;
    } else {
      prevLabel.textContent = 'First Chapter';
      prevBtn.disabled = true;
    }

    if (currentIdx < subjectChapters.length - 1) {
      const nextCh = subjectChapters[currentIdx + 1];
      nextLabel.textContent = `Ch ${nextCh.chapter_number}: ${nextCh.title}`;
      nextBtn.onclick = () => {
        window.location.href = `viewer.html?subjectId=${subjectId}&chapterId=${nextCh.id}&type=${contentType}`;
      };
      nextBtn.disabled = false;
    } else {
      nextLabel.textContent = 'Completed Subject!';
      nextBtn.disabled = true;
    }

    // Bookmark Toggle
    if (currentUser && currentResource) {
      const bookmarks = await DbService.getBookmarks(currentUser.id);
      const isBookmarked = bookmarks.some(b => b.resource_id === currentResource.id);
      bookmarkLabel.textContent = isBookmarked ? 'Bookmarked' : 'Bookmark';
      if (isBookmarked) bookmarkBtn.classList.add('btn-primary');

      bookmarkBtn.onclick = async () => {
        const added = await DbService.toggleBookmark(currentUser.id, currentResource.id);
        bookmarkLabel.textContent = added ? 'Bookmarked' : 'Bookmark';
        bookmarkBtn.classList.toggle('btn-primary', added);
        UI.showToast(added ? 'Added to your bookmarks!' : 'Removed from bookmarks', 'info');
      };
    } else {
      bookmarkBtn.onclick = () => {
        UI.showToast('Log in to bookmark study materials to your account', 'info');
      };
    }

    // Mark as Completed Toggle
    if (currentUser && currentChapter) {
      const isDone = studentProgress.some(p => p.chapter_id === currentChapter.id && p.status === 'completed');
      completedLabel.textContent = isDone ? 'Completed ✓' : 'Mark as Done';
      if (isDone) completedBtn.classList.add('btn-primary');

      completedBtn.onclick = async () => {
        const newStatus = await DbService.toggleChapterProgress(currentUser.id, currentChapter.id);
        const done = newStatus === 'completed';
        completedLabel.textContent = done ? 'Completed ✓' : 'Mark as Done';
        completedBtn.classList.toggle('btn-primary', done);
        UI.showToast(done ? 'Great job! Chapter marked as completed.' : 'Chapter marked in progress.', 'success');
      };
    } else {
      completedBtn.onclick = () => {
        UI.showToast('Log in to track your study progress across chapters', 'info');
      };
    }

  } catch (err) {
    console.error('Failed to load study content in viewer:', err);
    resourceTitle.textContent = 'Error Loading Material';
    formattedContentArea.innerHTML = `<div class="form-error">Could not display study content: ${err.message}</div>`;
  }
});
