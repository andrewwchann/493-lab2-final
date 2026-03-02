const test = require('node:test');
const assert = require('node:assert/strict');

const { DataStore } = require('../../src/services/data_store');
const { SubmissionService } = require('../../src/services/submission_service');
const { ReviewService } = require('../../src/services/review_service');
const { ScheduleService } = require('../../src/services/schedule_service');
const { NotificationService } = require('../../src/services/notification_service');
const { PricingService } = require('../../src/services/pricing_service');
const { PaymentGatewayService } = require('../../src/services/payment_gateway_service');
const { TicketService } = require('../../src/services/ticket_service');
const { PaymentService } = require('../../src/services/payment_service');
const { PublicationService } = require('../../src/services/publication_service');
const { RegistrationService, validateRegistrationPassword } = require('../../src/services/registration_service');
const { AuthService } = require('../../src/services/auth_service');
const { FileUploadService } = require('../../src/services/file_upload_service');

function buildSubmissionService({ uploadImpl } = {}) {
  const dataStore = new DataStore();
  const fileUploadService = {
    uploadManuscript: uploadImpl || ((file) => ({ storageRef: `/assets/uploads/${file.name}`, uploadedAt: 'now' })),
  };
  return { dataStore, service: new SubmissionService({ dataStore, fileUploadService }) };
}

test('submission service covers create/replace/save/resume/submit edge branches', async () => {
  const { dataStore, service } = buildSubmissionService();

  service.setSubmissionWindowOpen(false);
  const closed = await service.createSubmission({
    authorAccountId: 1,
    title: 'A',
    authorNames: 'B',
    affiliationOrContact: 'C',
    abstract: 'D',
    keywords: 'E',
    file: { name: 'ok.pdf', sizeMb: 1 },
    finalSubmit: true,
  });
  assert.equal(closed.ok, false);
  assert.equal(closed.code, 'SUBMISSION_WINDOW_CLOSED');

  service.setSubmissionWindowOpen(true);
  const validateAllMissing = await service.createSubmission({
    authorAccountId: 1,
    title: '',
    authorNames: '',
    affiliationOrContact: '',
    abstract: '',
    keywords: '',
    file: null,
  });
  assert.equal(validateAllMissing.code, 'VALIDATION_ERROR');
  assert.ok(validateAllMissing.errors.title);
  assert.ok(validateAllMissing.errors.file);

  const badType = service.validateSubmissionPayload({
    title: 'T',
    authorNames: 'A',
    affiliationOrContact: 'C',
    abstract: 'X',
    keywords: 'K',
    file: { name: 'manuscript.exe', sizeMb: 1 },
  });
  assert.match(badType.file, /Unsupported/);

  const tooBig = service.validateSubmissionPayload({
    title: 'T',
    authorNames: 'A',
    affiliationOrContact: 'C',
    abstract: 'X',
    keywords: 'K',
    file: { name: 'manuscript.pdf', sizeMb: 20 },
  });
  assert.match(tooBig.file, /exceeds 7.0MB/);

  const createdDraft = await service.createSubmission({
    authorAccountId: 1,
    title: 'Draft style',
    authorNames: 'A',
    affiliationOrContact: 'C',
    abstract: 'X',
    keywords: 'K',
    file: { name: 'draft.pdf', sizeMb: 1 },
    finalSubmit: false,
  });
  assert.equal(createdDraft.ok, true);
  assert.equal(createdDraft.submission.status, 'draft');

  const { service: uploadFailService } = buildSubmissionService({
    uploadImpl: () => {
      throw new Error('upload fail');
    },
  });
  const uploadFail = await uploadFailService.createSubmission({
    authorAccountId: 2,
    title: 'A',
    authorNames: 'B',
    affiliationOrContact: 'C',
    abstract: 'D',
    keywords: 'E',
    file: { name: 'ok.pdf', sizeMb: 1 },
  });
  assert.equal(uploadFail.code, 'UPLOAD_FAILED');

  const missingSub = await service.replaceManuscript({ submissionId: 999, file: { name: 'x.pdf', sizeMb: 1 } });
  assert.equal(missingSub.code, 'SUBMISSION_NOT_FOUND');

  const submissionNoManuscript = dataStore.insert('submissions', { authorAccountId: 1, title: 'No manuscript' });
  const missingCurrent = await service.replaceManuscript({ submissionId: submissionNoManuscript.id, file: { name: 'x.pdf', sizeMb: 1 } });
  assert.equal(missingCurrent.code, 'MANUSCRIPT_NOT_FOUND');

  const submission = dataStore.insert('submissions', {
    authorAccountId: 1,
    title: 'Paper',
    authorNames: 'A',
    affiliationOrContact: 'C',
    abstract: 'D',
    keywords: 'E',
    status: 'submitted',
  });
  const current = dataStore.insert('manuscripts', {
    submissionId: submission.id,
    fileName: 'paper.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/paper.pdf',
    version: 2,
    isCurrent: true,
    uploadedAt: 'now',
  });
  const invalidReplace = await service.replaceManuscript({ submissionId: submission.id, file: { name: 'bad.bmp', sizeMb: 1 } });
  assert.equal(invalidReplace.code, 'VALIDATION_ERROR');

  const { service: replaceUploadFailService, dataStore: replaceFailStore } = buildSubmissionService({
    uploadImpl: () => {
      throw new Error('upload fail');
    },
  });
  const sub2 = replaceFailStore.insert('submissions', {
    authorAccountId: 1,
    title: 'Paper',
    authorNames: 'A',
    affiliationOrContact: 'C',
    abstract: 'D',
    keywords: 'E',
  });
  replaceFailStore.insert('manuscripts', {
    submissionId: sub2.id,
    fileName: 'paper.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/paper.pdf',
    version: 1,
    isCurrent: true,
    uploadedAt: 'now',
  });
  const replaceUploadFail = await replaceUploadFailService.replaceManuscript({
    submissionId: sub2.id,
    file: { name: 'paper-v2.pdf', sizeMb: 1 },
  });
  assert.equal(replaceUploadFail.code, 'UPLOAD_FAILED');

  const replaced = await service.replaceManuscript({
    submissionId: submission.id,
    file: { name: 'paper-v3.pdf', sizeMb: 1 },
  });
  assert.equal(replaced.ok, true);
  assert.equal(dataStore.findById('manuscripts', current.id).isCurrent, false);
  assert.equal(replaced.manuscript.version, 3);

  const badDraftSave = service.saveDraft({ authorAccountId: 1, title: '', identifier: '', payload: {} });
  assert.equal(badDraftSave.code, 'DRAFT_MINIMUM_REQUIRED');

  const savedWithIdentifier = service.saveDraft({
    authorAccountId: 1,
    title: '',
    identifier: 'ID-ONLY',
    payload: {},
  });
  assert.equal(savedWithIdentifier.ok, true);
  assert.equal(savedWithIdentifier.draft.title, 'ID-ONLY');

  const badFileDraft = service.saveDraft({
    authorAccountId: 1,
    title: 'Bad file',
    payload: { file: { name: 'bad.bmp', sizeMb: 1 } },
  });
  assert.equal(badFileDraft.code, 'UPLOAD_FAILED');

  const { service: persistThrowSvc } = buildSubmissionService({
    uploadImpl: () => {
      throw new Error('boom');
    },
  });
  const persistThrow = persistThrowSvc.saveDraft({
    authorAccountId: 1,
    title: 'Throws',
    payload: { file: { name: 'ok.pdf', sizeMb: 1 } },
  });
  assert.equal(persistThrow.code, 'UPLOAD_FAILED');

  const updateWrongOwner = service.saveDraft({
    authorAccountId: 2,
    submissionId: savedWithIdentifier.draft.id,
    title: 'x',
    payload: {},
  });
  assert.equal(updateWrongOwner.code, 'DRAFT_NOT_FOUND');

  const updateOk = service.saveDraft({
    authorAccountId: 1,
    submissionId: savedWithIdentifier.draft.id,
    title: 'updated title',
    payload: { authorNames: 'AA', affiliationOrContact: 'Dept' },
  });
  assert.equal(updateOk.ok, true);
  assert.equal(updateOk.draft.status, 'draft');
  dataStore.updateById('submissions', savedWithIdentifier.draft.id, { title: '' });
  const updateIdentifierFallback = service.saveDraft({
    authorAccountId: 1,
    submissionId: savedWithIdentifier.draft.id,
    title: '',
    identifier: 'IDENT-FALLBACK',
    payload: {},
  });
  assert.equal(updateIdentifierFallback.ok, true);
  assert.equal(updateIdentifierFallback.draft.title, 'IDENT-FALLBACK');

  const draftWithFile = service.saveDraft({
    authorAccountId: 1,
    title: 'Draft with file',
    payload: { file: { name: 'draft.pdf', sizeMb: 1 } },
  });
  const draftWithFileUpdate = service.saveDraft({
    authorAccountId: 1,
    submissionId: draftWithFile.draft.id,
    title: 'Draft with file v2',
    payload: { file: { name: 'draft2.pdf', sizeMb: 1 } },
  });
  assert.equal(draftWithFileUpdate.ok, true);

  const drafts = service.listDrafts({ authorAccountId: 1 });
  assert.ok(drafts.length > 0);

  dataStore.updateById('submissions', submission.id, { status: 'accepted' });
  const submittedByAuthor = service.listSubmittedByAuthor({ authorAccountId: 1 });
  assert.ok(submittedByAuthor.some((row) => row.id === submission.id));

  const resumeFail = service.resumeDraft({ authorAccountId: 3, submissionId: savedWithIdentifier.draft.id });
  assert.equal(resumeFail.ok, false);
  const resumeOk = service.resumeDraft({ authorAccountId: 1, submissionId: savedWithIdentifier.draft.id });
  assert.equal(resumeOk.ok, true);

  const submitMissing = await service.submitDraft({ authorAccountId: 99, submissionId: 777 });
  assert.equal(submitMissing.code, 'DRAFT_NOT_FOUND');
  service.setSubmissionWindowOpen(false);
  const submitClosed = await service.submitDraft({ authorAccountId: 1, submissionId: savedWithIdentifier.draft.id });
  assert.equal(submitClosed.code, 'SUBMISSION_WINDOW_CLOSED');
  service.setSubmissionWindowOpen(true);

  const invalidToSubmit = service.saveDraft({
    authorAccountId: 1,
    title: 'No manuscript fields',
    payload: { authorNames: '', affiliationOrContact: '', abstract: '', keywords: '' },
  });
  const submitInvalid = await service.submitDraft({ authorAccountId: 1, submissionId: invalidToSubmit.draft.id });
  assert.equal(submitInvalid.code, 'VALIDATION_ERROR');

  const readyDraft = service.saveDraft({
    authorAccountId: 1,
    title: 'Ready',
    payload: {
      authorNames: 'A',
      affiliationOrContact: 'C',
      abstract: 'D',
      keywords: 'K',
      file: { name: 'ready.pdf', sizeMb: 1 },
    },
  });
  const submitOk = await service.submitDraft({ authorAccountId: 1, submissionId: readyDraft.draft.id });
  assert.equal(submitOk.ok, true);
  assert.equal(submitOk.submission.status, 'submitted');

  const readyDraftWithNewFile = service.saveDraft({
    authorAccountId: 1,
    title: 'Ready with replacement',
    payload: {
      authorNames: 'A',
      affiliationOrContact: 'C',
      abstract: 'D',
      keywords: 'K',
      file: { name: 'seed.pdf', sizeMb: 1 },
    },
  });
  const submitWithDirectFile = await service.submitDraft({
    authorAccountId: 1,
    submissionId: readyDraftWithNewFile.draft.id,
    file: { name: 'direct.pdf', sizeMb: 1 },
  });
  assert.equal(submitWithDirectFile.ok, true);

  dataStore.updateById('submissions', readyDraftWithNewFile.draft.id, { status: 'submitted' });
  const resumeWrongStatus = service.resumeDraft({
    authorAccountId: 1,
    submissionId: readyDraftWithNewFile.draft.id,
  });
  assert.equal(resumeWrongStatus.ok, false);
});

