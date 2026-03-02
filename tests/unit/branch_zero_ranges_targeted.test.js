const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const { DataStore } = require('../../src/services/data_store');
const { ReviewService } = require('../../src/services/review_service');
const { SubmissionService } = require('../../src/services/submission_service');
const { ScheduleService } = require('../../src/services/schedule_service');
const { PublicationService } = require('../../src/services/publication_service');
const { NotificationService } = require('../../src/services/notification_service');
const { PaymentService } = require('../../src/services/payment_service');
const { PaymentGatewayService } = require('../../src/services/payment_gateway_service');
const { PricingService } = require('../../src/services/pricing_service');
const { TicketService } = require('../../src/services/ticket_service');
const { AuthService } = require('../../src/services/auth_service');
const { ReviewController } = require('../../src/controllers/review_controller');

test('targets uncovered review service range branches', async () => {
  const ds = new DataStore();
  const logs = [];
  const notifier = {
    send: async ({ type }) => {
      if (type === 'reviews_complete') {
        throw new Error('down');
      }
      return { status: 'sent' };
    },
    logNonBlockingFailure: (entry) => logs.push(entry),
    notifyAuthorDecision: async () => ({ status: 'sent' }),
  };
  const service = new ReviewService({ dataStore: ds, notificationService: notifier });

  ds.insert('accounts', { email: 'no-roles@example.com' });
  ds.insert('accounts', { email: 'fallback@example.com', roles: ['reviewer'] });
  service.listReviewerDirectory();

  const summarySubmission = ds.insert('submissions', {
    title: 'Summary No Manuscript',
    status: 'reviews_complete',
    authorAccountId: 10,
  });
  ds.insert('decisions', {
    submissionId: summarySubmission.id,
    editorAccountId: 1,
    decision: 'accept',
  });
  const summary = service.getSubmissionDecisionSummary({ submissionId: summarySubmission.id });
  assert.equal(summary.rationale, '');
  assert.equal(summary.decidedAt, '');
  assert.equal(summary.manuscriptUrl, '');
  assert.equal(summary.manuscriptFileName, '');

  const byDecisionTime = ds.insert('submissions', {
    title: 'By decision',
    status: 'accepted',
    authorAccountId: 11,
  });
  ds.insert('decisions', {
    submissionId: byDecisionTime.id,
    editorAccountId: 1,
    decision: 'accept',
    decidedAt: '2026-01-01T00:00:00Z',
  });
  ds.insert('decisions', {
    submissionId: byDecisionTime.id,
    editorAccountId: 1,
    decision: 'reject',
    decidedAt: '2026-02-01T00:00:00Z',
  });
  const decided = service.listDecidedPapers();
  assert.ok(decided.some((row) => row.id === byDecisionTime.id));

  const resolvedBlank = service._resolveReviewerIds({ reviewerEmails: [undefined, 'fallback@example.com'] });
  assert.equal(resolvedBlank.ok, true);
  assert.equal(resolvedBlank.reviewerIds.length, 1);

  const assignmentSubmission = ds.insert('submissions', {
    title: 'Assignment submission',
    abstract: 'A',
    status: 'submitted',
    authorAccountId: 12,
  });
  const invalidReviewer = ds.insert('accounts', { email: 'invalid@example.com' });
  const badAssign = await service.assignReviewers({
    submissionId: assignmentSubmission.id,
    reviewerIds: [invalidReviewer.id, invalidReviewer.id + 1, invalidReviewer.id + 2],
  });
  assert.equal(badAssign.ok, false);

  const reviewer1 = ds.insert('accounts', { email: 'r1@ex.com', roles: ['reviewer'] });
  const reviewer2 = ds.insert('accounts', { email: 'r2@ex.com', roles: ['reviewer'] });
  const reviewer3 = ds.insert('accounts', { email: 'r3@ex.com', roles: ['reviewer'] });
  const assigned = await service.assignReviewers({
    submissionId: assignmentSubmission.id,
    reviewerIds: [reviewer1.id, reviewer2.id, reviewer3.id],
  });
  const badResponse = await service.respondInvitation({
    assignmentId: assigned.assignments[0].id,
    reviewerAccountId: reviewer1.id,
    response: undefined,
  });
  assert.equal(badResponse.ok, false);

  const acceptedNoManuscript = ds.insert('review_assignments', {
    submissionId: assignmentSubmission.id,
    reviewerAccountId: reviewer1.id,
    status: 'accepted',
    reviewDeadline: '2099-01-01T00:00:00Z',
  });
  const noExisting = service.getReviewForm({
    assignmentId: acceptedNoManuscript.id,
    reviewerAccountId: reviewer1.id,
  });
  assert.equal(noExisting.ok, true);
  assert.equal(noExisting.manuscriptUrl, '');
  ds.insert('review_forms', {
    assignmentId: acceptedNoManuscript.id,
    status: 'in_progress',
  });
  const withExisting = service.getReviewForm({
    assignmentId: acceptedNoManuscript.id,
    reviewerAccountId: reviewer1.id,
  });
  assert.equal(withExisting.ok, true);
  assert.equal(withExisting.manuscriptFileName, '');

  const manuscriptSubmission = ds.insert('submissions', {
    title: 'Needs 3 reviews',
    status: 'reviews_complete',
    authorAccountId: 13,
  });
  ds.insert('manuscripts', {
    submissionId: manuscriptSubmission.id,
    fileName: 'ms.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/ms.pdf',
    isCurrent: true,
  });
  ds.insert('review_assignments', {
    submissionId: manuscriptSubmission.id,
    reviewerAccountId: reviewer1.id,
    status: 'accepted',
  });
  const reviewSet = service.getEditorReviewSet({ submissionId: manuscriptSubmission.id });
  assert.equal(reviewSet.ok, false);
  assert.match(reviewSet.manuscriptUrl, /uploads/);

  const reviewReadySubmission = ds.insert('submissions', {
    title: 'Ready for complete',
    abstract: 'B',
    status: 'under_review',
    authorAccountId: 14,
  });
  const a1 = ds.insert('review_assignments', {
    submissionId: reviewReadySubmission.id,
    reviewerAccountId: reviewer1.id,
    status: 'accepted',
    reviewDeadline: '2099-01-01T00:00:00Z',
  });
  const a2 = ds.insert('review_assignments', {
    submissionId: reviewReadySubmission.id,
    reviewerAccountId: reviewer2.id,
    status: 'accepted',
    reviewDeadline: '2099-01-01T00:00:00Z',
  });
  const a3 = ds.insert('review_assignments', {
    submissionId: reviewReadySubmission.id,
    reviewerAccountId: reviewer3.id,
    status: 'accepted',
    reviewDeadline: '2099-01-01T00:00:00Z',
  });
  await service.submitReview({ assignmentId: a1.id, reviewerAccountId: reviewer1.id, scores: '4', comments: 'ok', recommendation: 'accept' });
  await service.submitReview({ assignmentId: a2.id, reviewerAccountId: reviewer2.id, scores: '4', comments: 'ok', recommendation: 'accept' });
  await service.submitReview({ assignmentId: a3.id, reviewerAccountId: reviewer3.id, scores: '4', comments: 'ok', recommendation: 'accept' });
  assert.ok(logs.some((entry) => entry.type === 'reviews_complete'));

  const noDecisionValue = await service.submitDecision({
    submissionId: reviewReadySubmission.id,
    editorAccountId: 1,
    decision: undefined,
  });
  assert.equal(noDecisionValue.ok, false);
});

