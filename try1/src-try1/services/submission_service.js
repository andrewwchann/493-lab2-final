const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'tex', 'zip'];
const MAX_FILE_MB = 7.0;

class SubmissionService {
  constructor({ dataStore, fileUploadService }) {
    this.dataStore = dataStore;
    this.fileUploadService = fileUploadService;
    this.submissionWindowOpen = true;
  }

  setSubmissionWindowOpen(isOpen) {
    this.submissionWindowOpen = Boolean(isOpen);
  }

  validateSubmissionPayload({ title, authorNames, affiliationOrContact, abstract, keywords, file }) {
    const errors = {};

    if (!title) {
      errors.title = 'Title is required.';
    }
    if (!authorNames) {
      errors.authorNames = 'Author names are required.';
    }
    if (!affiliationOrContact) {
      errors.affiliationOrContact = 'Affiliation or contact information is required.';
    }
    if (!abstract) {
      errors.abstract = 'Abstract is required.';
    }
    if (!keywords) {
      errors.keywords = 'Keywords are required.';
    }
    if (!file) {
      errors.file = 'Manuscript file is required.';
    } else {
      const extension = String(file.name || '').split('.').pop().toLowerCase();
      const sizeMb = Number(file.sizeMb || 0);
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        errors.file = 'Unsupported manuscript format.';
      }
      if (sizeMb > MAX_FILE_MB) {
        errors.file = 'Manuscript exceeds 7.0MB limit.';
      }
    }

