/**
 * BoardsBuddy - Authentication Service
 * Interfaces directly with Supabase Auth with secure role verification.
 */

const AuthService = (function () {
  const bridge = window.BoardsBuddyClient;
  const config = window.BOARDSBUDDY_CONFIG || {};

  /**
   * Register a new student account
   */
  async function signUp(email, password, fullName, selectedBoard, selectedClass) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (bridge.isLive()) {
      const { data, error } = await bridge.client.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
            selected_board: selectedBoard || config.DEFAULTS.BOARD_NAME,
            selected_class: selectedClass || config.DEFAULTS.CLASS_NAME
          }
        }
      });
      if (error) throw error;
      return data;
    } else {
      // Local demo mode simulation
      const mockUser = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        email: email.trim(),
        user_metadata: {
          full_name: fullName || email.split('@')[0],
          selected_board: selectedBoard || config.DEFAULTS.BOARD_NAME,
          selected_class: selectedClass || config.DEFAULTS.CLASS_NAME
        },
        role: 'student'
      };
      localStorage.setItem(config.STORAGE_KEYS.USER_SESSION, JSON.stringify(mockUser));
      return { user: mockUser, session: { user: mockUser } };
    }
  }

  /**
   * Sign in an existing user
   */
  async function signIn(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    if (bridge.isLive()) {
      const { data, error } = await bridge.client.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      if (error) throw error;
      return data;
    } else {
      // Local demo authentication
      let role = 'student';
      if (email.toLowerCase().includes('admin')) {
        role = 'admin';
      }
      const mockUser = {
        id: 'usr-demo-' + (role === 'admin' ? 'admin' : 'student'),
        email: email.trim(),
        user_metadata: {
          full_name: role === 'admin' ? 'Designated Admin' : 'Demo Student',
          selected_board: config.DEFAULTS.BOARD_NAME,
          selected_class: config.DEFAULTS.CLASS_NAME
        },
        role: role
      };
      localStorage.setItem(config.STORAGE_KEYS.USER_SESSION, JSON.stringify(mockUser));
      return { user: mockUser, session: { user: mockUser } };
    }
  }

  /**
   * Sign out current user
   */
  async function signOut() {
    if (bridge.isLive()) {
      const { error } = await bridge.client.auth.signOut();
      if (error) console.error('SignOut error:', error);
    }
    localStorage.removeItem(config.STORAGE_KEYS.USER_SESSION);

    const protectedPages = ['notes.html', 'short-notes.html', 'chapterwise-pyqs.html', 'pyq-solutions.html', 'profile.html'];
    const isProtected = protectedPages.some(p => window.location.pathname.includes(p));
    if (isProtected) {
      const isPagesDir = window.location.pathname.includes('/pages/');
      window.location.href = isPagesDir ? 'textbooks.html' : 'pages/textbooks.html';
    } else {
      window.location.reload();
    }
  }

  /**
   * Request password reset email
   */
  async function resetPassword(email) {
    if (!email) throw new Error('Please provide your registered email address.');
    if (bridge.isLive()) {
      const { data, error } = await bridge.client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/pages/auth.html#reset-password'
      });
      if (error) throw error;
      return data;
    } else {
      return { message: 'Password reset link sent (simulated for local mode).' };
    }
  }

  /**
   * Get currently authenticated user
   */
  async function getCurrentUser() {
    if (bridge.isLive()) {
      const { data: { session } } = await bridge.client.auth.getSession();
      return session?.user || null;
    } else {
      const saved = localStorage.getItem(config.STORAGE_KEYS.USER_SESSION);
      return saved ? JSON.parse(saved) : null;
    }
  }

  /**
   * Verify if current authenticated user has verified Admin role
   */
  async function checkIsAdmin() {
    const user = await getCurrentUser();
    if (!user) return false;

    if (bridge.isLive()) {
      try {
        // 1. Query the security-restricted user_roles table
        const { data, error } = await bridge.client
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.warn('Admin check error:', error);
          return false;
        }
        return data?.role === 'admin';
      } catch (e) {
        console.error('Failed to verify admin status:', e);
        return false;
      }
    } else {
      // In local demo mode, verify role property
      return user.role === 'admin';
    }
  }

  /**
   * Synchronously check if a session token exists in local storage
   */
  function hasUserSessionSync() {
    if (bridge.isLive()) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          try {
            const val = JSON.parse(localStorage.getItem(key));
            if (val && (val.user || val.access_token)) return true;
          } catch (_) {}
        }
      }
    }
    const local = localStorage.getItem(config.STORAGE_KEYS.USER_SESSION);
    return !!local;
  }

  /**
   * Protect student pages: redirects unauthenticated users to login with destination and message preserved
   */
  async function requireUserAuth(options = {}) {
    if (window.location.pathname.includes('auth.html')) return true;

    const user = await getCurrentUser();
    if (!user) {
      const message = options.message || 'Please log in or create an account to access this content.';
      const isPagesDir = window.location.pathname.includes('/pages/');
      const authPath = isPagesDir ? 'auth.html' : 'pages/auth.html';
      const currentUrl = window.location.pathname + window.location.search + window.location.hash;
      const redirectUrl = `${authPath}?redirect=${encodeURIComponent(currentUrl)}&message=${encodeURIComponent(message)}`;
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  /**
   * Protect admin pages: redirects non-admin users to login immediately
   */
  async function requireAdminAuth(loginRedirectUrl = '/admin/login.html') {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      console.warn('⛔ Unauthorized admin access attempt. Redirecting to admin login.');
      window.location.href = loginRedirectUrl;
      return false;
    }
    return true;
  }

  /**
   * Listen to auth state transitions
   */
  function onAuthStateChange(callback) {
    if (bridge.isLive()) {
      return bridge.client.auth.onAuthStateChange((event, session) => {
        callback(event, session?.user || null);
      });
    } else {
      const user = getCurrentUser();
      callback('INITIAL', user);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    getCurrentUser,
    hasUserSessionSync,
    checkIsAdmin,
    requireUserAuth,
    requireAdminAuth,
    onAuthStateChange
  };
})();

window.AuthService = AuthService;
