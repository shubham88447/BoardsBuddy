/**
 * BoardsBuddy Configuration Module
 * 
 * Instructions:
 * 1. Create a free project on https://supabase.com
 * 2. Copy Project URL and Project Anon/Public Key from Project Settings > API
 * 3. Update the values below or inject them via window.BOARDSBUDDY_CONFIG
 */

const CONFIG = {
  // Connected Supabase Project:
  SUPABASE_URL: window.ENV?.SUPABASE_URL || 'https://ccknozgfvwmatdzftlak.supabase.co',
  SUPABASE_ANON_KEY: window.ENV?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNja25vemdmdndtYXRkemZ0bGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MjIwMDQsImV4cCI6MjEwODQ5ODAwNH0.xUzVHqAOs3nfD-2ttrq0l1rrSjKZ7LbZaTO1uKIFj9s',

  // Storage Buckets
  STORAGE_BUCKETS: {
    MATERIALS: 'study-materials',
    THUMBNAILS: 'chapter-thumbnails'
  },

  // Default App Settings
  DEFAULTS: {
    BOARD_NAME: 'Maharashtra State Board',
    BOARD_CODE: 'MSBSHSE',
    CLASS_NAME: 'Class 10 (SSC)',
    CLASS_CODE: '10'
  },

  // LocalStorage State Keys
  STORAGE_KEYS: {
    THEME: 'boardsbuddy_theme',
    SELECTED_BOARD: 'boardsbuddy_selected_board',
    SELECTED_CLASS: 'boardsbuddy_selected_class',
    SELECTED_SUBJECT: 'boardsbuddy_selected_subject',
    USER_SESSION: 'boardsbuddy_user_session',
    MOCK_DB_RESOURCES: 'boardsbuddy_mock_resources_v1',
    MOCK_DB_CHAPTERS: 'boardsbuddy_mock_chapters_v1',
    MOCK_DB_SUBJECTS: 'boardsbuddy_mock_subjects_v1'
  }
};

window.BOARDSBUDDY_CONFIG = CONFIG;