    return errors;
  }

  async createSubmission({
    authorAccountId,
    title,
    authorNames,
    affiliationOrContact,
    abstract,
    keywords,
    file,
    finalSubmit = true,
  }) {
    if (finalSubmit && !this.submissionWindowOpen) {
      return {
        ok: false,
        code: 'SUBMISSION_WINDOW_CLOSED',
        errors: { form: 'Submission window is closed.' },
      };
    }

    const errors = this.validateSubmissionPayload({
      title,
      authorNames,
      affiliationOrContact,
      abstract,
      keywords,
      file,
    });
    if (Object.keys(errors).length > 0) {
      return { ok: false, code: 'VALIDATION_ERROR', errors };
    }

    const now = new Date().toISOString();
    const submission = this.dataStore.insert('submissions', {
      authorAccountId,
      title,
      authorNames,
      affiliationOrContact,
      abstract,
      keywords,
      status: finalSubmit ? 'submitted' : 'draft',
      createdAt: now,
      updatedAt: now,
    });

    let upload;
    try {
      upload = await this.fileUploadService.uploadManuscript(file);
    } catch (error) {
      return {
        ok: false,
        code: 'UPLOAD_FAILED',
        errors: { form: 'Unable to upload manuscript. Please retry later.' },
      };
    }

    this.dataStore.insert('manuscripts', {
      submissionId: submission.id,
      fileName: file.name,
      fileType: String(file.name).split('.').pop().toLowerCase(),
      fileSizeMb: Number(file.sizeMb || 0),
      storageRef: upload.storageRef,
      version: 1,
      isCurrent: true,
      uploadedAt: upload.uploadedAt,
    });

    return {
      ok: true,
      submission,
    };
  }

  async replaceManuscript({ submissionId, file }) {
    const submission = this.dataStore.findById('submissions', Number(submissionId));
    if (!submission) {
      return { ok: false, code: 'SUBMISSION_NOT_FOUND', errors: { form: 'Submission not found.' } };
    }

    const current = this.dataStore.findOne(
      'manuscripts',
      (row) => row.submissionId === Number(submissionId) && row.isCurrent
    );
    if (!current) {
      return { ok: false, code: 'MANUSCRIPT_NOT_FOUND', errors: { form: 'Current manuscript not found.' } };
    }

    const fileErrors = this.validateSubmissionPayload({
      title: submission.title,
      authorNames: submission.authorNames,
      affiliationOrContact: submission.affiliationOrContact,
      abstract: submission.abstract,
      keywords: submission.keywords,
      file,
    });
    if (fileErrors.file) {
      return { ok: false, code: 'VALIDATION_ERROR', errors: { file: fileErrors.file } };
    }

    let upload;
    try {
      upload = await this.fileUploadService.uploadManuscript(file);
    } catch (error) {
      return {
        ok: false,
        code: 'UPLOAD_FAILED',
        errors: { file: 'Unable to upload replacement manuscript. Prior version is unchanged.' },
      };
    }

    this.dataStore.updateById('manuscripts', current.id, { isCurrent: false });
    const replacement = this.dataStore.insert('manuscripts', {
      submissionId: Number(submissionId),
      fileName: file.name,
      fileType: String(file.name).split('.').pop().toLowerCase(),
      fileSizeMb: Number(file.sizeMb || 0),
      storageRef: upload.storageRef,
      version: Number(current.version || 1) + 1,
      isCurrent: true,
      uploadedAt: upload.uploadedAt,
    });

    return { ok: true, manuscript: replacement };
  }

  saveDraft({ authorAccountId, submissionId = null, title, identifier, payload = {} }) {
    if (!title && !identifier) {
      return {
        ok: false,
        code: 'DRAFT_MINIMUM_REQUIRED',
        errors: { save: 'Provide at least a title or identifier to save a draft.' },
      };
    }

    const now = new Date().toISOString();
    if (submissionId) {
      const existing = this.dataStore.findById('submissions', Number(submissionId));
      if (!existing || existing.authorAccountId !== authorAccountId) {
        return { ok: false, code: 'DRAFT_NOT_FOUND', errors: { save: 'Draft not found.' } };
      }
      const updated = this.dataStore.updateById('submissions', Number(submissionId), {
        ...payload,
        title: title || existing.title || identifier,
        authorNames: payload.authorNames || existing.authorNames || '',
        affiliationOrContact: payload.affiliationOrContact || existing.affiliationOrContact || '',
        status: 'draft',
        updatedAt: now,
      });
      return { ok: true, draft: updated };
    }

    const draft = this.dataStore.insert('submissions', {
      authorAccountId,
      title: title || identifier,
      authorNames: payload.authorNames || '',
      affiliationOrContact: payload.affiliationOrContact || '',
      abstract: payload.abstract || '',
      keywords: payload.keywords || '',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true, draft };
  }

  listDrafts({ authorAccountId }) {
    return this.dataStore.list(
      'submissions',
      (row) => row.authorAccountId === authorAccountId && row.status === 'draft'
    );
  }

  resumeDraft({ authorAccountId, submissionId }) {
    const draft = this.dataStore.findById('submissions', Number(submissionId));
    if (!draft || draft.authorAccountId !== authorAccountId || draft.status !== 'draft') {
      return { ok: false, errors: { save: 'Draft not found.' } };
    }
    return { ok: true, draft };
  }

  async submitDraft({ authorAccountId, submissionId, file }) {
    const draft = this.dataStore.findById('submissions', Number(submissionId));
    if (!draft || draft.authorAccountId !== authorAccountId || draft.status !== 'draft') {
      return { ok: false, code: 'DRAFT_NOT_FOUND', errors: { save: 'Draft not found.' } };
    }

    if (!this.submissionWindowOpen) {
      return {
        ok: false,
        code: 'SUBMISSION_WINDOW_CLOSED',
        errors: { window: 'Submission window is closed. Draft remains viewable.' },
      };
    }

    const result = await this.createSubmission({
      authorAccountId,
      title: draft.title,
      authorNames: draft.authorNames,
      affiliationOrContact: draft.affiliationOrContact,
      abstract: draft.abstract,
      keywords: draft.keywords,
      file,
      finalSubmit: true,
    });
    if (!result.ok) {
      return result;
    }

    this.dataStore.updateById('submissions', Number(submissionId), {
      status: 'submitted',
      updatedAt: new Date().toISOString(),
    });
    return result;
  }
}

module.exports = {
  SubmissionService,
  ALLOWED_EXTENSIONS,
  MAX_FILE_MB,
};
