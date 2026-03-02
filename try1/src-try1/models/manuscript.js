class Manuscript {
  constructor({
    id,
    submissionId,
    fileName,
    fileType,
    fileSizeMb,
    storageRef,
    version = 1,
    isCurrent = true,
    uploadedAt,
  }) {
    this.id = id;
    this.submissionId = submissionId;
    this.fileName = fileName;
    this.fileType = fileType;
    this.fileSizeMb = fileSizeMb;
    this.storageRef = storageRef;
    this.version = version;
    this.isCurrent = isCurrent;
    this.uploadedAt = uploadedAt;
  }
}

module.exports = {
  Manuscript,
};