test('targets uncovered submission and schedule service ranges', async () => {
  const ds = new DataStore();
  const throwingUpload = {
    uploadManuscript: () => {
      throw new Error('upload fail');
    },
  };
  const failingService = new SubmissionService({ dataStore: ds, fileUploadService: throwingUpload });
  const validation = failingService.validateSubmissionPayload({
    title: 'T',
    authorNames: 'A',
    affiliationOrContact: 'B',
    abstract: 'C',
    keywords: 'K',
    file: {},
  });
  assert.ok(validation.file);
  const createFail = await failingService.createSubmission({
    authorAccountId: 1,
    title: 'T',
    authorNames: 'A',
    affiliationOrContact: 'B',
    abstract: 'C',
    keywords: 'K',
    file: { name: 'x.pdf' },
  });
  assert.equal(createFail.code, 'UPLOAD_FAILED');

  const upload = {
    uploadManuscript: (file) => ({ storageRef: `/assets/uploads/${file.name || 'x.pdf'}`, uploadedAt: 'now' }),
  };
  const service = new SubmissionService({ dataStore: ds, fileUploadService: upload });
  const created = await service.createSubmission({
    authorAccountId: 1,
    title: 'With fallback size',
    authorNames: 'A',
    affiliationOrContact: 'B',
    abstract: 'C',
    keywords: 'K',
    file: { name: 'fallback.pdf' },
  });
  assert.equal(created.ok, true);
  const replaceSubmission = ds.insert('submissions', {
    authorAccountId: 1,
    title: 'Replace',
    authorNames: 'A',
    affiliationOrContact: 'B',
    abstract: 'C',
    keywords: 'K',
  });
  ds.insert('manuscripts', {
    submissionId: replaceSubmission.id,
    fileName: 'prev.pdf',
    fileType: 'pdf',
    storageRef: '/assets/uploads/prev.pdf',
    isCurrent: true,
    uploadedAt: 'now',
  });
  const replaced = await service.replaceManuscript({
    submissionId: replaceSubmission.id,
    file: { name: 'new.pdf' },
  });
  assert.equal(replaced.ok, true);
  const toUpdate = service.saveDraft({ authorAccountId: 1, title: 'updatable', payload: {} });
  const failUpdateUpload = service.saveDraft({
    authorAccountId: 1,
    submissionId: toUpdate.draft.id,
    title: 'still updatable',
    payload: { file: { name: 'bad.bmp', sizeMb: 1 } },
  });
  assert.equal(failUpdateUpload.code, 'UPLOAD_FAILED');
  const persisted = service._persistDraftFile({
    draftId: toUpdate.draft.id,
    file: {},
  });
  assert.equal(persisted, false);
  const withNoVersion = ds.insert('submissions', { authorAccountId: 1, title: 'no version', status: 'draft' });
  ds.insert('manuscripts', {
    submissionId: withNoVersion.id,
    fileName: 'nv.pdf',
    fileType: 'pdf',
    storageRef: '/assets/uploads/nv.pdf',
    isCurrent: true,
  });
  const persistFallbackVersion = service._persistDraftFile({
    draftId: withNoVersion.id,
    file: { name: 'nv2.pdf', sizeMb: 1 },
  });
  assert.equal(persistFallbackVersion, true);

  const ds2 = new DataStore();
  const schedule = new ScheduleService({
    dataStore: ds2,
    publicationService: new PublicationService(),
    notificationService: new NotificationService({ dataStore: ds2 }),
  });
  assert.deepEqual(schedule._resolveAcceptedSubmissionIds(undefined), []);
  assert.equal(
    schedule._hasRoomOverlap([{ startTime: '2026-05-01T09:00:00Z', endTime: '2026-05-01T10:00:00Z' }]),
    false
  );
  const sf1 = ds2.insert('schedules', { status: 'final' });
  schedule._restorePreviousFinalSchedules([sf1.id]);
  ds2.insert('schedules', { status: 'draft', generatedAt: null, draftHtmlSnapshot: '' });
  ds2.insert('schedules', { status: 'draft', generatedAt: '2026-05-01T00:00:00Z', draftHtmlSnapshot: '' });
  const sortedDrafts = schedule.listDraftSchedules();
  assert.ok(sortedDrafts.length >= 2);

  const accepted = ds2.insert('submissions', { status: 'accepted', title: 'A' });
  schedule.setStorageFailure(true);
  const generationStorageFail = schedule.generateDraftSchedule({ acceptedSubmissionIds: [accepted.id] });
  assert.equal(generationStorageFail.ok, false);
  schedule.setStorageFailure(false);
  const generated = schedule.generateDraftSchedule({ acceptedSubmissionIds: [accepted.id] });
  assert.equal(generated.ok, true);
  const outsideViaEnd = schedule.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: generated.items.map((item) => ({
      ...item,
      startTime: '2026-05-01T09:00:00Z',
      endTime: '2026-05-01T22:00:00Z',
    })),
  });
  assert.equal(outsideViaEnd.ok, false);
  const validEdit = schedule.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: generated.items.map((item) => ({
      ...item,
      session: 'S1',
      room: 'R1',
      startTime: '2026-05-01T09:00:00Z',
      endTime: '2026-05-01T10:00:00Z',
    })),
  });
  assert.equal(validEdit.ok, true);

  ds2.insert('schedules', { status: 'final', publishedAt: '2026-01-01T00:00:00Z' });
  ds2.insert('schedules', { status: 'final', publishedAt: '2026-02-01T00:00:00Z' });
  assert.ok(schedule.getPublishedSchedule({}));
  const emptyFinalsService = new ScheduleService({
    dataStore: new DataStore(),
    publicationService: new PublicationService(),
    notificationService: new NotificationService({ dataStore: new DataStore() }),
  });
  assert.equal(emptyFinalsService.getPublishedSchedule({}), null);
});

