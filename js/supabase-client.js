/**
 * BoardsBuddy - Supabase Client Initializer & Smart Fallback Bridge
 * 
 * Supports both:
 * 1. Live Supabase PostgreSQL & Auth connection when credentials are provided in js/config.js
 * 2. Instant zero-setup offline/demo mode backed by localStorage & mock-seed.js
 */

(function () {
  const config = window.BOARDSBUDDY_CONFIG || {};
  let supabaseInstance = null;
  let isLive = false;

  const isConfigured = 
    config.SUPABASE_URL && 
    config.SUPABASE_ANON_KEY && 
    !config.SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_ID') &&
    !config.SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY_HERE');

  if (isConfigured && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseInstance = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      isLive = true;
      console.log('✅ BoardsBuddy: Connected to live Supabase project at', config.SUPABASE_URL);
    } catch (err) {
      console.warn('⚠️ BoardsBuddy: Failed to initialize Supabase client, falling back to local storage bridge.', err);
    }
  } else {
    console.info('ℹ️ BoardsBuddy: Running in Local Interactive Mode with rich seed data. To connect your live Supabase database, update js/config.js with your project credentials.');
  }

  // Initialize LocalStorage with seed data if not present
  function ensureLocalStorageData() {
    const keys = config.STORAGE_KEYS;
    const seed = window.BOARDSBUDDY_MOCK_DATA || {};

    if (!localStorage.getItem(keys.MOCK_DB_RESOURCES) && seed.resources) {
      localStorage.setItem(keys.MOCK_DB_RESOURCES, JSON.stringify(seed.resources));
    }
    if (!localStorage.getItem(keys.MOCK_DB_CHAPTERS) && seed.chapters) {
      localStorage.setItem(keys.MOCK_DB_CHAPTERS, JSON.stringify(seed.chapters));
    }
    if (!localStorage.getItem(keys.MOCK_DB_SUBJECTS) && seed.subjects) {
      localStorage.setItem(keys.MOCK_DB_SUBJECTS, JSON.stringify(seed.subjects));
    }
  }

  ensureLocalStorageData();

  // Export client and status
  window.BoardsBuddyClient = {
    client: supabaseInstance,
    isLive: function () {
      return isLive;
    },
    getConfig: function () {
      return config;
    }
  };
})();