test('review service covers assignment, invitation, form access, review submit, and decision branches', async () => {
  const dataStore = new DataStore();
  const notificationLogs = [];
  const notificationService = {
    send: async ({ type, recipient }) => {
      if (type === 'review_invitation' && recipient === 2) {
        throw new Error('send fail');
      }
      if (type === 'review_declined') {
        throw new Error('decline fail');
      }
      if (type === 'reviews_complete') {
        throw new Error('notify fail');
      }
      return { status: 'sent' };
    },
    logNonBlockingFailure: (entry) => {
      notificationLogs.push(entry);
    },
    notifyAuthorDecision: async () => ({ status: 'sent' }),
  };
  const service = new ReviewService({ dataStore, notificationService });

  const reviewer1 = dataStore.insert('accounts', { email: 'r1@example.com', roles: ['reviewer'] });
  const reviewer2 = dataStore.insert('accounts', { email: 'r2@example.com', roles: ['reviewer'] });
  const reviewer3 = dataStore.insert('accounts', { email: 'r3@example.com', roles: ['reviewer'] });
  const reviewer4 = dataStore.insert('accounts', { email: 'r4@example.com', roles: ['reviewer'] });
  const nonReviewer = dataStore.insert('accounts', { email: 'x@example.com', roles: ['author'] });

  const submission = dataStore.insert('submissions', {
    authorAccountId: 500,
    title: 'Paper',
    abstract: 'A',
    status: 'submitted',
  });
  dataStore.insert('manuscripts', {
    submissionId: submission.id,
    fileName: 'paper.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/paper.pdf',
    version: 1,
    isCurrent: true,
    uploadedAt: 'now',
  });

  const badEmail = await service.assignReviewers({
    submissionId: submission.id,
    reviewerEmails: ['missing@example.com'],
  });
  assert.equal(badEmail.ok, false);

  const wrongCount = await service.assignReviewers({
    submissionId: submission.id,
    reviewerIds: [reviewer1.id, reviewer2.id],
  });
  assert.equal(wrongCount.ok, false);

  const noSubmission = await service.assignReviewers({
    submissionId: 999,
    reviewerIds: [reviewer1.id, reviewer2.id, reviewer3.id],
  });
  assert.equal(noSubmission.ok, false);

  const badReviewer = await service.assignReviewers({
    submissionId: submission.id,
    reviewerIds: [reviewer1.id, reviewer2.id, nonReviewer.id],
  });
  assert.equal(badReviewer.ok, false);
  assert.match(badReviewer.errors.form, /invalid/);

  for (let i = 0; i < 5; i += 1) {
    dataStore.insert('review_assignments', {
      submissionId: i + 1000,
      reviewerAccountId: reviewer3.id,
      status: i % 2 === 0 ? 'invited' : 'accepted',
    });
  }
  const overloaded = await service.assignReviewers({
    submissionId: submission.id,
    reviewerIds: [reviewer1.id, reviewer2.id, reviewer3.id],
  });
  assert.equal(overloaded.ok, false);
  assert.match(overloaded.errors.form, /exceeds workload/);

  const assignOk = await service.assignReviewers({
    submissionId: submission.id,
    reviewerEmails: ['r1@example.com', ' r2@example.com ', 'r4@example.com'],
    reviewDeadline: '2099-01-01T00:00:00Z',
  });
  assert.equal(assignOk.ok, true);
  assert.equal(assignOk.assignments.length, 3);
  assert.equal(assignOk.warnings.length, 1);
  const directory = service.listReviewerDirectory();
  assert.ok(directory.some((row) => row.id === reviewer3.id && row.availableSlots === 0));

  const duplicate = await service.assignReviewers({
    submissionId: submission.id,
    reviewerIds: [reviewer1.id, reviewer2.id, reviewer4.id],
  });
  assert.equal(duplicate.ok, false);
  assert.match(duplicate.errors.form, /already assigned/);

  const invitations = service.listInvitations({ reviewerAccountId: reviewer1.id });
  assert.equal(invitations.length, 1);
  assert.match(invitations[0].manuscriptUrl, /uploads/);

  const missingAssignment = await service.respondInvitation({ assignmentId: 999, reviewerAccountId: reviewer1.id, response: 'accept' });
  assert.equal(missingAssignment.ok, false);
  const unauthorized = await service.respondInvitation({
    assignmentId: assignOk.assignments[0].id,
    reviewerAccountId: reviewer2.id,
    response: 'accept',
  });
  assert.equal(unauthorized.ok, false);
  const badResponse = await service.respondInvitation({
    assignmentId: assignOk.assignments[0].id,
    reviewerAccountId: reviewer1.id,
    response: 'maybe',
  });
  assert.equal(badResponse.ok, false);

  const declined = await service.respondInvitation({
    assignmentId: assignOk.assignments[0].id,
    reviewerAccountId: reviewer1.id,
    response: 'decline',
  });
  assert.equal(declined.ok, true);
  assert.ok(notificationLogs.some((log) => log.type === 'review_declined'));

  await service.respondInvitation({ assignmentId: assignOk.assignments[0].id, reviewerAccountId: reviewer1.id, response: 'accept' });
  await service.respondInvitation({ assignmentId: assignOk.assignments[1].id, reviewerAccountId: reviewer2.id, response: 'accept' });
  await service.respondInvitation({ assignmentId: assignOk.assignments[2].id, reviewerAccountId: reviewer4.id, response: 'accept' });

  const deniedAccess = service.getReviewForm({ assignmentId: assignOk.assignments[0].id, reviewerAccountId: 999 });
  assert.equal(deniedAccess.ok, false);
  const invitedAssignment = dataStore.insert('review_assignments', {
    submissionId: submission.id,
    reviewerAccountId: reviewer1.id,
    status: 'invited',
  });
  const deniedByStatus = service.getReviewForm({
    assignmentId: invitedAssignment.id,
    reviewerAccountId: reviewer1.id,
  });
  assert.equal(deniedByStatus.ok, false);

  const expiredAssignment = dataStore.insert('review_assignments', {
    submissionId: submission.id,
    reviewerAccountId: reviewer1.id,
    status: 'accepted',
    reviewDeadline: '2000-01-01T00:00:00Z',
  });
  const expiredAccess = service.getReviewForm({ assignmentId: expiredAssignment.id, reviewerAccountId: reviewer1.id });
  assert.equal(expiredAccess.ok, false);

  const noFormYet = service.getReviewForm({ assignmentId: assignOk.assignments[0].id, reviewerAccountId: reviewer1.id });
  assert.equal(noFormYet.ok, true);
  assert.equal(noFormYet.form, null);
  dataStore.insert('review_forms', {
    assignmentId: assignOk.assignments[0].id,
    scores: 'seed',
    comments: 'seed',
    recommendation: 'accept',
    status: 'in_progress',
  });
  const existingForm = service.getReviewForm({ assignmentId: assignOk.assignments[0].id, reviewerAccountId: reviewer1.id });
  assert.equal(existingForm.ok, true);
  assert.ok(existingForm.form);

  const saveDenied = service.saveReviewDraft({ assignmentId: assignOk.assignments[0].id, reviewerAccountId: 999 });
  assert.equal(saveDenied.ok, false);

  const createdDraft = service.saveReviewDraft({
    assignmentId: assignOk.assignments[2].id,
    reviewerAccountId: reviewer4.id,
    scores: '2',
    comments: 'created branch',
    recommendation: 'reject',
  });
  assert.equal(createdDraft.ok, true);

  const updatedDraft = service.saveReviewDraft({
    assignmentId: assignOk.assignments[0].id,
    reviewerAccountId: reviewer1.id,
    scores: '3',
    comments: 'draft',
    recommendation: 'accept',
  });
  assert.equal(updatedDraft.ok, true);
  const updatedDraftAgain = service.saveReviewDraft({
    assignmentId: assignOk.assignments[0].id,
    reviewerAccountId: reviewer1.id,
    scores: '4',
    comments: 'updated',
    recommendation: 'accept',
  });
  assert.equal(updatedDraftAgain.ok, true);

  const submitDenied = await service.submitReview({ assignmentId: assignOk.assignments[0].id, reviewerAccountId: 999, scores: '1', comments: 'x', recommendation: 'reject' });
  assert.equal(submitDenied.ok, false);
  const submitMissingFields = await service.submitReview({
    assignmentId: assignOk.assignments[0].id,
    reviewerAccountId: reviewer1.id,
    scores: '',
    comments: '',
    recommendation: '',
  });
  assert.equal(submitMissingFields.ok, false);

  const firstSubmit = await service.submitReview({
    assignmentId: assignOk.assignments[0].id,
    reviewerAccountId: reviewer1.id,
    scores: '4',
    comments: 'ok',
    recommendation: 'accept',
  });
  assert.equal(firstSubmit.ok, true);
  assert.equal(firstSubmit.submittedCount, 1);

  await service.submitReview({
    assignmentId: assignOk.assignments[1].id,
    reviewerAccountId: reviewer2.id,
    scores: '4',
    comments: 'ok',
    recommendation: 'accept',
  });
  const thirdSubmit = await service.submitReview({
    assignmentId: assignOk.assignments[2].id,
    reviewerAccountId: reviewer4.id,
    scores: '4',
    comments: 'ok',
    recommendation: 'accept',
  });
  assert.equal(thirdSubmit.ok, true);
  assert.equal(dataStore.findById('submissions', submission.id).status, 'reviews_complete');
  assert.ok(notificationLogs.some((log) => log.type === 'reviews_complete'));

  const ready = service.listPapersReadyForDecision();
  assert.ok(ready.some((row) => row.id === submission.id));
  const submittedPapers = service.listSubmittedPapers();
  assert.ok(submittedPapers.some((row) => row.id === submission.id));
  const acceptedAssignments = service.listAcceptedAssignments({ reviewerAccountId: reviewer1.id });
  assert.ok(acceptedAssignments.length >= 1);
  dataStore.insert('review_assignments', {
    submissionId: 999999,
    reviewerAccountId: reviewer1.id,
    status: 'accepted',
  });
  const acceptedWithMissingSubmission = service.listAcceptedAssignments({ reviewerAccountId: reviewer1.id });
  assert.ok(acceptedWithMissingSubmission.some((row) => row.submissionId === 999999));

  const setNotEnough = service.getEditorReviewSet({ submissionId: 12345 });
  assert.equal(setNotEnough.ok, false);

  const setEnough = service.getEditorReviewSet({ submissionId: submission.id });
  assert.equal(setEnough.ok, true);
  assert.equal(setEnough.reviews.length, 3);

  const summaryNone = service.getSubmissionDecisionSummary({ submissionId: 9999 });
  assert.equal(summaryNone, null);
  const summary = service.getSubmissionDecisionSummary({ submissionId: submission.id });
  assert.equal(summary.completedReviewCount, 3);

  const decisionMissingSet = await service.submitDecision({ submissionId: 9999, editorAccountId: 1, decision: 'accept' });
  assert.equal(decisionMissingSet.ok, false);

  for (let i = 0; i < 3; i += 1) {
    const assignment = dataStore.insert('review_assignments', {
      submissionId: 444444,
      reviewerAccountId: reviewer1.id + i,
      status: 'accepted',
    });
    dataStore.insert('review_forms', {
      assignmentId: assignment.id,
      status: 'submitted',
      scores: '4',
      comments: 'x',
      recommendation: 'accept',
    });
  }
  const decisionMissingSubmission = await service.submitDecision({
    submissionId: 444444,
    editorAccountId: 1,
    decision: 'accept',
  });
  assert.equal(decisionMissingSubmission.ok, false);
  assert.match(decisionMissingSubmission.errors.form, /Submission not found/);

  const decisionInvalid = await service.submitDecision({ submissionId: submission.id, editorAccountId: 1, decision: 'maybe' });
  assert.equal(decisionInvalid.ok, false);

  const decisionAccepted = await service.submitDecision({
    submissionId: submission.id,
    editorAccountId: 1,
    decision: 'accept',
    rationale: 'good',
  });
  assert.equal(decisionAccepted.ok, true);
  assert.equal(decisionAccepted.notificationWarning, null);
  const acceptNotice = dataStore.findOne('author_notifications', (row) => row.submissionId === submission.id);
  assert.match(acceptNotice.message, /approved/i);

  const decided = service.listDecidedPapers();
  assert.ok(decided.some((row) => row.id === submission.id && row.decision === 'accept'));
  const decidedFallbackSubmission = dataStore.insert('submissions', {
    authorAccountId: 111,
    title: 'Fallback decided',
    status: 'rejected',
  });
  const decidedFallbackList = service.listDecidedPapers();
  assert.ok(decidedFallbackList.some((row) => row.id === decidedFallbackSubmission.id && row.decision === 'rejected'));

  const submission2 = dataStore.insert('submissions', {
    authorAccountId: 700,
    title: 'No notifier',
    status: 'reviews_complete',
  });
  for (let i = 0; i < 3; i += 1) {
    const assignment = dataStore.insert('review_assignments', {
      submissionId: submission2.id,
      reviewerAccountId: reviewer1.id + i,
      status: 'accepted',
    });
    dataStore.insert('review_forms', { assignmentId: assignment.id, status: 'submitted' });
  }
  const serviceNoNotifier = new ReviewService({ dataStore, notificationService: {} });
  const decisionNoNotifier = await serviceNoNotifier.submitDecision({
    submissionId: submission2.id,
    editorAccountId: 1,
    decision: 'reject',
  });
  assert.equal(decisionNoNotifier.ok, true);
  assert.match(decisionNoNotifier.notificationWarning, /delivery failed/);
  const rejectNotice = dataStore.findOne('author_notifications', (row) => row.submissionId === submission2.id);
  assert.match(rejectNotice.message, /not accepted/i);
});