test('targets uncovered auth/payment/review-controller/notification ranges', async () => {
  const ds = new DataStore();
  const auth = new AuthService({
    dataStore: ds,
    sessionService: { createSession: (a) => ({ token: 't', accountId: a.id, roles: a.roles || [] }) },
  });
  const usernameOnly = ds.insert('accounts', {
    username: 'username-only',
    passwordHash: crypto.createHash('sha256').update('Secret123!').digest('hex'),
    roles: ['attendee'],
  });
  const byUsername = auth.login({ identifier: 'username-only', password: 'Secret123!' });
  assert.equal(byUsername.ok, true);

  const mismatch = auth.changePassword({
    accountId: usernameOnly.id,
    currentPassword: 'Secret123!',
    newPassword: 'NewSecret1!',
    confirmNewPassword: 'Different1!',
  });
  assert.equal(mismatch.code, 'PASSWORD_CONFIRMATION_MISMATCH');
  const authFailUpdate = new AuthService({
    dataStore: {
      findById: () => ({
        id: 1,
        passwordHash: crypto.createHash('sha256').update('Secret123!').digest('hex'),
      }),
      updateById: () => null,
    },
    sessionService: { createSession: () => ({}) },
  });
  assert.equal(
    authFailUpdate.changePassword({
      accountId: 1,
      currentPassword: 'Secret123!',
      newPassword: 'NewSecret1!',
      confirmNewPassword: 'NewSecret1!',
    }).code,
    'UPDATE_FAILED'
  );
  const authSuccess = auth.changePassword({
    accountId: usernameOnly.id,
    currentPassword: 'Secret123!',
    newPassword: 'Better123!',
    confirmNewPassword: 'Better123!',
  });
  assert.equal(authSuccess.ok, true);

  const pricing = new PricingService({ dataStore: ds });
  const payment = new PaymentService({
    dataStore: ds,
    paymentGatewayService: new PaymentGatewayService(),
    pricingService: pricing,
    ticketService: new TicketService({ dataStore: ds, notificationService: new NotificationService({ dataStore: ds }) }),
  });
  const paymentOk = await payment.processRegistrationPayment({
    attendeeAccountId: 100,
    attendeeName: 'P',
    pricingCategoryId: pricing.listPricing().categories[0].id,
    card: { cardNumber: '4111111111111111', expiry: '12/30', cvv: '123' },
  });
  assert.equal(paymentOk.ok, true);
  const declineNoReason = new PaymentService({
    dataStore: ds,
    paymentGatewayService: { charge: async () => ({ approved: false }) },
    pricingService: new PricingService({ dataStore: ds }),
    ticketService: new TicketService({ dataStore: ds, notificationService: null }),
  });
  const declined = await declineNoReason.processRegistrationPayment({
    attendeeAccountId: 200,
    attendeeName: 'D',
    pricingCategoryId: 1,
    card: { cardNumber: '1', expiry: '1', cvv: '1' },
  });
  assert.match(declined.errors.form, /declined/i);
  const ticketWarnPayment = new PaymentService({
    dataStore: ds,
    paymentGatewayService: { charge: async () => ({ approved: true, confirmationNumber: 'PAY-X' }) },
    pricingService: new PricingService({ dataStore: ds }),
    ticketService: { generateTicketForRegistration: async () => ({ ok: false, errors: { form: 'later' } }) },
  });
  const warned = await ticketWarnPayment.processRegistrationPayment({
    attendeeAccountId: 300,
    attendeeName: 'W',
    pricingCategoryId: 1,
    card: { cardNumber: '1', expiry: '1', cvv: '1' },
  });
  assert.equal(warned.ok, true);
  assert.equal(warned.warning, 'later');

  const reviewController = new ReviewController({
    reviewService: {
      listReviewerDirectory: () => [],
      listSubmittedPapers: () => [],
      assignReviewers: async () => ({ ok: false, errors: { form: 'assign fail' } }),
      listInvitations: () => [],
      respondInvitation: async () => ({ ok: true, assignment: { status: 'accepted' } }),
      listAcceptedAssignments: () => [],
      getReviewForm: () => ({ ok: true, form: null, manuscriptUrl: '', manuscriptFileName: '' }),
      saveReviewDraft: () => ({ ok: true }),
      submitReview: async () => ({ ok: true }),
      listPapersReadyForDecision: () => [{ id: 1 }],
      listDecidedPapers: () => [{ id: 2 }],
      getSubmissionDecisionSummary: () => ({ id: 1, status: 'accepted' }),
      getEditorReviewSet: () => ({ ok: true, reviews: [{ id: 1 }], manuscriptUrl: '', manuscriptFileName: '' }),
      submitDecision: async () => ({ ok: true, decision: { id: 1 }, notificationWarning: '' }),
    },
  });
  assert.equal((await reviewController.assignReviewers({ body: {} })).status, 422);
  const invitationDefaults = reviewController.showInvitationView({ session: { accountId: 1 }, body: {} });
  assert.equal(invitationDefaults.body.assignmentId, '');
  assert.equal(invitationDefaults.body.message, '');
  const assignmentDefaults = reviewController.showReviewerAssignments({ session: { accountId: 1 }, body: {} });
  assert.equal(assignmentDefaults.body.message, '');
  const formDefaults = reviewController.showReviewForm({ session: { accountId: 1 }, body: {} });
  assert.equal(formDefaults.body.assignmentId, '');
  const editorSuccess = reviewController.showEditorReviews({ body: { submissionId: 1 } });
  assert.equal(editorSuccess.status, 200);
  const decisionDefaults = await reviewController.submitDecision({ session: { accountId: 1 }, body: {} });
  assert.equal(decisionDefaults.body.submissionId, '');

  const notifications = new NotificationService({ dataStore: ds });
  notifications.setFailDelivery(false);
  const sent = await notifications.notifyAuthorDecision({ authorId: 1, submissionId: 1, decision: 'accept' });
  assert.equal(sent.status, 'sent');
  notifications.setFailDelivery(true);
  const failed = await notifications.notifyAuthorDecision({ authorId: 1, submissionId: 1, decision: 'accept' });
  assert.equal(failed.status, 'failed');
});

