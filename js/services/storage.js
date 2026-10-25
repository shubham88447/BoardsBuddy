/**
 * BoardsBuddy - Storage Service
 * Handles uploading PDFs, images, and worksheets to Supabase Storage with validation and progress tracking.
 */

const StorageService = (function () {
  const bridge = window.BoardsBuddyClient;
  const config = window.BOARDSBUDDY_CONFIG || {};

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
  async function uploadFile(file, bucketName = config.STORAGE_BUCKETS.MATERIALS, folder = 'uploads') {
    validateFile(file);

    // Sanitize filename
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${Date.now()}_${cleanFileName}`;

    if (bridge.isLive()) {
      const { data, error } = await bridge.client.storage
        .from(bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Retrieve public URL
      const { data: urlData } = bridge.client.storage.from(bucketName).getPublicUrl(path);
      return {
        path: path,
        fullUrl: urlData.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } else {
      // Offline / Local Simulation: Convert file to local Object URL
      const simulatedUrl = URL.createObjectURL(file);
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
    if (bridge.isLive()) {
      const { data, error } = await bridge.client.storage
        .from(bucketName)
        .createSignedUrl(path, expiresIn);
      if (error) throw error;
      return data.signedUrl;
    }
    return path;
  }

  /**
   * Delete file from storage
   */
  async function deleteFile(bucketName, path) {
    if (bridge.isLive()) {
      const { error } = await bridge.client.storage.from(bucketName).remove([path]);
      if (error) throw error;
    }
    return true;
  }

  return {
    validateFile,
    uploadFile,
    getSignedUrl,
    deleteFile
  };
})();

window.StorageService = StorageService;