test('review service list/default and no-log catch branches', async () => {
  const dataStore = new DataStore();
  const service = new ReviewService({
    dataStore,
    notificationService: {
      send: async () => {
        throw new Error('send fail');
      },
      notifyAuthorDecision: async () => ({ status: 'failed' }),
    },
  });

  const reviewer1 = dataStore.insert('accounts', { email: 'rr1@example.com', roles: ['reviewer'] });
  const reviewer2 = dataStore.insert('accounts', { email: 'rr2@example.com', roles: ['reviewer'] });
  const reviewer3 = dataStore.insert('accounts', { email: 'rr3@example.com', roles: ['reviewer'] });
  const submissionSubmitted = dataStore.insert('submissions', { title: 'S', status: 'submitted', abstract: 'A', authorAccountId: 1 });
  const submissionUnderReview = dataStore.insert('submissions', { title: 'U', status: 'under_review', abstract: 'B', authorAccountId: 2 });
  const submissionReady = dataStore.insert('submissions', { title: 'R', status: 'reviews_complete', abstract: 'C', authorAccountId: 3 });
  const submissionAccepted = dataStore.insert('submissions', { title: 'A', status: 'accepted', abstract: 'D', authorAccountId: 4 });
  const submissionRejected = dataStore.insert('submissions', { title: 'J', status: 'rejected', abstract: 'E', authorAccountId: 5 });
  dataStore.insert('manuscripts', {
    submissionId: submissionReady.id,
    fileName: 'ready.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/ready.pdf',
    version: 1,
    isCurrent: true,
    uploadedAt: 'now',
  });
  dataStore.insert('decisions', {
    submissionId: submissionAccepted.id,
    editorAccountId: 99,
    decision: 'accept',
    rationale: '',
    decidedAt: '',
  });

  const submitted = service.listSubmittedPapers();
  assert.ok(submitted.some((row) => row.id === submissionSubmitted.id));
  assert.ok(submitted.some((row) => row.id === submissionUnderReview.id));
  assert.ok(submitted.some((row) => row.id === submissionReady.id));
  const ready = service.listPapersReadyForDecision();
  assert.ok(ready.some((row) => row.id === submissionReady.id));
  const decided = service.listDecidedPapers();
  assert.ok(decided.some((row) => row.id === submissionAccepted.id && row.rationale === ''));
  assert.ok(decided.some((row) => row.id === submissionRejected.id && row.decision === 'rejected'));

  dataStore.insert('review_assignments', {
    submissionId: 999999,
    reviewerAccountId: reviewer1.id,
    status: 'invited',
    reviewDeadline: null,
  });
  const invitations = service.listInvitations({ reviewerAccountId: reviewer1.id });
  assert.ok(invitations.some((row) => row.title === '' && row.reviewDeadline === ''));

  const assignMissingReviewer = await service.assignReviewers({
    submissionId: submissionSubmitted.id,
    reviewerIds: [reviewer1.id, reviewer2.id, 999999],
  });
  assert.equal(assignMissingReviewer.ok, false);
  assert.match(assignMissingReviewer.errors.form, /invalid/);

  const assignNoArray = await service.assignReviewers({
    submissionId: submissionSubmitted.id,
    reviewerIds: 'not-array',
    reviewerEmails: [],
  });
  assert.equal(assignNoArray.ok, false);

  const assigned = await service.assignReviewers({
    submissionId: submissionSubmitted.id,
    reviewerIds: [reviewer1.id, reviewer2.id, reviewer3.id],
  });
  assert.equal(assigned.ok, true);
  const noIdentityCheck = await service.respondInvitation({
    assignmentId: assigned.assignments[0].id,
    reviewerAccountId: null,
    response: 'accept',
  });
  assert.equal(noIdentityCheck.ok, true);
  await service.respondInvitation({ assignmentId: assigned.assignments[1].id, reviewerAccountId: reviewer2.id, response: 'accept' });
  await service.respondInvitation({ assignmentId: assigned.assignments[2].id, reviewerAccountId: reviewer3.id, response: 'accept' });

  await service.submitReview({
    assignmentId: assigned.assignments[0].id,
    reviewerAccountId: reviewer1.id,
    scores: '4',
    comments: 'ok',
    recommendation: 'accept',
  });
  await service.submitReview({
    assignmentId: assigned.assignments[1].id,
    reviewerAccountId: reviewer2.id,
    scores: '4',
    comments: 'ok',
    recommendation: 'accept',
  });
  const third = await service.submitReview({
    assignmentId: assigned.assignments[2].id,
    reviewerAccountId: reviewer3.id,
    scores: '4',
    comments: 'ok',
    recommendation: 'accept',
  });
  assert.equal(third.ok, true);

  for (let i = 0; i < 3; i += 1) {
    const assignment = dataStore.insert('review_assignments', {
      submissionId: submissionReady.id,
      reviewerAccountId: reviewer1.id + i,
      status: 'accepted',
    });
    dataStore.insert('review_forms', {
      assignmentId: assignment.id,
      status: 'submitted',
      scores: '3',
      comments: 'x',
      recommendation: 'accept',
    });
  }
  const decision = await service.submitDecision({
    submissionId: submissionReady.id,
    editorAccountId: 55,
    decision: 'reject',
  });
  assert.equal(decision.ok, true);
  assert.match(decision.notificationWarning, /delivery failed/);

  dataStore.insert('review_forms', {
    assignmentId: 999999,
    status: 'submitted',
  });
  const count = service._countSubmittedReviewsForSubmission(submissionReady.id);
  assert.ok(count >= 3);
});