test('review service final branch mop-up', async () => {
  const ds = new DataStore();
  const failures = [];
  const notifier = {
    send: async ({ type }) => {
      if (type === 'review_declined' || type === 'reviews_complete') {
        throw new Error('notify-fail');
      }
      return { status: 'sent' };
    },
    logNonBlockingFailure: (entry) => failures.push(entry),
    notifyAuthorDecision: async () => ({ status: 'sent' }),
  };
  const service = new ReviewService({ dataStore: ds, notificationService: notifier });

  const reviewer1 = ds.insert('accounts', { email: 'mop1@example.com', roles: ['reviewer'] });
  const reviewer2 = ds.insert('accounts', { email: 'mop2@example.com', roles: ['reviewer'] });
  const reviewer3 = ds.insert('accounts', { email: 'mop3@example.com', roles: ['reviewer'] });
  ds.insert('accounts', { roles: ['reviewer'] }); // email fallback branch in resolver

  const withManuscript = ds.insert('submissions', { title: 'With manuscript', abstract: 'A', status: 'submitted', authorAccountId: 1 });
  ds.insert('manuscripts', {
    submissionId: withManuscript.id,
    fileName: 'with.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/with.pdf',
    isCurrent: true,
  });
  const withoutManuscript = ds.insert('submissions', { title: 'Without manuscript', abstract: '', status: 'reviews_complete', authorAccountId: 2 });
  ds.insert('decisions', { submissionId: withoutManuscript.id, editorAccountId: 9, decision: 'accept' });
  ds.insert('decisions', { submissionId: withoutManuscript.id, editorAccountId: 9, decision: 'reject', decidedAt: '2026-01-01T00:00:00Z' });
  const summary = service.getSubmissionDecisionSummary({ submissionId: withoutManuscript.id });
  assert.equal(summary.rationale, '');
  assert.equal(summary.manuscriptUrl, '');

  service._resolveReviewerIds({ reviewerEmails: ['mop1@example.com', undefined] });
  const assigned = await service.assignReviewers({
    submissionId: withManuscript.id,
    reviewerIds: [reviewer1.id, reviewer2.id, reviewer3.id],
  });
  assert.equal(assigned.ok, true);

  const badResponse = await service.respondInvitation({
    assignmentId: assigned.assignments[0].id,
    reviewerAccountId: reviewer1.id,
    response: undefined,
  });
  assert.equal(badResponse.ok, false);

  const declined = await service.respondInvitation({
    assignmentId: assigned.assignments[0].id,
    reviewerAccountId: reviewer1.id,
    response: 'decline',
  });
  assert.equal(declined.ok, true);
  assert.ok(failures.some((f) => f.type === 'review_declined'));

  await service.respondInvitation({ assignmentId: assigned.assignments[0].id, reviewerAccountId: reviewer1.id, response: 'accept' });
  await service.respondInvitation({ assignmentId: assigned.assignments[1].id, reviewerAccountId: reviewer2.id, response: 'accept' });
  await service.respondInvitation({ assignmentId: assigned.assignments[2].id, reviewerAccountId: reviewer3.id, response: 'accept' });

  const formWithManuscript = service.getReviewForm({
    assignmentId: assigned.assignments[0].id,
    reviewerAccountId: reviewer1.id,
  });
  assert.match(formWithManuscript.manuscriptUrl, /uploads/);

  const noMsAssignment = ds.insert('review_assignments', {
    submissionId: withoutManuscript.id,
    reviewerAccountId: reviewer1.id,
    status: 'accepted',
  });
  const formNoExistingNoMs = service.getReviewForm({
    assignmentId: noMsAssignment.id,
    reviewerAccountId: reviewer1.id,
  });
  assert.equal(formNoExistingNoMs.manuscriptUrl, '');
  ds.insert('review_forms', { assignmentId: noMsAssignment.id, status: 'in_progress' });
  const formExistingNoMs = service.getReviewForm({
    assignmentId: noMsAssignment.id,
    reviewerAccountId: reviewer1.id,
  });
  assert.equal(formExistingNoMs.manuscriptFileName, '');

  await service.submitReview({ assignmentId: assigned.assignments[0].id, reviewerAccountId: reviewer1.id, scores: '4', comments: 'ok', recommendation: 'accept' });
  await service.submitReview({ assignmentId: assigned.assignments[1].id, reviewerAccountId: reviewer2.id, scores: '4', comments: 'ok', recommendation: 'accept' });
  await service.submitReview({ assignmentId: assigned.assignments[2].id, reviewerAccountId: reviewer3.id, scores: '4', comments: 'ok', recommendation: 'accept' });
  assert.ok(failures.some((f) => f.type === 'reviews_complete'));

  const errorReviewSet = service.getEditorReviewSet({ submissionId: withManuscript.id });
  assert.equal(errorReviewSet.ok, true);
  assert.match(errorReviewSet.manuscriptUrl, /uploads/);
  const errorNoManuscript = service.getEditorReviewSet({ submissionId: withoutManuscript.id });
  assert.equal(errorNoManuscript.manuscriptUrl, '');

  const invalidDecision = await service.submitDecision({
    submissionId: withManuscript.id,
    editorAccountId: 1,
    decision: undefined,
  });
  assert.equal(invalidDecision.ok, false);

  const decisionSubmission = ds.insert('submissions', { title: 'Decision target', status: 'reviews_complete', authorAccountId: 5 });
  for (const reviewerId of [reviewer1.id, reviewer2.id, reviewer3.id]) {
    const a = ds.insert('review_assignments', { submissionId: decisionSubmission.id, reviewerAccountId: reviewerId, status: 'accepted' });
    ds.insert('review_forms', { assignmentId: a.id, status: 'submitted', scores: '3', comments: 'x', recommendation: 'accept' });
  }
  const validDecision = await service.submitDecision({
    submissionId: decisionSubmission.id,
    editorAccountId: 1,
    decision: 'accept',
    rationale: 'ok',
  });
  assert.equal(validDecision.ok, true);
});

