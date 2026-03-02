class FileUploadService {
  constructor() {
    this.failUpload = false;
  }

  setFailUpload(shouldFail) {
    this.failUpload = Boolean(shouldFail);
  }

  async uploadManuscript(file) {
    if (!file) {
      throw new Error('Missing file for upload.');
    }
    if (this.failUpload) {
      throw new Error('File upload service unavailable.');
    }

    return {
      storageRef: `uploads/${Date.now()}-${file.name || 'manuscript'}`,
      uploadedAt: new Date().toISOString(),
    };
  }
}

module.exports = {
  FileUploadService,
};
