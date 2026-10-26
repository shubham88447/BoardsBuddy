/**
 * BoardsBuddy - Storage Service
 * Handles uploading PDFs, images, and worksheets to Supabase Storage with validation and progress tracking.
 */

const StorageService = (function () {
  function getBridge() {
    return window.BoardsBuddyClient || null;
  }

  function getConfig() {
    return window.BOARDSBUDDY_CONFIG || {};
  }

  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
  ];

  /**
   * Validate file size and MIME type
   */
  function validateFile(file) {
    if (!file) throw new Error('No file provided.');
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 25 MB.`);
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type (${file.type}). Allowed types are PDF, PNG, JPG, and WEBP.`);
    }
    return true;
  }

  /**
   * Upload file to Supabase Storage bucket
   */
  async function uploadFile(file, bucketName = null, folder = 'uploads') {
    validateFile(file);

    const cfg = getConfig();
    const bucket = bucketName || cfg.STORAGE_BUCKETS?.MATERIALS || 'study-materials';
    const b = getBridge();

    // Sanitize filename
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${Date.now()}_${cleanFileName}`;

    if (b && b.isLive()) {
      const { data, error } = await b.client.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Retrieve public URL
      const { data: urlData } = b.client.storage.from(bucket).getPublicUrl(path);
      return {
        path: path,
        fullUrl: urlData.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } else {
      // Offline / Local Simulation: Convert file to local Object URL
      const simulatedUrl = (typeof URL !== 'undefined' && URL.createObjectURL)
        ? URL.createObjectURL(file)
        : `blob:mock-simulated-storage/${path}`;
      return {
        path: path,
        fullUrl: simulatedUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        isSimulated: true
      };
    }
  }

  /**
   * Generate time-limited signed URL for private resources
   */
  async function getSignedUrl(bucketName, path, expiresIn = 3600) {
    const b = getBridge();
    if (b && b.isLive()) {
      const { data, error } = await b.client.storage
        .from(bucketName)
        .createSignedUrl(path, expiresIn);
      if (error) throw error;
      return data.signedUrl;
    }
    return path;
  }

  /**
   * Determine if a given URL points to Supabase Storage or local simulated storage
   */
  function isSupabaseStorageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.startsWith('blob:')) return true;
    if (trimmed.startsWith('study-materials/') || trimmed.startsWith('chapter-thumbnails/')) return true;
    if (trimmed.includes('/storage/v1/object/')) return true;
    const cfg = getConfig();
    const supabaseUrl = (cfg.SUPABASE_URL || '').replace(/\/+$/, '');
    if (supabaseUrl && trimmed.startsWith(supabaseUrl)) return true;
    return false;
  }

  /**
   * Determine if a given URL is an external third-party URL (e.g. cart.ebalbharati.in)
   */
  function isExternalUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return /^https?:\/\//i.test(url.trim()) && !isSupabaseStorageUrl(url);
  }

  /**
   * Parse bucket and object path from a Supabase Storage URL or relative path
   */
  function parseStoragePath(url) {
    if (!url || typeof url !== 'string') return { bucket: null, path: null };
    const cleanUrl = url.trim().split('?')[0];

    // Format: /storage/v1/object/(public|sign|authenticated)/bucket/path...
    const match = cleanUrl.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/i);
    if (match) {
      return { bucket: decodeURIComponent(match[1]), path: decodeURIComponent(match[2]) };
    }

    // Format: bucket/path...
    const relativeMatch = cleanUrl.match(/^([^/]+)\/(.+)$/);
    if (relativeMatch && ['study-materials', 'chapter-thumbnails'].includes(relativeMatch[1])) {
      return { bucket: relativeMatch[1], path: relativeMatch[2] };
    }

    return { bucket: null, path: null };
  }

  /**
   * Retrieve PDF source for PDF.js (handles external CORS detection, authenticated blobs, signed URLs, and public URLs)
   */
  async function getPdfSource(fileUrl) {
    if (!fileUrl) throw new Error('No PDF URL provided.');

    // 1. Local object / blob URL
    if (fileUrl.startsWith('blob:')) {
      return {
        type: 'blob',
        url: fileUrl,
        isExternal: false
      };
    }

    // 2. External URL (e.g. eBalbharati)
    if (isExternalUrl(fileUrl)) {
      return {
        type: 'external',
        url: fileUrl,
        isExternal: true
      };
    }

    // 3. Supabase Storage resource
    const parsed = parseStoragePath(fileUrl);
    const b = getBridge();
    if (b && b.isLive() && parsed.bucket && parsed.path) {
      // First attempt authenticated download (works for private buckets and avoids CORS preflight issues)
      try {
        const { data: blob, error } = await b.client.storage
          .from(parsed.bucket)
          .download(parsed.path);

        if (!error && blob) {
          const arrayBuffer = await blob.arrayBuffer();
          return {
            type: 'data',
            data: arrayBuffer,
            isExternal: false,
            bucket: parsed.bucket,
            path: parsed.path
          };
        }
      } catch (downloadErr) {
        console.warn('Authenticated download fallback:', downloadErr);
      }

      // Try signed URL if authenticated download is not available
      try {
        const signedUrl = await getSignedUrl(parsed.bucket, parsed.path, 3600);
        if (signedUrl && signedUrl !== parsed.path) {
          return {
            type: 'signed_url',
            url: signedUrl,
            isExternal: false,
            bucket: parsed.bucket,
            path: parsed.path
          };
        }
      } catch (signErr) {
        console.warn('Could not generate signed URL:', signErr);
      }
    }

    // 4. Default: load via direct URL
    return {
      type: 'url',
      url: fileUrl,
      isExternal: false
    };
  }

  /**
   * Upload file to Supabase Storage and immediately save URL to the resource record in DB
   */
  async function uploadAndSaveResource(file, resourceId, bucketName = null, folder = 'textbooks') {
    const uploaded = await uploadFile(file, bucketName, folder);
    if (resourceId && window.DbService) {
      await window.DbService.saveResource({
        id: resourceId,
        file_url: uploaded.fullUrl
      });
    }
    return uploaded;
  }

  /**
   * Delete file from storage
   */
  async function deleteFile(bucketName, path) {
    const b = getBridge();
    if (b && b.isLive()) {
      const { error } = await b.client.storage.from(bucketName).remove([path]);
      if (error) throw error;
    }
    return true;
  }

  return {
    validateFile,
    isSupabaseStorageUrl,
    isExternalUrl,
    parseStoragePath,
    getPdfSource,
    uploadFile,
    uploadAndSaveResource,
    getSignedUrl,
    deleteFile
  };
})();

window.StorageService = StorageService;