test('schedule and ticket targeted remaining ranges', async () => {
  const ds = new DataStore();
  const schedule = new ScheduleService({
    dataStore: ds,
    publicationService: new PublicationService(),
    notificationService: new NotificationService({ dataStore: ds }),
  });
  schedule._resolveAcceptedSubmissionIds(undefined);
  const f1 = ds.insert('schedules', { status: 'final', publishedAt: '2026-01-01T00:00:00Z' });
  ds.insert('schedules', { status: 'final' });
  schedule._restorePreviousFinalSchedules([f1.id]);
  ds.insert('schedules', { status: 'draft', generatedAt: '2026-01-01T00:00:00Z', draftHtmlSnapshot: '' });
  ds.insert('schedules', { status: 'draft', draftHtmlSnapshot: '' });
  schedule.listDraftSchedules();
  const accepted = ds.insert('submissions', { status: 'accepted', title: 'S' });
  schedule.setStorageFailure(true);
  schedule.generateDraftSchedule({ acceptedSubmissionIds: [accepted.id] });
  schedule.setStorageFailure(false);
  const generated = schedule.generateDraftSchedule({ acceptedSubmissionIds: [accepted.id] });
  schedule.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: generated.items.map((item) => ({
      ...item,
      startTime: '2026-05-01T09:00:00Z',
      endTime: '2026-05-01T21:30:00Z',
    })),
  });
  schedule.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: generated.items.map((item) => ({
      ...item,
      room: 'R1',
      session: 'S1',
      startTime: '2026-05-01T09:00:00Z',
      endTime: '2026-05-01T10:00:00Z',
    })),
  });
  schedule.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: generated.items.map((item, idx) => ({
      ...item,
      room: 'R1',
      session: `S${idx + 1}`,
      startTime: idx === 0 ? '2026-05-01T09:00:00Z' : '2026-05-01T09:30:00Z',
      endTime: idx === 0 ? '2026-05-01T10:00:00Z' : '2026-05-01T10:30:00Z',
    })),
  });
  schedule.getPublishedSchedule({});

  const ticketWithoutStore = new TicketService({
    notificationService: { send: async () => ({ status: 'sent' }) },
  });
  const generatedWithoutStore = await ticketWithoutStore.generateTicketForRegistration({
    registration: { id: 1, attendeeAccountId: 9, status: 'registered' },
    pricingCategory: { attendeeType: 'attendee' },
    paymentConfirmationNumber: 'PAY-1',
    attendeeName: 'No Store',
  });
  assert.equal(generatedWithoutStore.ok, true);

  const ds2 = new DataStore();
  const ticket = new TicketService({ dataStore: ds2, notificationService: null });
  const regPending = ds2.insert('registrations', { status: 'ticket_pending' });
  const regRegistered = ds2.insert('registrations', { status: 'registered' });
  const pending = ticket.getTicket({ registrationId: regPending.id });
  assert.equal(pending.status, 202);
  const missing = ticket.getTicket({ registrationId: regRegistered.id });
  assert.equal(missing.status, 404);
  ds2.insert('tickets', { registrationId: regRegistered.id, status: 'generated', ticketReference: 'TKT' });
  const ok = ticket.getTicket({ registrationId: regRegistered.id });
  assert.equal(ok.ok, true);
});