test('submission service fallback-field branches and schedule internals', () => {
  const { dataStore, service } = buildSubmissionService();
  const draft = service.saveDraft({
    authorAccountId: 1,
    title: 'Original title',
    payload: {
      authorNames: 'Existing Author',
      affiliationOrContact: 'Existing Affiliation',
      abstract: 'A',
      keywords: 'K',
    },
  });
  const updatedUsingExisting = service.saveDraft({
    authorAccountId: 1,
    submissionId: draft.draft.id,
    title: '',
    identifier: 'keep-existing',
    payload: { authorNames: '', affiliationOrContact: '' },
  });
  assert.equal(updatedUsingExisting.ok, true);
  assert.equal(updatedUsingExisting.draft.title, 'Original title');
  assert.equal(updatedUsingExisting.draft.authorNames, 'Existing Author');
  assert.equal(updatedUsingExisting.draft.affiliationOrContact, 'Existing Affiliation');

  const blankDraft = service.saveDraft({
    authorAccountId: 1,
    title: 'Blank',
    payload: {},
  });
  const updatedToBlanks = service.saveDraft({
    authorAccountId: 1,
    submissionId: blankDraft.draft.id,
    title: '',
    identifier: 'Blank',
    payload: { authorNames: '', affiliationOrContact: '' },
  });
  assert.equal(updatedToBlanks.ok, true);
  assert.equal(updatedToBlanks.draft.authorNames, '');
  assert.equal(updatedToBlanks.draft.affiliationOrContact, '');

  const scheduleDataStore = new DataStore();
  const scheduleService = new ScheduleService({
    dataStore: scheduleDataStore,
    publicationService: new PublicationService(),
    notificationService: new NotificationService({ dataStore: scheduleDataStore }),
  });
  assert.equal(scheduleService._isOutsideConferenceHours('2026-05-01T07:00:00Z'), true);
  assert.equal(scheduleService._isOutsideConferenceHours('2026-05-01T21:00:00Z'), true);
  assert.equal(scheduleService._isOutsideConferenceHours('2026-05-01T10:00:00Z'), false);

  const resolvedFromRequest = scheduleService._resolveAcceptedSubmissionIds([1, 1, -2, 'x', 4]);
  assert.deepEqual(resolvedFromRequest, [1, 4]);
  const resolvedFromAccepted = scheduleService._resolveAcceptedSubmissionIds([]);
  assert.deepEqual(resolvedFromAccepted, []);

  const noOverlap = scheduleService._hasRoomOverlap([
    { room: 'R1', startTime: '2026-05-01T09:00:00Z', endTime: '2026-05-01T10:00:00Z' },
    { room: 'R1', startTime: '2026-05-01T10:00:00Z', endTime: '2026-05-01T11:00:00Z' },
  ]);
  assert.equal(noOverlap, false);

  const replacedNone = scheduleService._replacePreviousFinalSchedules({ nextFinalScheduleId: 1 });
  assert.deepEqual(replacedNone, []);
  scheduleDataStore.insert('schedules', { status: 'final' });
  scheduleDataStore.insert('schedules', { status: 'final' });
  const replacedSome = scheduleService._replacePreviousFinalSchedules({ nextFinalScheduleId: 99999 });
  assert.equal(replacedSome.length, 2);
  scheduleService._restorePreviousFinalSchedules([]);
  scheduleService._restorePreviousFinalSchedules(replacedSome);

  const submissionA = scheduleDataStore.insert('submissions', { authorAccountId: 77, status: 'accepted' });
  const submissionB = scheduleDataStore.insert('submissions', { authorAccountId: 77, status: 'accepted' });
  const submissionC = scheduleDataStore.insert('submissions', { authorAccountId: null, status: 'accepted' });
  const collectedAuthors = scheduleService._collectScheduledAuthors([
    { submissionId: submissionA.id },
    { submissionId: submissionB.id },
    { submissionId: submissionC.id },
    { submissionId: 999999 },
  ]);
  assert.equal(collectedAuthors.length, 1);
  assert.equal(collectedAuthors[0].authorAccountId, 77);
  assert.equal(collectedAuthors[0].submissionIds.length, 2);

  const scheduleDataStore2 = new DataStore();
  const scheduleService2 = new ScheduleService({
    dataStore: scheduleDataStore2,
    publicationService: new PublicationService(),
    notificationService: {
      send: async () => ({ status: 'sent' }),
    },
  });
  const noWarnPromise = scheduleService2._sendScheduleNotifications({
    scheduleId: 1,
    items: [{ submissionId: 123 }],
  });
  assert.equal(typeof noWarnPromise.then, 'function');
});

