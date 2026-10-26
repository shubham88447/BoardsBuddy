/**
 * BoardsBuddy - Database Service
 * Provides queries and mutations for boards, classes, subjects, chapters, resources, and bookmarks.
 * Works seamlessly with Supabase PostgreSQL or local interactive storage fallback.
 */

const DbService = (function () {
  const bridge = window.BoardsBuddyClient;
  const config = window.BOARDSBUDDY_CONFIG || {};
  const mockSeed = window.BOARDSBUDDY_MOCK_DATA || {};

  // Helper for localStorage collections
  function getLocalCollection(key, fallback = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  function setLocalCollection(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /* ==========================================================================
     Public Read Queries
     ========================================================================== */

  async function getBoards() {
    if (bridge.isLive()) {
      const { data, error } = await bridge.client
        .from('boards')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
    return mockSeed.boards;
  }

  async function getClasses(boardId) {
    if (bridge.isLive()) {
      let query = bridge.client.from('classes').select('*').order('name');
      if (boardId) query = query.eq('board_id', boardId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    return boardId ? mockSeed.classes.filter(c => c.board_id === boardId) : mockSeed.classes;
  }

  async function getSubjects(boardId, classId) {
    if (bridge.isLive()) {
      let query = bridge.client
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (boardId) query = query.eq('board_id', boardId);
      if (classId) query = query.eq('class_id', classId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    const subjects = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_SUBJECTS, mockSeed.subjects);
    return subjects.filter(s => s.is_active !== false);
  }

  async function getSubjectById(subjectId) {
    if (bridge.isLive()) {
      const { data, error } = await bridge.client
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();
      if (error) throw error;
      return data;
    }
    const subjects = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_SUBJECTS, mockSeed.subjects);
    return subjects.find(s => s.id === subjectId) || subjects[0];
  }

  async function getChapters(subjectId) {
    if (bridge.isLive()) {
      let query = bridge.client
        .from('chapters')
        .select('*')
        .eq('is_active', true)
        .order('chapter_number', { ascending: true });
      if (subjectId) query = query.eq('subject_id', subjectId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    const chapters = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_CHAPTERS, mockSeed.chapters);
    return chapters
      .filter(c => (!subjectId || c.subject_id === subjectId) && c.is_active !== false)
      .sort((a, b) => a.chapter_number - b.chapter_number);
  }

  async function getChapterById(chapterId) {
    if (bridge.isLive()) {
      const { data, error } = await bridge.client
        .from('chapters')
        .select('*, subjects(*)')
        .eq('id', chapterId)
        .single();
      if (error) throw error;
      return data;
    }
    const chapters = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_CHAPTERS, mockSeed.chapters);
    return chapters.find(c => c.id === chapterId) || null;
  }

  async function getResources({ type, subjectId, chapterId, year, onlyPublished = true }) {
    if (bridge.isLive()) {
      let query = bridge.client
        .from('resources')
        .select('*, chapters(title, chapter_number), subjects(name)')
        .order('created_at', { ascending: false });

      if (type) query = query.eq('type', type);
      if (subjectId) query = query.eq('subject_id', subjectId);
      if (chapterId) query = query.eq('chapter_id', chapterId);
      if (year) query = query.eq('year', year);
      if (onlyPublished) query = query.eq('is_published', true);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }

    const resources = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_RESOURCES, mockSeed.resources);
    return resources.filter(r => {
      if (type && r.type !== type) return false;
      if (subjectId && r.subject_id !== subjectId) return false;
      if (chapterId && r.chapter_id !== chapterId) return false;
      if (year && r.year !== parseInt(year, 10)) return false;
      if (onlyPublished && r.is_published === false) return false;
      return true;
    });
  }

  async function getResourceById(resourceId) {
    if (bridge.isLive()) {
      const { data, error } = await bridge.client
        .from('resources')
        .select('*, chapters(title, chapter_number), subjects(name)')
        .eq('id', resourceId)
        .single();
      if (error) throw error;
      return data;
    }
    const resources = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_RESOURCES, mockSeed.resources);
    return resources.find(r => r.id === resourceId) || null;
  }

  async function searchResources(searchTerm, subjectId = null) {
    if (!searchTerm || !searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase().trim();

    if (bridge.isLive()) {
      let query = bridge.client
        .from('resources')
        .select('*, chapters(title, chapter_number), subjects(name)')
        .eq('is_published', true)
        .or(`title.ilike.%${term}%,description.ilike.%${term}%,content_text.ilike.%${term}%`);

      if (subjectId) query = query.eq('subject_id', subjectId);
      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    }

    const resources = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_RESOURCES, mockSeed.resources);
    return resources.filter(r => {
      if (r.is_published === false) return false;
      if (subjectId && r.subject_id !== subjectId) return false;
      const titleMatch = r.title && r.title.toLowerCase().includes(term);
      const descMatch = r.description && r.description.toLowerCase().includes(term);
      const contentMatch = r.content_text && r.content_text.toLowerCase().includes(term);
      return titleMatch || descMatch || contentMatch;
    });
  }

  /* ==========================================================================
     Bookmarks & Student Progress
     ========================================================================== */

  async function getBookmarks(userId) {
    if (!userId) return [];
    if (bridge.isLive()) {
      const { data, error } = await bridge.client
        .from('bookmarks')
        .select('*, resources(*)')
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    }
    const saved = localStorage.getItem('boardsbuddy_bookmarks_' + userId);
    return saved ? JSON.parse(saved) : [];
  }

  async function toggleBookmark(userId, resourceId) {
    if (!userId || !resourceId) return false;
    if (bridge.isLive()) {
      const { data: existing } = await bridge.client
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .maybeSingle();

      if (existing) {
        await bridge.client.from('bookmarks').delete().eq('id', existing.id);
        return false;
      } else {
        await bridge.client.from('bookmarks').insert({ user_id: userId, resource_id: resourceId });
        return true;
      }
    } else {
      const key = 'boardsbuddy_bookmarks_' + userId;
      let bookmarks = getLocalCollection(key, []);
      const index = bookmarks.findIndex(b => b.resource_id === resourceId);
      if (index > -1) {
        bookmarks.splice(index, 1);
        setLocalCollection(key, bookmarks);
        return false;
      } else {
        bookmarks.push({ id: 'bmk-' + Date.now(), user_id: userId, resource_id: resourceId, created_at: new Date().toISOString() });
        setLocalCollection(key, bookmarks);
        return true;
      }
    }
  }

  async function getStudentProgress(userId) {
    if (!userId) return [];
    if (bridge.isLive()) {
      const { data, error } = await bridge.client
        .from('student_progress')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    }
    const saved = localStorage.getItem('boardsbuddy_progress_' + userId);
    return saved ? JSON.parse(saved) : [];
  }

  async function toggleChapterProgress(userId, chapterId) {
    if (!userId || !chapterId) return;
    if (bridge.isLive()) {
      const { data: existing } = await bridge.client
        .from('student_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('chapter_id', chapterId)
        .maybeSingle();

      if (existing) {
        const newStatus = existing.status === 'completed' ? 'in_progress' : 'completed';
        await bridge.client
          .from('student_progress')
          .update({ status: newStatus, last_accessed_at: new Date().toISOString() })
          .eq('id', existing.id);
        return newStatus;
      } else {
        await bridge.client
          .from('student_progress')
          .insert({ user_id: userId, chapter_id: chapterId, status: 'completed' });
        return 'completed';
      }
    } else {
      const key = 'boardsbuddy_progress_' + userId;
      let list = getLocalCollection(key, []);
      const item = list.find(p => p.chapter_id === chapterId);
      if (item) {
        item.status = item.status === 'completed' ? 'in_progress' : 'completed';
        item.last_accessed_at = new Date().toISOString();
        setLocalCollection(key, list);
        return item.status;
      } else {
        list.push({ id: 'prog-' + Date.now(), user_id: userId, chapter_id: chapterId, status: 'completed', last_accessed_at: new Date().toISOString() });
        setLocalCollection(key, list);
        return 'completed';
      }
    }
  }

  /* ==========================================================================
     Admin CRUD Operations
     Protected by Supabase RLS policies on the database level
     ========================================================================== */

  async function saveSubject(subjectData) {
    if (bridge.isLive()) {
      if (subjectData.id) {
        const updatePayload = { ...subjectData };
        const { data, error } = await bridge.client
          .from('subjects')
          .update(updatePayload)
          .eq('id', subjectData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const insertPayload = { ...subjectData };
        delete insertPayload.id;
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          insertPayload.id = crypto.randomUUID();
        }
        const { data, error } = await bridge.client
          .from('subjects')
          .insert(insertPayload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } else {
      let subjects = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_SUBJECTS, mockSeed.subjects);
      if (subjectData.id) {
        const index = subjects.findIndex(s => s.id === subjectData.id);
        if (index > -1) subjects[index] = { ...subjects[index], ...subjectData };
      } else {
        subjectData.id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
          ? crypto.randomUUID()
          : 'sub-' + Date.now();
        subjects.push(subjectData);
      }
      setLocalCollection(config.STORAGE_KEYS.MOCK_DB_SUBJECTS, subjects);
      return subjectData;
    }
  }

  async function deleteSubject(id) {
    if (bridge.isLive()) {
      const { error } = await bridge.client.from('subjects').delete().eq('id', id);
      if (error) throw error;
    } else {
      let subjects = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_SUBJECTS, mockSeed.subjects);
      subjects = subjects.filter(s => s.id !== id);
      setLocalCollection(config.STORAGE_KEYS.MOCK_DB_SUBJECTS, subjects);
    }
  }

  async function saveChapter(chapterData) {
    if (bridge.isLive()) {
      if (chapterData.id) {
        const updatePayload = { ...chapterData };
        const { data, error } = await bridge.client
          .from('chapters')
          .update(updatePayload)
          .eq('id', chapterData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const insertPayload = { ...chapterData };
        delete insertPayload.id;
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          insertPayload.id = crypto.randomUUID();
        }
        const { data, error } = await bridge.client
          .from('chapters')
          .insert(insertPayload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } else {
      let chapters = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_CHAPTERS, mockSeed.chapters);
      if (chapterData.id) {
        const index = chapters.findIndex(c => c.id === chapterData.id);
        if (index > -1) chapters[index] = { ...chapters[index], ...chapterData };
      } else {
        chapterData.id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
          ? crypto.randomUUID()
          : 'ch-' + Date.now();
        chapters.push(chapterData);
      }
      setLocalCollection(config.STORAGE_KEYS.MOCK_DB_CHAPTERS, chapters);
      return chapterData;
    }
  }

  async function deleteChapter(id) {
    if (bridge.isLive()) {
      const { error } = await bridge.client.from('chapters').delete().eq('id', id);
      if (error) throw error;
    } else {
      let chapters = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_CHAPTERS, mockSeed.chapters);
      chapters = chapters.filter(c => c.id !== id);
      setLocalCollection(config.STORAGE_KEYS.MOCK_DB_CHAPTERS, chapters);
    }
  }

  async function saveResource(resourceData) {
    if (bridge.isLive()) {
      if (resourceData.id) {
        const updatePayload = { ...resourceData, updated_at: new Date().toISOString() };
        if ('chapter_id' in updatePayload && !updatePayload.chapter_id) updatePayload.chapter_id = null;
        if ('file_url' in updatePayload && !updatePayload.file_url) updatePayload.file_url = null;
        if ('description' in updatePayload && !updatePayload.description) updatePayload.description = null;
        if ('content_text' in updatePayload && !updatePayload.content_text) updatePayload.content_text = null;
        if ('year' in updatePayload && (updatePayload.year === '' || isNaN(updatePayload.year))) updatePayload.year = null;
        if ('marks' in updatePayload && (updatePayload.marks === '' || isNaN(updatePayload.marks))) updatePayload.marks = null;

        const { data, error } = await bridge.client
          .from('resources')
          .update(updatePayload)
          .eq('id', resourceData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const insertPayload = { ...resourceData };
        delete insertPayload.id;

        // Ensure id is a valid UUID: generate on client if available, or omit to allow DB default uuid_generate_v4()
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          insertPayload.id = crypto.randomUUID();
        }

        // Clean empty string / invalid nullable fields so PostgreSQL types are respected
        if (!insertPayload.chapter_id) insertPayload.chapter_id = null;
        if (!insertPayload.file_url) insertPayload.file_url = null;
        if (!insertPayload.description) insertPayload.description = null;
        if (!insertPayload.content_text) insertPayload.content_text = null;
        if (insertPayload.year === '' || isNaN(insertPayload.year)) insertPayload.year = null;
        if (insertPayload.marks === '' || isNaN(insertPayload.marks)) insertPayload.marks = null;

        const { data, error } = await bridge.client
          .from('resources')
          .insert(insertPayload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } else {
      let resources = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_RESOURCES, mockSeed.resources);
      if (resourceData.id) {
        const index = resources.findIndex(r => r.id === resourceData.id);
        if (index > -1) {
          resources[index] = { ...resources[index], ...resourceData, updated_at: new Date().toISOString() };
        }
      } else {
        resourceData.id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
          ? crypto.randomUUID()
          : 'res-' + Date.now();
        resourceData.created_at = new Date().toISOString();
        resources.unshift(resourceData);
      }
      setLocalCollection(config.STORAGE_KEYS.MOCK_DB_RESOURCES, resources);
      return resourceData;
    }
  }

  async function deleteResource(id) {
    if (bridge.isLive()) {
      const { error } = await bridge.client.from('resources').delete().eq('id', id);
      if (error) throw error;
    } else {
      let resources = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_RESOURCES, mockSeed.resources);
      resources = resources.filter(r => r.id !== id);
      setLocalCollection(config.STORAGE_KEYS.MOCK_DB_RESOURCES, resources);
    }
  }

  async function togglePublishResource(id, isPublished) {
    return saveResource({ id, is_published: isPublished });
  }

  async function getAdminOverviewStats() {
    if (bridge.isLive()) {
      const [subjectsRes, chaptersRes, resourcesRes] = await Promise.all([
        bridge.client.from('subjects').select('id', { count: 'exact' }),
        bridge.client.from('chapters').select('id', { count: 'exact' }),
        bridge.client.from('resources').select('id, is_published, type')
      ]);

      const resources = resourcesRes.data || [];
      const published = resources.filter(r => r.is_published).length;
      const drafts = resources.length - published;

      return {
        totalSubjects: subjectsRes.count || 0,
        totalChapters: chaptersRes.count || 0,
        totalResources: resources.length,
        publishedResources: published,
        draftResources: drafts
      };
    } else {
      const subjects = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_SUBJECTS, mockSeed.subjects);
      const chapters = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_CHAPTERS, mockSeed.chapters);
      const resources = getLocalCollection(config.STORAGE_KEYS.MOCK_DB_RESOURCES, mockSeed.resources);
      const published = resources.filter(r => r.is_published).length;

      return {
        totalSubjects: subjects.length,
        totalChapters: chapters.length,
        totalResources: resources.length,
        publishedResources: published,
        draftResources: resources.length - published
      };
    }
  }

  return {
    getBoards,
    getClasses,
    getSubjects,
    getSubjectById,
    getChapters,
    getChapterById,
    getResources,
    getResourceById,
    searchResources,
    getBookmarks,
    toggleBookmark,
    getStudentProgress,
    toggleChapterProgress,
    saveSubject,
    deleteSubject,
    saveChapter,
    deleteChapter,
    saveResource,
    deleteResource,
    togglePublishResource,
    getAdminOverviewStats
  };
})();

window.DbService = DbService;