test('final review and schedule branch closure', async () => {
  const ds = new DataStore();
  const review = new ReviewService({
    dataStore: ds,
    notificationService: {
      send: async ({ type }) => {
        if (type === 'reviews_complete') {
          throw new Error('send-fail');
        }
        return { status: 'sent' };
      },
      notifyAuthorDecision: async () => ({ status: 'sent' }),
    },
  });

  const reviewer1 = ds.insert('accounts', { email: 'branch-r1@example.com', roles: ['reviewer'] });
  const reviewer2 = ds.insert('accounts', { email: 'branch-r2@example.com', roles: ['reviewer'] });
  const reviewer3 = ds.insert('accounts', { email: 'branch-r3@example.com', roles: ['reviewer'] });
  ds.insert('accounts', { roles: ['reviewer'] });

  const decidedSub = ds.insert('submissions', { title: 'Decided', status: 'accepted', authorAccountId: 1 });
  ds.insert('decisions', { submissionId: decidedSub.id, editorAccountId: 1, decision: 'accept' });
  ds.insert('decisions', { submissionId: decidedSub.id, editorAccountId: 1, decision: 'reject', decidedAt: '2026-01-01T00:00:00Z' });
  ds.insert('decisions', { submissionId: decidedSub.id, editorAccountId: 1, decision: 'accept', decidedAt: '2026-02-01T00:00:00Z' });
  review._latestDecisionForSubmission(decidedSub.id);

  const summarySub = ds.insert('submissions', {
    title: 'Summary Branches',
    status: 'reviews_complete',
    authorAccountId: 2,
  });
  ds.insert('decisions', { submissionId: summarySub.id, editorAccountId: 1, decision: 'accept' });
  const summary = review.getSubmissionDecisionSummary({ submissionId: summarySub.id });
  assert.equal(summary.rationale, '');
  assert.equal(summary.manuscriptUrl, '');
  assert.equal(summary.manuscriptFileName, '');

  const resolvedInvalid = review._resolveReviewerIds({ reviewerEmails: ['missing-reviewer@example.com'] });
  assert.equal(resolvedInvalid.ok, false);

  const withMs = ds.insert('submissions', {
    title: 'With manuscript and existing form',
    status: 'under_review',
    authorAccountId: 3,
  });
  ds.insert('manuscripts', {
    submissionId: withMs.id,
    fileName: 'with-ms.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/with-ms.pdf',
    isCurrent: true,
  });
  const withMsAssignment = ds.insert('review_assignments', {
    submissionId: withMs.id,
    reviewerAccountId: reviewer1.id,
    status: 'accepted',
  });
  ds.insert('review_forms', { assignmentId: withMsAssignment.id, status: 'in_progress' });
  const withMsForm = review.getReviewForm({
    assignmentId: withMsAssignment.id,
    reviewerAccountId: reviewer1.id,
  });
  assert.equal(withMsForm.ok, true);
  assert.match(withMsForm.manuscriptUrl, /uploads/);

  const reviewSubmitSub = ds.insert('submissions', {
    title: 'Submit to complete',
    status: 'under_review',
    authorAccountId: 4,
  });
  const submitAssignments = [reviewer1.id, reviewer2.id, reviewer3.id].map((reviewerAccountId) =>
    ds.insert('review_assignments', { submissionId: reviewSubmitSub.id, reviewerAccountId, status: 'accepted' })
  );
  await review.submitReview({
    assignmentId: submitAssignments[0].id,
    reviewerAccountId: reviewer1.id,
    scores: '4',
    comments: 'ok',
    recommendation: 'accept',
  });
  await review.submitReview({
    assignmentId: submitAssignments[1].id,
    reviewerAccountId: reviewer2.id,
    scores: '4',
    comments: 'ok',
    recommendation: 'accept',
  });
  const completeResult = await review.submitReview({
    assignmentId: submitAssignments[2].id,
    reviewerAccountId: reviewer3.id,
    scores: '4',
    comments: 'ok',
    recommendation: 'accept',
  });
  assert.equal(completeResult.ok, true);
  assert.equal(ds.findById('submissions', reviewSubmitSub.id).status, 'reviews_complete');

  const ds2 = new DataStore();
  const schedule = new ScheduleService({
    dataStore: ds2,
    publicationService: new PublicationService(),
    notificationService: new NotificationService({ dataStore: ds2 }),
  });

  assert.deepEqual(schedule._resolveAcceptedSubmissionIds(null), []);
  const previousFinal = ds2.insert('schedules', { status: 'final' });
  schedule._restorePreviousFinalSchedules([previousFinal.id]);
  assert.equal(ds2.findById('schedules', previousFinal.id).status, 'final');

  const accepted1 = ds2.insert('submissions', { status: 'accepted', title: 'Accepted 1' });
  const accepted2 = ds2.insert('submissions', { status: 'accepted', title: 'Accepted 2' });
  schedule.setStorageFailure(true);
  const storageFailure = schedule.generateDraftSchedule({ acceptedSubmissionIds: [accepted1.id] });
  assert.equal(storageFailure.ok, false);

  schedule.setStorageFailure(false);
  const generated = schedule.generateDraftSchedule({ acceptedSubmissionIds: [accepted1.id, accepted2.id] });
  assert.equal(generated.ok, true);

  const outsideByEndOnly = schedule.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: generated.items.map((item, index) => ({
      ...item,
      room: `Room ${index + 1}`,
      session: `S${index + 1}`,
      startTime: '2026-05-01T09:00:00Z',
      endTime: index === 0 ? '2026-05-01T21:00:00Z' : '2026-05-01T10:00:00Z',
    })),
  });
  assert.equal(outsideByEndOnly.ok, false);

  const overlapEdit = schedule.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: generated.items.map((item, index) => ({
      ...item,
      room: 'Room Overlap',
      session: `Overlap ${index + 1}`,
      startTime: index === 0 ? '2026-05-01T09:00:00Z' : '2026-05-01T09:30:00Z',
      endTime: index === 0 ? '2026-05-01T10:00:00Z' : '2026-05-01T10:30:00Z',
    })),
  });
  assert.equal(overlapEdit.ok, false);

  const nonOverlapEdit = schedule.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: generated.items.map((item, index) => ({
      ...item,
      room: 'Room Clean',
      session: `Clean ${index + 1}`,
      startTime: index === 0 ? '2026-05-01T09:00:00Z' : '2026-05-01T10:00:00Z',
      endTime: index === 0 ? '2026-05-01T10:00:00Z' : '2026-05-01T11:00:00Z',
    })),
  });
  assert.equal(nonOverlapEdit.ok, true);
});