test('review service default fields saturation for mapping branches', () => {
  const dataStore = new DataStore();
  const service = new ReviewService({
    dataStore,
    notificationService: {
      send: async () => ({ status: 'sent' }),
      notifyAuthorDecision: async () => ({ status: 'sent' }),
    },
  });

  const reviewer = dataStore.insert('accounts', { email: 'mapped@example.com', roles: ['reviewer'] });
  const subNoManuscript = dataStore.insert('submissions', {
    title: 'No Manuscript',
    abstract: '',
    status: 'reviews_complete',
    authorAccountId: 1,
  });
  const subWithManuscript = dataStore.insert('submissions', {
    title: 'With Manuscript',
    abstract: 'A',
    status: 'reviews_complete',
    authorAccountId: 2,
  });
  dataStore.insert('manuscripts', {
    submissionId: subWithManuscript.id,
    fileName: 'mapped.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/mapped.pdf',
    version: 1,
    isCurrent: true,
    uploadedAt: 'now',
  });
  dataStore.insert('submissions', {
    title: 'Decided No Decision',
    abstract: '',
    status: 'accepted',
    authorAccountId: 3,
  });
  const decidedWithRecord = dataStore.insert('submissions', {
    title: 'Decided With Decision',
    abstract: '',
    status: 'accepted',
    authorAccountId: 4,
  });
  dataStore.insert('decisions', {
    submissionId: decidedWithRecord.id,
    editorAccountId: 1,
    decision: 'accept',
    rationale: '',
    decidedAt: '',
  });
  const subDecisionRich = dataStore.insert('submissions', {
    title: 'Decision Rich',
    abstract: '',
    status: 'rejected',
    authorAccountId: 5,
  });
  dataStore.insert('decisions', {
    submissionId: subDecisionRich.id,
    editorAccountId: 1,
    decision: 'reject',
    rationale: 'detailed',
    decidedAt: '2026-01-01T00:00:00Z',
  });

  const assignments = [
    dataStore.insert('review_assignments', {
      submissionId: subWithManuscript.id,
      reviewerAccountId: reviewer.id,
      status: 'invited',
      reviewDeadline: null,
    }),
    dataStore.insert('review_assignments', {
      submissionId: subWithManuscript.id,
      reviewerAccountId: reviewer.id,
      status: 'invited',
      reviewDeadline: '2099-01-01T00:00:00Z',
    }),
    dataStore.insert('review_assignments', {
      submissionId: subNoManuscript.id,
      reviewerAccountId: reviewer.id,
      status: 'accepted',
      reviewDeadline: '2099-01-01T00:00:00Z',
    }),
  ];
  dataStore.insert('review_forms', {
    assignmentId: assignments[1].id,
    status: 'submitted',
    scores: '3',
    comments: 'x',
    recommendation: 'accept',
  });

  const submitted = service.listSubmittedPapers();
  assert.ok(submitted.some((row) => row.manuscriptUrl === ''));
  assert.ok(submitted.some((row) => row.manuscriptUrl.includes('/assets/uploads/')));

  const ready = service.listPapersReadyForDecision();
  assert.ok(ready.some((row) => row.manuscriptFileName === ''));
  assert.ok(ready.some((row) => row.manuscriptFileName === 'mapped.pdf'));

  const decided = service.listDecidedPapers();
  assert.ok(decided.some((row) => row.decision === 'accepted' || row.decision === 'accept'));
  assert.ok(decided.some((row) => row.rationale === ''));
  assert.ok(decided.some((row) => row.rationale === 'detailed'));
  assert.ok(decided.some((row) => row.decidedAt === ''));
  assert.ok(decided.some((row) => row.decidedAt === '2026-01-01T00:00:00Z'));

  const summaryNoDecision = service.getSubmissionDecisionSummary({ submissionId: subWithManuscript.id });
  assert.equal(summaryNoDecision.decision, null);
  dataStore.insert('manuscripts', {
    submissionId: subDecisionRich.id,
    fileName: 'decision.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/decision.pdf',
    version: 1,
    isCurrent: true,
    uploadedAt: 'now',
  });
  const summaryDecision = service.getSubmissionDecisionSummary({ submissionId: subDecisionRich.id });
  assert.equal(summaryDecision.decision, 'reject');
  assert.equal(summaryDecision.manuscriptFileName, 'decision.pdf');
  const acceptedWithManuscript = service.listDecidedPapers();
  assert.ok(acceptedWithManuscript.some((row) => row.manuscriptUrl.includes('/assets/uploads/')));

  const invitations = service.listInvitations({ reviewerAccountId: reviewer.id });
  assert.ok(invitations.some((row) => row.reviewDeadline === ''));
  assert.ok(invitations.some((row) => row.reviewDeadline === '2099-01-01T00:00:00Z'));

  dataStore.insert('review_assignments', {
    submissionId: subWithManuscript.id,
    reviewerAccountId: reviewer.id,
    status: 'accepted',
  });
  const acceptedAssignments = service.listAcceptedAssignments({ reviewerAccountId: reviewer.id });
  assert.ok(acceptedAssignments.some((row) => row.manuscriptFileName === 'mapped.pdf'));
});

test('misc service branch saturation for auth/payment/notification/schedule internals', async () => {
  const dataStore = new DataStore();
  const notificationService = new NotificationService({ dataStore });
  const auth = new AuthService({
    dataStore,
    sessionService: { createSession: (account) => ({ token: 't', accountId: account.id, roles: account.roles || [] }) },
  });
  dataStore.insert('accounts', {
    email: 'upper@example.com',
    passwordHash: require('crypto').createHash('sha256').update('Pass123!').digest('hex'),
    roles: ['attendee'],
  });
  const upperLogin = auth.login({ identifier: 'UPPER@EXAMPLE.COM', password: 'Pass123!' });
  assert.equal(upperLogin.ok, true);

  const pricing = new PricingService({ dataStore });
  const ticketService = new TicketService({ dataStore, notificationService });
  const payment = new PaymentService({
    dataStore,
    paymentGatewayService: new PaymentGatewayService(),
    pricingService: pricing,
    ticketService,
  });
  assert.equal(payment.sanitizePaymentPayload(null), null);

  notificationService.logNonBlockingFailure({
    type: 'schedule_notice',
    context: { scheduleId: 10, recipient: 5 },
  });
  notificationService.logNonBlockingFailure({
    type: 'empty_notice',
    context: {},
  });
  const scheduleLog = dataStore.findOne('notification_logs', (row) => row.notificationType === 'schedule_notice');
  assert.equal(scheduleLog.relatedEntityId, 10);

  const scheduleService = new ScheduleService({
    dataStore,
    publicationService: new PublicationService(),
    notificationService: {
      send: async () => {
        throw new Error('boom');
      },
    },
  });
  const warning = await scheduleService._sendScheduleNotifications({
    scheduleId: 1,
    items: [],
  });
  assert.match(warning, /recipient public/);

  dataStore.insert('schedules', { status: 'final', publishedAt: '2026-01-01T00:00:00Z' });
  const notFoundById = scheduleService.getPublishedSchedule({ scheduleId: 9999 });
  assert.equal(notFoundById, null);
});

