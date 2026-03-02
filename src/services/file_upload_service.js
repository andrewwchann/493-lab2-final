const fs = require('fs');
const path = require('path');

class FileUploadService {
  constructor() {
    this.failUpload = false;
    this.uploadDir = path.resolve(__dirname, '..', 'assets', 'uploads');
  }

  setFailUpload(shouldFail) {
    this.failUpload = Boolean(shouldFail);
  }

  uploadManuscript(file) {
    if (!file) {
      throw new Error('Missing file for upload.');
    }
    if (this.failUpload) {
      throw new Error('File upload service unavailable.');
    }

    const originalName = path.basename(file.name || 'manuscript');
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const persistedName = `${Date.now()}-${Math.floor(Math.random() * 100000)}-${safeName}`;
    const absolutePath = path.join(this.uploadDir, persistedName);
    const publicPath = `/assets/uploads/${persistedName}`;

    fs.mkdirSync(this.uploadDir, { recursive: true });
    if (Buffer.isBuffer(file.buffer) && file.buffer.length > 0) {
      fs.writeFileSync(absolutePath, file.buffer);
    } else {
      fs.writeFileSync(absolutePath, Buffer.from(`Placeholder manuscript: ${originalName}`, 'utf8'));
    }

    return {
      storageRef: publicPath,
      uploadedAt: new Date().toISOString(),
    };
  }
}

module.exports = {
  FileUploadService,
};