test('review service final micro-branches are exercised', async () => {
  const dsDecision = new DataStore();
  const reviewDecision = new ReviewService({
    dataStore: dsDecision,
    notificationService: {
      send: async () => ({ status: 'sent' }),
      notifyAuthorDecision: async () => ({ status: 'sent' }),
    },
  });
  const latestSub = dsDecision.insert('submissions', { title: 'Latest', status: 'accepted', authorAccountId: 1 });
  dsDecision.insert('decisions', {
    submissionId: latestSub.id,
    editorAccountId: 1,
    decision: 'accept',
    decidedAt: '2026-01-01T00:00:00Z',
  });
  dsDecision.insert('decisions', {
    submissionId: latestSub.id,
    editorAccountId: 1,
    decision: 'reject',
  });
  const latest = reviewDecision._latestDecisionForSubmission(latestSub.id);
  assert.ok(latest);

  const sNoDecisionNoMs = dsDecision.insert('submissions', { title: 'A', status: 'reviews_complete', authorAccountId: 2 });
  const sDecisionNoMs = dsDecision.insert('submissions', { title: 'B', status: 'reviews_complete', authorAccountId: 3 });
  dsDecision.insert('decisions', { submissionId: sDecisionNoMs.id, editorAccountId: 1, decision: 'accept' });
  const sNoDecisionMs = dsDecision.insert('submissions', { title: 'C', status: 'reviews_complete', authorAccountId: 4 });
  dsDecision.insert('manuscripts', {
    submissionId: sNoDecisionMs.id,
    fileName: 'c.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/c.pdf',
    isCurrent: true,
  });
  const sDecisionMs = dsDecision.insert('submissions', { title: 'D', status: 'reviews_complete', authorAccountId: 5 });
  dsDecision.insert('manuscripts', {
    submissionId: sDecisionMs.id,
    fileName: 'd.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/d.pdf',
    isCurrent: true,
  });
  dsDecision.insert('decisions', {
    submissionId: sDecisionMs.id,
    editorAccountId: 1,
    decision: 'reject',
    rationale: 'insufficient',
    decidedAt: '2026-02-01T00:00:00Z',
  });

  const summaryA = reviewDecision.getSubmissionDecisionSummary({ submissionId: sNoDecisionNoMs.id });
  const summaryB = reviewDecision.getSubmissionDecisionSummary({ submissionId: sDecisionNoMs.id });
  const summaryC = reviewDecision.getSubmissionDecisionSummary({ submissionId: sNoDecisionMs.id });
  const summaryD = reviewDecision.getSubmissionDecisionSummary({ submissionId: sDecisionMs.id });
  assert.equal(summaryA.decision, null);
  assert.equal(summaryA.manuscriptUrl, '');
  assert.equal(summaryB.rationale, '');
  assert.equal(summaryB.manuscriptFileName, '');
  assert.match(summaryC.manuscriptUrl, /uploads/);
  assert.equal(summaryC.decision, null);
  assert.equal(summaryD.rationale, 'insufficient');
  assert.match(summaryD.manuscriptFileName, /\.pdf$/);

  const runSubmitCase = async (notificationService) => {
    const ds = new DataStore();
    const review = new ReviewService({ dataStore: ds, notificationService });
    const r1 = ds.insert('accounts', { email: 'case1@example.com', roles: ['reviewer'] });
    const r2 = ds.insert('accounts', { email: 'case2@example.com', roles: ['reviewer'] });
    const r3 = ds.insert('accounts', { email: 'case3@example.com', roles: ['reviewer'] });
    const sub = ds.insert('submissions', { title: 'Submit Case', status: 'under_review', authorAccountId: 7 });
    const assignments = [r1.id, r2.id, r3.id].map((reviewerAccountId) =>
      ds.insert('review_assignments', { submissionId: sub.id, reviewerAccountId, status: 'accepted' })
    );
    await review.submitReview({
      assignmentId: assignments[0].id,
      reviewerAccountId: r1.id,
      scores: '4',
      comments: 'ok',
      recommendation: 'accept',
    });
    await review.submitReview({
      assignmentId: assignments[1].id,
      reviewerAccountId: r2.id,
      scores: '4',
      comments: 'ok',
      recommendation: 'accept',
    });
    const third = await review.submitReview({
      assignmentId: assignments[2].id,
      reviewerAccountId: r3.id,
      scores: '4',
      comments: 'ok',
      recommendation: 'accept',
    });
    return { ds, subId: sub.id, third };
  };

  const successCase = await runSubmitCase({
    send: async () => ({ status: 'sent' }),
    notifyAuthorDecision: async () => ({ status: 'sent' }),
  });
  assert.equal(successCase.third.ok, true);
  assert.equal(successCase.ds.findById('submissions', successCase.subId).status, 'reviews_complete');

  const failNoLogCase = await runSubmitCase({
    send: async () => {
      throw new Error('send-fails');
    },
    notifyAuthorDecision: async () => ({ status: 'sent' }),
  });
  assert.equal(failNoLogCase.third.ok, true);

  const failureLogs = [];
  const failWithLogCase = await runSubmitCase({
    send: async () => {
      throw new Error('send-fails-with-log');
    },
    logNonBlockingFailure: (entry) => failureLogs.push(entry),
    notifyAuthorDecision: async () => ({ status: 'sent' }),
  });
  assert.equal(failWithLogCase.third.ok, true);
  assert.ok(failureLogs.some((entry) => entry.type === 'reviews_complete'));
});