test('branch hammer matrix across remaining service fallbacks', async () => {
  const ds = new DataStore();
  const uploadService = {
    uploadManuscript: (file) => ({ storageRef: `/assets/uploads/${file.name || 'default.pdf'}`, uploadedAt: 'now' }),
  };
  const submissionService = new SubmissionService({ dataStore: ds, fileUploadService: uploadService });

  const draftNoFile = submissionService.saveDraft({
    authorAccountId: 1,
    title: 'Hammer Draft',
    payload: { authorNames: 'A', affiliationOrContact: 'B', abstract: 'C', keywords: 'K' },
  });
  assert.equal(draftNoFile.ok, true);
  const fileTooLarge = submissionService._persistDraftFile({
    draftId: draftNoFile.draft.id,
    file: { name: 'large.pdf', sizeMb: 50 },
  });
  assert.equal(fileTooLarge, false);
  ds.insert('submissions', { authorAccountId: 1, title: 'Submitted', status: 'submitted' });
  const submittedWithoutManuscriptList = submissionService.listSubmittedByAuthor({ authorAccountId: 1 });
  assert.ok(submittedWithoutManuscriptList.some((row) => row.manuscriptUrl === ''));
  const draftsWithoutManuscript = submissionService.listDrafts({ authorAccountId: 1 });
  assert.ok(draftsWithoutManuscript.some((row) => row.manuscriptUrl === ''));

  const replaceSub = ds.insert('submissions', {
    authorAccountId: 1,
    title: 'Replace',
    authorNames: 'A',
    affiliationOrContact: 'B',
    abstract: 'C',
    keywords: 'K',
  });
  ds.insert('manuscripts', {
    submissionId: replaceSub.id,
    fileName: 'v1.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/v1.pdf',
    version: undefined,
    isCurrent: true,
    uploadedAt: 'now',
  });
  const replaced = await submissionService.replaceManuscript({
    submissionId: replaceSub.id,
    file: { name: 'v2.pdf', sizeMb: 1 },
  });
  assert.equal(replaced.ok, true);
  assert.equal(replaced.manuscript.version, 2);

  const notifications = new NotificationService({ dataStore: ds });
  const reviewService = new ReviewService({ dataStore: ds, notificationService: notifications });
  const reviewerA = ds.insert('accounts', { email: 'ha@example.com', roles: ['reviewer'] });
  const reviewerB = ds.insert('accounts', { email: 'hb@example.com', roles: ['reviewer'] });
  const reviewerC = ds.insert('accounts', { email: 'hc@example.com', roles: ['reviewer'] });
  const sub = ds.insert('submissions', {
    authorAccountId: 123,
    title: 'Hammer Paper',
    abstract: '',
    status: 'submitted',
  });
  ds.insert('manuscripts', {
    submissionId: sub.id,
    fileName: 'hammer.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/hammer.pdf',
    version: 1,
    isCurrent: true,
    uploadedAt: 'now',
  });
  ds.insert('review_assignments', {
    submissionId: sub.id,
    reviewerAccountId: reviewerA.id,
    status: 'declined',
  });
  const assignWithDeclinedExisting = await reviewService.assignReviewers({
    submissionId: sub.id,
    reviewerIds: [reviewerA.id, reviewerB.id, reviewerC.id],
  });
  assert.equal(assignWithDeclinedExisting.ok, true);
  const resolveWithBlanks = reviewService._resolveReviewerIds({
    reviewerEmails: [' ', 'ha@example.com'],
  });
  assert.equal(resolveWithBlanks.ok, true);
  assert.equal(resolveWithBlanks.reviewerIds.length, 1);

  const responseNoLogService = new ReviewService({
    dataStore: ds,
    notificationService: {
      send: async () => {
        throw new Error('down');
      },
    },
  });
  const responseWithoutLogger = await responseNoLogService.respondInvitation({
    assignmentId: assignWithDeclinedExisting.assignments[0].id,
    reviewerAccountId: assignWithDeclinedExisting.assignments[0].reviewerAccountId,
    response: 'accept',
  });
  assert.equal(responseWithoutLogger.ok, true);

  const scheduleService = new ScheduleService({
    dataStore: ds,
    publicationService: new PublicationService(),
    notificationService: notifications,
  });
  const acceptedWithMissingFields = ds.insert('submissions', { status: 'accepted' });
  const acceptedList = scheduleService.listAcceptedSubmissions();
  assert.ok(acceptedList.some((row) => row.id === acceptedWithMissingFields.id && row.title === '' && row.authorAccountId === null));

  const draftSchedule = ds.insert('schedules', {
    status: 'draft',
    generatedAt: null,
    draftHtmlSnapshot: '',
    publishedAt: null,
    publishedHtmlSnapshot: '',
  });
  const listedDrafts = scheduleService.listDraftSchedules();
  assert.ok(listedDrafts.some((row) => row.id === draftSchedule.id && row.generatedAt === '' && row.hasPreview === false));
});

test('schedule service covers generation/edit/publish/get branches', async () => {
  const dataStore = new DataStore();
  const publicationService = new PublicationService();
  const notificationService = new NotificationService({ dataStore });
  const service = new ScheduleService({ dataStore, publicationService, notificationService });

  const noAccepted = service.generateDraftSchedule({ acceptedSubmissionIds: [] });
  assert.equal(noAccepted.ok, false);

  const rejected = dataStore.insert('submissions', { title: 'Rejected', status: 'rejected' });
  const invalidSelection = service.generateDraftSchedule({ acceptedSubmissionIds: [rejected.id] });
  assert.equal(invalidSelection.ok, false);

  service.setGenerationFailure(true);
  const generationFail = service.generateDraftSchedule({ acceptedSubmissionIds: [rejected.id, 999] });
  assert.equal(generationFail.ok, false);
  service.setGenerationFailure(false);

  const accepted1 = dataStore.insert('submissions', { title: 'A1', status: 'accepted', authorAccountId: 1, authorNames: 'One' });
  const accepted2 = dataStore.insert('submissions', { title: 'A2', status: 'accepted', authorAccountId: 2, authorNames: 'Two' });
  service.setGenerationFailure(true);
  const generationFailValidInput = service.generateDraftSchedule({ acceptedSubmissionIds: [accepted1.id, accepted2.id] });
  assert.equal(generationFailValidInput.ok, false);
  service.setGenerationFailure(false);

  service.setStorageFailure(true);
  const storageFail = service.generateDraftSchedule({ acceptedSubmissionIds: [accepted1.id, accepted2.id] });
  assert.equal(storageFail.ok, false);
  service.setStorageFailure(false);

  const generated = service.generateDraftSchedule({ acceptedSubmissionIds: [] });
  assert.equal(generated.ok, true);
  assert.equal(generated.items.length, 2);
  const drafts = service.listDraftSchedules();
  assert.equal(drafts.length, 1);

  const editMissing = service.editDraftSchedule({ scheduleId: 999, items: [] });
  assert.equal(editMissing.ok, false);
  const editCancel = service.editDraftSchedule({ scheduleId: generated.schedule.id, cancel: true });
  assert.equal(editCancel.ok, true);
  assert.equal(editCancel.cancelled, true);

  service.setStorageFailure(true);
  const editStorageFail = service.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: generated.items,
  });
  assert.equal(editStorageFail.ok, false);
  service.setStorageFailure(false);

  const missingFields = service.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: [{ id: generated.items[0].id, session: '', room: '', startTime: '', endTime: '' }],
  });
  assert.equal(missingFields.ok, false);

  const badOrder = service.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: [{ ...generated.items[0], startTime: '2026-05-01T10:00:00Z', endTime: '2026-05-01T09:00:00Z' }],
  });
  assert.equal(badOrder.ok, false);

  const outsideHours = service.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: [{ ...generated.items[0], startTime: 'invalid', endTime: '2026-05-01T09:00:00Z' }],
  });
  assert.equal(outsideHours.ok, false);

  const overlap = service.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: [
      { ...generated.items[0], id: generated.items[0].id, room: 'Room X', startTime: '2026-05-01T09:00:00Z', endTime: '2026-05-01T10:00:00Z' },
      { ...generated.items[1], id: generated.items[1].id, room: 'Room X', startTime: '2026-05-01T09:30:00Z', endTime: '2026-05-01T10:30:00Z' },
    ],
  });
  assert.equal(overlap.ok, false);

  const editOk = service.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: generated.items.map((item, idx) => ({
      ...item,
      session: `S${idx + 1}`,
      room: `R${idx + 1}`,
      startTime: `2026-05-01T1${idx}:00:00Z`,
      endTime: `2026-05-01T1${idx + 1}:00:00Z`,
    })),
  });
  assert.equal(editOk.ok, true);

  const publishMissing = await service.publishSchedule({ scheduleId: 999, confirmed: true });
  assert.equal(publishMissing.ok, false);
  const publishUnconfirmed = await service.publishSchedule({ scheduleId: generated.schedule.id, confirmed: false });
  assert.equal(publishUnconfirmed.ok, false);

  service.setStorageFailure(true);
  const publishStorageFail = await service.publishSchedule({ scheduleId: generated.schedule.id, confirmed: true });
  assert.equal(publishStorageFail.ok, false);
  service.setStorageFailure(false);

  const priorFinal = dataStore.insert('schedules', {
    status: 'final',
    generatedAt: '2026-01-01T00:00:00Z',
    publishedAt: '2026-01-01T00:00:00Z',
    publishedHtmlSnapshot: '<table></table>',
    draftHtmlSnapshot: '',
  });

  publicationService.setFailPublish(true);
  const publishRollback = await service.publishSchedule({ scheduleId: generated.schedule.id, confirmed: true });
  assert.equal(publishRollback.ok, false);
  assert.equal(dataStore.findById('schedules', generated.schedule.id).status, 'draft');
  assert.equal(dataStore.findById('schedules', priorFinal.id).status, 'final');
  publicationService.setFailPublish(false);

  notificationService.setFailDelivery(true);
  const publishWarn = await service.publishSchedule({ scheduleId: generated.schedule.id, confirmed: true });
  assert.equal(publishWarn.ok, true);
  assert.ok(publishWarn.notificationWarning);
  const byId = service.getPublishedSchedule({ scheduleId: generated.schedule.id });
  assert.equal(byId.id, generated.schedule.id);
  const latest = service.getPublishedSchedule({});
  assert.equal(latest.id, generated.schedule.id);
});

test('auth/pricing/payment gateway/payment/registration/publication/ticket/data store branch boosters', async () => {
  const dataStore = new DataStore();
  const pricing = new PricingService({ dataStore });
  const notificationService = new NotificationService({ dataStore });
  const ticketService = new TicketService({ dataStore, notificationService });
  const gateway = new PaymentGatewayService();
  const payment = new PaymentService({
    dataStore,
    paymentGatewayService: gateway,
    pricingService: pricing,
    ticketService,
  });

  const registrationService = new RegistrationService({ dataStore });
  const invalidRegister = registrationService.register({ email: 'bad', password: 'weak' });
  assert.equal(invalidRegister.ok, false);
  const missingEmailRegister = registrationService.register({ email: '', password: 'Strong1!' });
  assert.equal(missingEmailRegister.ok, false);
  const registered = registrationService.register({ email: 'person@example.com', password: 'Strong1!' });
  assert.equal(registered.ok, true);
  const duplicate = registrationService.register({ email: 'PERSON@example.com', password: 'Strong1!' });
  assert.equal(duplicate.ok, false);
  assert.match(validateRegistrationPassword(''), /required/);

  const auth = new AuthService({
    dataStore,
    sessionService: { createSession: (account) => ({ token: 'token', accountId: account.id, roles: account.roles || [] }) },
  });
  auth.setAvailability(false);
  const unavailable = auth.login({ identifier: 'person@example.com', password: 'Strong1!' });
  assert.equal(unavailable.code, 'SERVICE_UNAVAILABLE');
  auth.setAvailability(true);

  const missingFields = auth.login({ identifier: '', password: '' });
  assert.equal(missingFields.code, 'MISSING_FIELDS');

  const user = dataStore.insert('accounts', {
    email: 'login@example.com',
    username: 'login-user',
    passwordHash: require('crypto').createHash('sha256').update('GoodPass1!').digest('hex'),
  });
  const noAccount = auth.login({ identifier: 'missing@example.com', password: 'x' });
  assert.equal(noAccount.code, 'ACCOUNT_NOT_FOUND');
  const badPassword = auth.login({ identifier: 'login-user', password: 'bad' });
  assert.equal(badPassword.code, 'INVALID_PASSWORD');
  const loginOk = auth.login({ identifier: 'login@example.com', password: 'GoodPass1!' });
  assert.equal(loginOk.ok, true);
  assert.match(loginOk.redirectTo, /dashboard\/attendee/);
  dataStore.insert('accounts', {
    email: 'editor-login@example.com',
    passwordHash: require('crypto').createHash('sha256').update('Editor123!').digest('hex'),
    roles: ['editor'],
  });
  const loginEditor = auth.login({ identifier: 'editor-login@example.com', password: 'Editor123!' });
  assert.match(loginEditor.redirectTo, /dashboard\/editor/);
  dataStore.insert('accounts', {
    email: 'empty-roles@example.com',
    passwordHash: require('crypto').createHash('sha256').update('Empty123!').digest('hex'),
    roles: [],
  });
  const loginEmptyRoles = auth.login({ identifier: 'empty-roles@example.com', password: 'Empty123!' });
  assert.match(loginEmptyRoles.redirectTo, /dashboard\/attendee/);

  const changeMissing = auth.changePassword({
    accountId: 999,
    currentPassword: 'a',
    newPassword: 'NewPass1!',
    confirmNewPassword: 'NewPass1!',
  });
  assert.equal(changeMissing.code, 'NOT_FOUND');
  const changeWrongCurrent = auth.changePassword({
    accountId: user.id,
    currentPassword: 'wrong',
    newPassword: 'NewPass1!',
    confirmNewPassword: 'NewPass1!',
  });
  assert.equal(changeWrongCurrent.code, 'INVALID_CURRENT_PASSWORD');
  const changeInvalidNew = auth.changePassword({
    accountId: user.id,
    currentPassword: 'GoodPass1!',
    newPassword: 'weak',
    confirmNewPassword: 'weak',
  });
  assert.equal(changeInvalidNew.code, 'INVALID_NEW_PASSWORD');
  const changeMismatch = auth.changePassword({
    accountId: user.id,
    currentPassword: 'GoodPass1!',
    newPassword: 'NewPass1!',
    confirmNewPassword: 'Different1!',
  });
  assert.equal(changeMismatch.code, 'PASSWORD_CONFIRMATION_MISMATCH');

  const authUpdateFail = new AuthService({
    dataStore: {
      findById: () => ({ id: 1, passwordHash: require('crypto').createHash('sha256').update('GoodPass1!').digest('hex') }),
      updateById: () => null,
    },
    sessionService: { createSession: () => ({}) },
  });
  const updateFail = authUpdateFail.changePassword({
    accountId: 1,
    currentPassword: 'GoodPass1!',
    newPassword: 'NewPass1!',
    confirmNewPassword: 'NewPass1!',
  });
  assert.equal(updateFail.code, 'UPDATE_FAILED');

  pricing.setFailRetrieval(true);
  assert.equal(pricing.listPricing().ok, false);
  pricing.setFailRetrieval(false);
  const seeded = pricing.seedDefaultPricingIfMissing();
  assert.ok(seeded.length > 0);
  assert.equal(pricing.getCategoryById(99999).ok, false);
  const emptyPricing = new PricingService({ dataStore: new DataStore() });
  emptyPricing.seedDefaultPricingIfMissing = () => [];
  assert.equal(emptyPricing.listPricing().ok, false);
  const unavailablePricing = new PricingService({ dataStore: new DataStore() });
  unavailablePricing.listPricing = () => ({ ok: false, errors: { form: 'down' } });
  assert.equal(unavailablePricing.getCategoryById(1).ok, false);

  const publication = new PublicationService();
  await assert.rejects(() => publication.publishSchedule(''), /required/);
  publication.setFailPublish(true);
  await assert.rejects(() => publication.publishSchedule('<table></table>'), /failed/);

  const uploadService = new FileUploadService();
  uploadService.uploadDir = '/tmp/cms-branch-upload';
  const fallbackUpload = uploadService.uploadManuscript({ name: 'plain.txt' });
  assert.match(fallbackUpload.storageRef, /uploads/);
  const noNameUpload = uploadService.uploadManuscript({ buffer: Buffer.from('x', 'utf8') });
  assert.match(noNameUpload.storageRef, /manuscript/);
  const emptyBufferUpload = uploadService.uploadManuscript({ name: 'empty.pdf', buffer: Buffer.alloc(0) });
  assert.match(emptyBufferUpload.storageRef, /uploads/);
  assert.throws(() => uploadService.uploadManuscript(), /Missing file/);

  gateway.setForceError(true);
  await assert.rejects(() => gateway.charge({ amount: 10, card: { cardNumber: '1', expiry: '1', cvv: '1' } }), /unavailable/);
  gateway.setForceError(false);
  const gatewayMissing = await gateway.charge({ amount: 0, card: {} });
  assert.equal(gatewayMissing.approved, false);
  gateway.setForceDecline(true);
  const gatewayDecline = await gateway.charge({ amount: 10, card: { cardNumber: '1', expiry: '1', cvv: '1' } });
  assert.equal(gatewayDecline.approved, false);
  gateway.setForceDecline(false);
  const gatewayApprove = await gateway.charge({ amount: 10, card: { cardNumber: '1', expiry: '1', cvv: '1' } });
  assert.equal(gatewayApprove.approved, true);

  payment.setRegistrationOpen(false);
  const closed = await payment.processRegistrationPayment({
    attendeeAccountId: 1,
    attendeeName: 'A',
    pricingCategoryId: 1,
    card: { cardNumber: '1', expiry: '1', cvv: '1' },
  });
  assert.equal(closed.ok, false);
  payment.setRegistrationOpen(true);

  const unauth = await payment.processRegistrationPayment({
    attendeeAccountId: null,
    attendeeName: 'A',
    pricingCategoryId: 1,
    card: { cardNumber: '1', expiry: '1', cvv: '1' },
  });
  assert.equal(unauth.status, 401);

  const badCard = await payment.processRegistrationPayment({
    attendeeAccountId: 1,
    attendeeName: 'A',
    pricingCategoryId: 1,
    card: { cardNumber: '', expiry: '', cvv: '' },
  });
  assert.equal(badCard.status, 422);
  const partialCard = await payment.processRegistrationPayment({
    attendeeAccountId: 1,
    attendeeName: 'A',
    pricingCategoryId: 1,
    card: { cardNumber: '1', expiry: '', cvv: '9' },
  });
  assert.equal(partialCard.status, 422);

  const paymentBadPricing = await payment.processRegistrationPayment({
    attendeeAccountId: 1,
    attendeeName: 'A',
    pricingCategoryId: 999999,
    card: { cardNumber: '1', expiry: '1', cvv: '1' },
  });
  assert.equal(paymentBadPricing.ok, false);

  const badGatewayService = new PaymentService({
    dataStore,
    pricingService: new PricingService({ dataStore }),
    paymentGatewayService: { charge: async () => { throw new Error('down'); } },
    ticketService,
  });
  const gatewayError = await badGatewayService.processRegistrationPayment({
    attendeeAccountId: 2,
    attendeeName: 'B',
    pricingCategoryId: 1,
    card: { cardNumber: '1', expiry: '1', cvv: '1' },
  });
  assert.equal(gatewayError.status, 503);

  const declineNoReasonService = new PaymentService({
    dataStore,
    pricingService: new PricingService({ dataStore }),
    paymentGatewayService: { charge: async () => ({ approved: false }) },
    ticketService,
  });
  const declined = await declineNoReasonService.processRegistrationPayment({
    attendeeAccountId: 3,
    attendeeName: 'C',
    pricingCategoryId: 1,
    card: { cardNumber: '1', expiry: '1', cvv: '1' },
  });
  assert.equal(declined.status, 402);
  assert.match(declined.errors.form, /declined/);

  ticketService.setFailGeneration(true);
  const ticketWarn = await payment.processRegistrationPayment({
    attendeeAccountId: 4,
    attendeeName: 'D',
    pricingCategoryId: 1,
    card: { cardNumber: '1', expiry: '1', cvv: '1' },
  });
  assert.equal(ticketWarn.ok, true);
  assert.equal(ticketWarn.ticket, null);
  ticketService.setFailGeneration(false);

  const paid = await payment.processRegistrationPayment({
    attendeeAccountId: 5,
    attendeeName: undefined,
    pricingCategoryId: 1,
    card: { cardNumber: '1', expiry: '1', cvv: '1' },
  });
  assert.equal(paid.ok, true);
  assert.ok(paid.ticket);
  assert.equal(paid.registration.attendeeName, 'Attendee');

  const noStoreTicketService = new TicketService();
  const missingStore = noStoreTicketService.getTicket({ registrationId: 1 });
  assert.equal(missingStore.ok, false);
  const generatedWithoutStore = await noStoreTicketService.generateTicket({
    registrationId: 123,
    attendeeName: 'No Store',
  });
  assert.equal(generatedWithoutStore.ok, true);
  noStoreTicketService.setFailGeneration(true);
  const delayedWithoutStore = await noStoreTicketService.generateTicketForRegistration({
    registration: { id: 555, attendeeAccountId: null },
    pricingCategory: { attendeeType: 'attendee' },
    paymentConfirmationNumber: null,
    attendeeName: 'No Store',
  });
  assert.equal(delayedWithoutStore.ok, false);
  const missingRegistrationForTicket = await ticketService.generateTicketForRegistration({
    registration: null,
    pricingCategory: { attendeeType: 'attendee' },
    paymentConfirmationNumber: null,
    attendeeName: 'X',
  });
  assert.equal(missingRegistrationForTicket.ok, false);

  const ticketLogs = [];
  const ticketWithFailingNotice = new TicketService({
    dataStore,
    notificationService: {
      send: async () => {
        throw new Error('notify fail');
      },
      logNonBlockingFailure: (entry) => ticketLogs.push(entry),
    },
  });
  const noticeRegistration = dataStore.insert('registrations', {
    attendeeAccountId: 77,
    attendeeName: 'Notice',
    pricingCategoryId: 1,
    status: 'registered',
  });
  const noticeTicket = await ticketWithFailingNotice.generateTicketForRegistration({
    registration: noticeRegistration,
    pricingCategory: { attendeeType: 'attendee' },
    paymentConfirmationNumber: 'PAY-X',
    attendeeName: 'Notice',
  });
  assert.equal(noticeTicket.ok, true);
  assert.ok(ticketLogs.some((entry) => entry.type === 'ticket_ready'));

  const notFoundRegistration = ticketService.getTicket({ registrationId: 99999 });
  assert.equal(notFoundRegistration.status, 404);

  const pendingRegistration = dataStore.insert('registrations', {
    attendeeAccountId: 22,
    attendeeName: 'Pending',
    pricingCategoryId: 1,
    status: 'ticket_pending',
  });
  const pending = ticketService.getTicket({ registrationId: pendingRegistration.id });
  assert.equal(pending.status, 202);
  const registeredNoTicket = dataStore.insert('registrations', {
    attendeeAccountId: 33,
    attendeeName: 'No ticket',
    pricingCategoryId: 1,
    status: 'registered',
  });
  const noTicket = ticketService.getTicket({ registrationId: registeredNoTicket.id });
  assert.equal(noTicket.status, 404);

  const generatedDirectMissingReg = await ticketService.generateTicket({ registrationId: 9999, attendeeName: 'X' });
  assert.equal(generatedDirectMissingReg.ok, false);

  const generatedDirect = await ticketService.generateTicket({
    registrationId: paid.registration.id,
    attendeeName: 'E',
  });
  assert.equal(generatedDirect.ok, true);

  ticketService.setFailStorage(true);
  const delayedStorage = await ticketService.generateTicketForRegistration({
    registration: dataStore.findById('registrations', paid.registration.id),
    pricingCategory: { attendeeType: 'author' },
    paymentConfirmationNumber: 'PAY-1',
    attendeeName: 'E',
  });
  assert.equal(delayedStorage.ok, false);

  const notificationsNoStore = new NotificationService();
  const sentNoStore = await notificationsNoStore.send({ type: 'x', recipient: 1, payload: {} });
  assert.equal(sentNoStore.status, 'sent');
  notificationsNoStore.setFailDelivery(true);
  await assert.rejects(() => notificationsNoStore.send({ type: 'x', recipient: 1, payload: {} }), /failed/);
  const notifyFail = await notificationsNoStore.notifyAuthorDecision({ authorId: 1, submissionId: 1, decision: 'accept' });
  assert.equal(notifyFail.status, 'failed');
  const nonBlocking = notificationsNoStore.logNonBlockingFailure({ type: 'x' });
  assert.equal(nonBlocking.logged, true);

  const notificationsWithStore = new NotificationService({ dataStore });
  await notificationsWithStore.send({ type: 'with_submission', recipient: 1, payload: { submissionId: 12 } });
  await notificationsWithStore.send({ type: 'without_submission', recipient: 1, payload: {} });
  const logs = dataStore.list('notification_logs', (row) => row.notificationType === 'without_submission');
  assert.equal(logs[0].relatedEntityId, null);
  await notificationsWithStore.send({ type: 'null_payload', recipient: 1, payload: null });
  const withSubmissionContext = notificationsWithStore.logNonBlockingFailure({
    type: 'submission_alert',
    context: { submissionId: 44, recipient: 12 },
  });
  assert.equal(withSubmissionContext.logged, true);

  assert.equal(dataStore.findOne('nothing', () => true), null);
});
