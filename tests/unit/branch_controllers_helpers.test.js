const test = require('node:test');
const assert = require('node:assert/strict');

const { LoginController } = require('../../src/controllers/login_controller');
const { NotificationController } = require('../../src/controllers/notification_controller');
const { PasswordController } = require('../../src/controllers/password_controller');
const { PricingController } = require('../../src/controllers/pricing_controller');
const { RegisterController } = require('../../src/controllers/register_controller');
const { RegistrationController } = require('../../src/controllers/registration_controller');
const { ReviewController } = require('../../src/controllers/review_controller');
const { ScheduleController } = require('../../src/controllers/schedule_controller');
const { SubmissionController } = require('../../src/controllers/submission_controller');
const { TicketController } = require('../../src/controllers/ticket_controller');
const { Router } = require('../../src/controllers/router');
const { DataStore } = require('../../src/services/data_store');
const { isAuthorizedUser, hasAnyRole, canAccessRoute } = require('../../src/services/access_control');
const { redactSensitiveFields, retryLaterError } = require('../../src/services/error_policy');
const { SessionService } = require('../../src/services/session_service');
const { PaymentTransaction } = require('../../src/models/payment_transaction');
const { PricingCategory } = require('../../src/models/pricing_category');

test('login controller covers service unavailable and generic auth failure branches', () => {
  const serviceDownController = new LoginController({
    authService: {
      login: () => ({ ok: false, code: 'SERVICE_UNAVAILABLE', error: { message: 'down' } }),
    },
  });
  const down = serviceDownController.submit({ body: { email: 'a@b.com', password: 'x' } });
  assert.equal(down.status, 503);
  assert.equal(down.body.errors.form, 'down');

  const badCredsController = new LoginController({
    authService: {
      login: () => ({ ok: false, code: 'INVALID_PASSWORD' }),
    },
  });
  const bad = badCredsController.submit({ body: { identifier: 'a@b.com', password: 'x' } });
  assert.equal(bad.status, 401);
  assert.equal(bad.body.errors.form, 'Login failed.');
});

test('notification controller covers missing submission and custom message path', async () => {
  const ds = new DataStore();
  const missingController = new NotificationController({
    dataStore: ds,
    notificationService: { notifyAuthorDecision: async () => ({ status: 'sent' }) },
  });
  const missing = await missingController.notifyAuthorDecision({ body: { submissionId: 99, decision: 'accept' } });
  assert.equal(missing.status, 404);

  const submission = ds.insert('submissions', { authorAccountId: 77, title: 'T' });
  const okController = new NotificationController({
    dataStore: ds,
    notificationService: { notifyAuthorDecision: async () => ({ status: 'failed' }) },
  });
  const ok = await okController.notifyAuthorDecision({
    body: { submissionId: submission.id, decision: 'reject', message: 'Custom message' },
  });
  assert.equal(ok.status, 200);
  const saved = ds.findOne('author_notifications', (row) => row.submissionId === submission.id);
  assert.equal(saved.message, 'Custom message');
});

test('password controller covers all mapped and fallback errors plus attendee fallback redirect', () => {
  const controller = new PasswordController({
    authService: {
      changePassword: () => ({ ok: false, code: 'NOT_FOUND' }),
    },
  });
  assert.match(
    controller.submit({
      session: { accountId: 1, roles: ['author'] },
      body: { currentPassword: 'a', newPassword: 'b', confirmNewPassword: 'b' },
    }).body.errors.form,
    /Account not found/
  );

  const unknownController = new PasswordController({
    authService: {
      changePassword: () => ({ ok: false, code: 'NO_MATCH' }),
    },
  });
  const unknown = unknownController.submit({
    session: { accountId: 1, roles: ['reviewer'] },
    body: { currentPassword: 'a', newPassword: 'b', confirmNewPassword: 'b' },
  });
  assert.equal(unknown.status, 400);
  assert.match(unknown.body.errors.form, /Password update failed/);

  const successNoRole = new PasswordController({
    authService: {
      changePassword: () => ({ ok: true }),
    },
  });
  const success = successNoRole.submit({
    session: { accountId: 1, roles: [] },
    body: { currentPassword: 'a', newPassword: 'b', confirmNewPassword: 'b' },
  });
  assert.match(success.body.redirectTo, /dashboard\/attendee/);
});

test('pricing and register controllers cover error branches', () => {
  const pricing = new PricingController({
    pricingService: {
      listPricing: () => ({ ok: false, errors: { form: 'offline' } }),
    },
  });
  const pricingView = pricing.showPricing();
  assert.equal(pricingView.status, 503);
  assert.equal(pricingView.body.categories.length, 0);

  const register = new RegisterController({
    registrationService: {
      register: () => ({ ok: false, errors: { email: 'bad' } }),
    },
  });
  const registerResp = register.submit({ body: { email: 'x', password: 'y' } });
  assert.equal(registerResp.status, 400);
  assert.equal(registerResp.body.view, 'register.html');
});

test('registration controller covers pricing unavailable and submit branch permutations', async () => {
  const showFail = new RegistrationController({
    pricingService: { listPricing: () => ({ ok: false, errors: { form: 'pricing down' } }) },
    paymentService: {},
  });
  assert.equal(showFail.showForm().status, 503);

  const submitFailure = new RegistrationController({
    pricingService: { listPricing: () => ({ ok: false, errors: { form: 'down' } }) },
    paymentService: {
      processRegistrationPayment: async () => ({ ok: false, errors: { form: 'pay fail' } }),
      sanitizePaymentPayload: (payload) => ({ ...payload, cardNumber: '[REDACTED]' }),
    },
  });
  const failed = await submitFailure.submit({ session: null, body: { cardNumber: '1234' } });
  assert.equal(failed.status, 422);
  assert.equal(failed.body.categories.length, 0);
  assert.equal(failed.body.sanitizedInput.cardNumber, '[REDACTED]');

  const submitFailureWithPricing = new RegistrationController({
    pricingService: { listPricing: () => ({ ok: true, categories: [{ id: 1 }] }) },
    paymentService: {
      processRegistrationPayment: async () => ({ ok: false, status: 402, errors: { form: 'declined' } }),
      sanitizePaymentPayload: (payload) => payload,
    },
  });
  const failedWithPricing = await submitFailureWithPricing.submit({ session: null, body: {} });
  assert.equal(failedWithPricing.status, 402);
  assert.equal(failedWithPricing.body.categories.length, 1);

  const redirectCase = new RegistrationController({
    pricingService: { listPricing: () => ({ ok: true, categories: [] }) },
    paymentService: {
      processRegistrationPayment: async () => ({
        ok: true,
        registration: { id: 10 },
        payment: {},
        ticket: { id: 7 },
      }),
      sanitizePaymentPayload: (x) => x,
    },
  });
  const redirect = await redirectCase.submit({ session: { accountId: 8 }, body: {} });
  assert.equal(redirect.status, 201);
  assert.match(redirect.body.redirectTo, /dashboard\/attendee/);
  assert.match(redirect.body.redirectTo, /registration-complete/);

  const renderCase = new RegistrationController({
    pricingService: { listPricing: () => ({ ok: true, categories: [] }) },
    paymentService: {
      processRegistrationPayment: async () => ({
        ok: true,
        registration: { id: 11 },
        payment: { id: 12 },
        ticket: null,
        warning: 'ticket pending',
      }),
      sanitizePaymentPayload: (x) => x,
    },
  });
  const render = await renderCase.submit({ session: null, body: {} });
  assert.equal(render.status, 201);
  assert.equal(render.body.view, 'registration.html');
  assert.equal(render.body.warning, 'ticket pending');

  const sessionPendingTicket = new RegistrationController({
    pricingService: { listPricing: () => ({ ok: true, categories: [] }) },
    paymentService: {
      processRegistrationPayment: async () => ({
        ok: true,
        registration: { id: 12 },
        payment: { id: 13 },
        ticket: null,
      }),
      sanitizePaymentPayload: (x) => x,
    },
  });
  const pendingRedirect = await sessionPendingTicket.submit({
    session: { accountId: 8, roles: ['reviewer'] },
    body: {},
  });
  assert.match(pendingRedirect.body.redirectTo, /dashboard\/reviewer/);
  assert.match(pendingRedirect.body.redirectTo, /registration-pending-ticket/);
});

test('review controller covers all non-happy branches and alternate redirects', async () => {
  const reviewController = new ReviewController({
    reviewService: {
      listReviewerDirectory: () => [{ id: 1 }],
      listSubmittedPapers: () => [{ id: 2 }],
      assignReviewers: async () => ({ ok: false, errors: { form: 'assign fail' } }),
      listInvitations: () => [{ id: 3 }],
      respondInvitation: async () => ({ ok: false, errors: { form: 'respond fail' } }),
      listAcceptedAssignments: () => [],
      getReviewForm: () => ({ ok: false, errors: { form: 'denied' } }),
      saveReviewDraft: () => ({ ok: false, errors: { form: 'save fail' } }),
      submitReview: async () => ({ ok: false, errors: { form: 'submit fail' } }),
      listPapersReadyForDecision: () => [{ id: 4 }],
      listDecidedPapers: () => [{ id: 5 }],
      getSubmissionDecisionSummary: () => null,
      getEditorReviewSet: () => ({ ok: false, errors: { form: 'need 3' }, manuscriptUrl: '', manuscriptFileName: '' }),
      submitDecision: async () => ({ ok: false, errors: { form: 'decision fail' } }),
    },
  });

  assert.equal((await reviewController.assignReviewers({ body: { submissionId: 7 } })).status, 422);
  assert.equal((await reviewController.respondInvitation({ session: { accountId: 1 }, body: { assignmentId: 2 } })).status, 422);
  assert.equal(reviewController.showReviewForm({ session: { accountId: 1 }, body: { assignmentId: 3 } }).status, 403);
  assert.equal(reviewController.saveReviewDraft({ session: { accountId: 1 }, body: { assignmentId: 3 } }).status, 422);
  assert.equal((await reviewController.submitReview({ session: { accountId: 1 }, body: { assignmentId: 3 } })).status, 422);
  assert.equal(reviewController.showEditorReviews({ body: { submissionId: 4 } }).status, 422);
  assert.equal((await reviewController.submitDecision({ session: { accountId: 99 }, body: { submissionId: 4 } })).status, 422);

  const reviewSetSuccessController = new ReviewController({
    reviewService: {
      listReviewerDirectory: () => [],
      listSubmittedPapers: () => [],
      assignReviewers: async () => ({ ok: true, assignments: [] }),
      listInvitations: () => [],
      respondInvitation: async () => ({ ok: true, assignment: { status: 'accepted' } }),
      listAcceptedAssignments: () => [],
      getReviewForm: () => ({ ok: true, form: { id: 1 }, manuscriptUrl: '', manuscriptFileName: '' }),
      saveReviewDraft: () => ({ ok: true }),
      submitReview: async () => ({ ok: true }),
      listPapersReadyForDecision: () => [{ id: 1 }],
      listDecidedPapers: () => [{ id: 2 }],
      getSubmissionDecisionSummary: () => ({ id: 4, status: 'reviews_complete' }),
      getEditorReviewSet: () => ({ ok: true, reviews: [{ id: 8 }], manuscriptUrl: '/assets/uploads/x.pdf', manuscriptFileName: 'x.pdf' }),
      submitDecision: async () => ({ ok: true, decision: { id: 1 }, notificationWarning: null }),
    },
  });
  const editorReviewsOk = reviewSetSuccessController.showEditorReviews({ body: { submissionId: 4 } });
  assert.equal(editorReviewsOk.status, 200);
  assert.equal(editorReviewsOk.body.reviews.length, 1);

  const declineController = new ReviewController({
    reviewService: {
      listReviewerDirectory: () => [],
      listSubmittedPapers: () => [],
      assignReviewers: async () => ({ ok: true, assignments: [] }),
      listInvitations: () => [],
      respondInvitation: async () => ({ ok: true, assignment: { status: 'declined' } }),
      listAcceptedAssignments: () => [],
      getReviewForm: () => ({ ok: true, form: null }),
      saveReviewDraft: () => ({ ok: true }),
      submitReview: async () => ({ ok: true }),
      listPapersReadyForDecision: () => [],
      listDecidedPapers: () => [],
      getSubmissionDecisionSummary: () => null,
      getEditorReviewSet: () => ({ ok: true, reviews: [] }),
      submitDecision: async () => ({ ok: true, decision: { id: 8 }, notificationWarning: 'warn' }),
    },
  });
  const declined = await declineController.respondInvitation({ session: { accountId: 1 }, body: { assignmentId: 1 } });
  assert.match(declined.body.redirectTo, /invitation-declined/);
  const okDecision = await declineController.submitDecision({ session: { accountId: 1 }, body: { submissionId: 1 } });
  assert.match(okDecision.body.message, /UPDATED/);
});

test('schedule controller covers failure, cancel, warning, and 404 branches', async () => {
  const scheduleController = new ScheduleController({
    scheduleService: {
      listAcceptedSubmissions: () => [{ id: 1 }],
      listDraftSchedules: () => [{ id: 9 }],
      generateDraftSchedule: () => ({ ok: false, errors: { form: 'gen fail' } }),
      editDraftSchedule: () => ({ ok: false, errors: { form: 'edit fail' } }),
      publishSchedule: async () => ({ ok: false, errors: { form: 'publish fail' } }),
      getPublishedSchedule: () => null,
    },
  });
  assert.equal(scheduleController.generateDraft({ body: {} }).status, 422);
  assert.equal(scheduleController.editDraft({ body: {} }).status, 422);
  assert.equal((await scheduleController.publish({ body: { scheduleId: 1 } })).status, 422);
  assert.equal(scheduleController.showPublicSchedule({ body: {} }).status, 404);

  const cancelAndWarningController = new ScheduleController({
    scheduleService: {
      listAcceptedSubmissions: () => [],
      listDraftSchedules: () => [{ id: 2 }],
      generateDraftSchedule: () => ({ ok: true, schedule: { id: 2 }, items: [], previewHtml: '' }),
      editDraftSchedule: () => ({ ok: true, cancelled: true, items: [{ id: 1 }] }),
      publishSchedule: async () => ({ ok: true, schedule: { id: 2 }, notificationWarning: 'partial' }),
      getPublishedSchedule: () => ({ id: 2, status: 'final' }),
    },
  });
  assert.equal(cancelAndWarningController.editDraft({ body: {} }).body.message, 'Edits cancelled. Last saved draft restored.');
  const publish = await cancelAndWarningController.publish({ body: { scheduleId: 2, confirmed: true } });
  assert.equal(publish.status, 200);
  assert.equal(publish.body.view, 'schedule_publish.html');

  const updatedController = new ScheduleController({
    scheduleService: {
      listAcceptedSubmissions: () => [],
      listDraftSchedules: () => [{ id: 3 }],
      generateDraftSchedule: () => ({ ok: true, schedule: { id: 3 }, items: [], previewHtml: '', acceptedPapers: [] }),
      editDraftSchedule: () => ({ ok: true, items: [{ id: 1 }], previewHtml: '<table></table>' }),
      publishSchedule: async () => ({ ok: true, schedule: { id: 3 } }),
      getPublishedSchedule: () => ({ id: 3, status: 'final' }),
    },
  });
  const updated = updatedController.editDraft({ body: {} });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.message, 'Draft updated.');
  const redirectPublish = await updatedController.publish({ body: { scheduleId: 3, confirmed: true } });
  assert.match(redirectPublish.body.redirectTo, /schedule\/public/);
});

test('submission controller covers resume miss and both error status branches', async () => {
  const submissionController = new SubmissionController({
    submissionService: {
      resumeDraft: () => ({ ok: false, errors: { save: 'missing' } }),
      createSubmission: async () => ({ ok: false, code: 'SUBMISSION_WINDOW_CLOSED', errors: { form: 'closed' } }),
      replaceManuscript: async () => ({ ok: false, errors: { file: 'bad' } }),
      listDrafts: () => [],
      listSubmittedByAuthor: () => [],
      saveDraft: () => ({ ok: false, errors: { save: 'save fail' } }),
      submitDraft: async () => ({ ok: false, code: 'VALIDATION_ERROR', errors: { title: 'missing' } }),
    },
  });

  const form = submissionController.showSubmitForm({ session: { accountId: 1 }, body: { draftId: 99 } });
  assert.equal(form.body.draft, null);
  assert.equal((await submissionController.submit({ session: { accountId: 1 }, body: {} })).status, 400);
  assert.equal((await submissionController.replace({ body: {} })).status, 422);
  assert.equal(submissionController.saveDraft({ session: { accountId: 1 }, body: {} }).status, 422);
  assert.equal(submissionController.resumeDraft({ session: { accountId: 1 }, body: { submissionId: 5 } }).status, 404);
  assert.equal((await submissionController.submitDraft({ session: { accountId: 1 }, body: { submissionId: 1 } })).status, 422);

  const validationController = new SubmissionController({
    submissionService: {
      resumeDraft: () => ({ ok: false }),
      createSubmission: async () => ({ ok: false, code: 'VALIDATION_ERROR', errors: { title: 'missing' } }),
      replaceManuscript: async () => ({ ok: true }),
      listDrafts: () => [],
      listSubmittedByAuthor: () => [],
      saveDraft: () => ({ ok: true }),
      submitDraft: async () => ({ ok: false, code: 'SUBMISSION_WINDOW_CLOSED', errors: { window: 'closed' } }),
    },
  });
  assert.equal((await validationController.submit({ session: { accountId: 1 }, body: {} })).status, 422);
  assert.equal((await validationController.submitDraft({ session: { accountId: 1 }, body: { submissionId: 1 } })).status, 400);
});

test('ticket controller covers fallback statuses and authorization branches', () => {
  const errorController = new TicketController({
    ticketService: { getTicket: () => ({ ok: false, errors: { form: 'missing' } }) },
  });
  const missing = errorController.showTicket({ session: { accountId: 1, roles: ['attendee'] }, body: { registrationId: 2 } });
  assert.equal(missing.status, 404);

  const ownerController = new TicketController({
    ticketService: { getTicket: () => ({ ok: true, ticket: { id: 1 }, registration: { attendeeAccountId: 77 } }) },
  });
  const owner = ownerController.showTicket({ session: { accountId: 77, roles: ['attendee'] }, body: { registrationId: 3 } });
  assert.equal(owner.status, 200);

  const forbidden = ownerController.showTicket({ session: { accountId: 12, roles: ['reviewer'] }, body: { registrationId: 3 } });
  assert.equal(forbidden.status, 403);
});

test('router/access-control/error/session/model helper branch coverage boosters', () => {
  assert.equal(isAuthorizedUser({ accountId: 1 }), true);
  assert.equal(isAuthorizedUser({}), false);
  assert.equal(hasAnyRole({ roles: ['author'] }, []), true);
  assert.equal(hasAnyRole(null, ['author']), false);
  assert.equal(canAccessRoute({ session: null, isPublic: true }), true);
  assert.equal(canAccessRoute({ session: { accountId: 1, roles: ['author'] }, allowedRoles: ['editor'] }), false);

  const router = new Router({
    sessionService: {
      getSession: (token) => (token === 'author-token' ? { accountId: 1, roles: ['author'] } : null),
    },
  });
  router.register('GET', '/editor-only', () => ({ status: 200, body: { ok: true } }), { allowedRoles: ['editor'] });
  const denied = router.dispatch({ method: 'GET', path: '/editor-only', headers: { 'x-session-token': 'author-token' } });
  assert.equal(denied.status, 403);
  assert.match(denied.body.error, /Access denied/);

  const service = new SessionService();
  const created = service.createSession({ id: 42 });
  assert.deepEqual(created.roles, []);

  assert.equal(redactSensitiveFields(null), null);
  assert.equal(redactSensitiveFields('x'), 'x');
  const arrPayload = redactSensitiveFields([{ password: 'secret' }]);
  assert.ok(Array.isArray(arrPayload));
  assert.equal(retryLaterError('custom').message, 'custom');

  const txnDefault = new PaymentTransaction({ id: 1, registrationId: 2, status: 'approved', processedAt: 'x' });
  assert.equal(txnDefault.amount, 0);
  const pricingDefault = new PricingCategory({ id: 2, attendeeType: 'student' });
  assert.equal(pricingDefault.price, 0);
});

test('controller default-value and parser branches are covered explicitly', async () => {
  const captured = { assignArgs: null };
  const reviewController = new ReviewController({
    reviewService: {
      listReviewerDirectory: () => [{ id: 1 }],
      listSubmittedPapers: () => [{ id: 2 }],
      assignReviewers: async (args) => {
        captured.assignArgs = args;
        return { ok: true, assignments: [] };
      },
      listInvitations: () => [{ id: 3 }],
      respondInvitation: async () => ({ ok: true, assignment: { status: 'accepted' } }),
      listAcceptedAssignments: () => [{ id: 4 }],
      getReviewForm: () => ({ ok: true, form: { id: 5 }, manuscriptUrl: '/assets/uploads/m.pdf', manuscriptFileName: 'm.pdf' }),
      saveReviewDraft: () => ({ ok: true }),
      submitReview: async () => ({ ok: true }),
      listPapersReadyForDecision: () => [{ id: 6 }],
      listDecidedPapers: () => [{ id: 7 }],
      getSubmissionDecisionSummary: ({ submissionId }) => ({ id: Number(submissionId), status: 'accepted' }),
      getEditorReviewSet: () => ({ ok: true, reviews: [{ id: 1 }], manuscriptUrl: '/assets/uploads/m.pdf', manuscriptFileName: 'm.pdf' }),
      submitDecision: async () => ({ ok: true, decision: { id: 9 }, notificationWarning: '' }),
    },
  });

  await reviewController.assignReviewers({
    body: { reviewerEmails: 'x@example.com, y@example.com', reviewerIds: 'not-an-array', submissionId: 42, reviewDeadline: '2099-01-01T00:00:00Z' },
  });
  assert.deepEqual(captured.assignArgs.reviewerIds, []);
  assert.deepEqual(captured.assignArgs.reviewerEmails, ['x@example.com', 'y@example.com']);

  const invitationView = reviewController.showInvitationView({
    session: { accountId: 1 },
    body: { assignmentId: 123, message: 'hello' },
  });
  assert.equal(invitationView.body.assignmentId, 123);
  assert.equal(invitationView.body.message, 'hello');

  const assignmentsView = reviewController.showReviewerAssignments({
    session: { accountId: 1 },
    body: { message: 'updated' },
  });
  assert.equal(assignmentsView.body.message, 'updated');

  const formView = reviewController.showReviewForm({
    session: { accountId: 1 },
    body: { assignmentId: 8, message: 'from-query' },
  });
  assert.equal(formView.body.assignmentId, 8);
  assert.equal(formView.body.message, 'from-query');

  assert.equal(reviewController.showDecisionForm({ body: {} }).body.submissionSummary, null);
  const withSubmission = reviewController.showDecisionForm({ body: { submissionId: 6 } });
  assert.equal(withSubmission.body.submissionSummary.id, 6);

  const decision = await reviewController.submitDecision({
    session: { accountId: 1 },
    body: { submissionId: 6, decision: 'accept', rationale: 'ok' },
  });
  assert.match(decision.body.message, /ACCEPTED/);

  const scheduleController = new ScheduleController({
    scheduleService: {
      listAcceptedSubmissions: () => [{ id: 1 }],
      listDraftSchedules: () => [{ id: 2 }],
      generateDraftSchedule: () => ({ ok: true, schedule: { id: 2 }, items: [], previewHtml: '<table></table>', acceptedPapers: [{ id: 1 }] }),
      editDraftSchedule: () => ({ ok: true, items: [{ id: 1 }], previewHtml: '<table></table>' }),
      publishSchedule: async () => ({ ok: true, schedule: {}, notificationWarning: 'warn' }),
      getPublishedSchedule: () => ({ id: 2, status: 'final' }),
    },
  });
  assert.equal(scheduleController.showPublishView({ body: { scheduleId: 2 } }).body.selectedScheduleId, 2);
  assert.equal(scheduleController.generateDraft({ body: {} }).body.acceptedPapers.length, 1);
  assert.equal(scheduleController.editDraft({ body: {} }).body.previewHtml, '<table></table>');
  const publishWarn = await scheduleController.publish({ body: { scheduleId: '' } });
  assert.equal(publishWarn.body.selectedScheduleId, '');
  assert.equal(scheduleController.showPublicSchedule({ body: { scheduleId: 2 } }).status, 200);

  const registrationController = new RegistrationController({
    pricingService: { listPricing: () => ({ ok: true, categories: [{ id: 3 }] }) },
    paymentService: {
      processRegistrationPayment: async () => ({
        ok: false,
        errors: { form: 'declined' },
        registration: { id: 10 },
        payment: { id: 11 },
      }),
      sanitizePaymentPayload: (payload) => payload,
    },
  });
  const registrationFail = await registrationController.submit({ session: null, body: { cardNumber: '123' } });
  assert.equal(registrationFail.body.registration.id, 10);
  assert.equal(registrationFail.body.payment.id, 11);

  const registrationControllerSessionBranches = new RegistrationController({
    pricingService: { listPricing: () => ({ ok: true, categories: [] }) },
    paymentService: {
      processRegistrationPayment: async () => ({
        ok: true,
        registration: null,
        payment: { id: 22 },
        ticket: { id: 23 },
      }),
      sanitizePaymentPayload: (payload) => payload,
    },
  });
  const sessionButNoRegistration = await registrationControllerSessionBranches.submit({
    session: { accountId: 9 },
    body: {},
  });
  assert.equal(sessionButNoRegistration.body.view, 'registration.html');

  const reviewControllerStatusFallback = new ReviewController({
    reviewService: {
      listReviewerDirectory: () => [],
      listSubmittedPapers: () => [],
      assignReviewers: async () => ({ ok: true, assignments: [] }),
      listInvitations: () => [],
      respondInvitation: async () => ({ ok: true, assignment: { status: 'accepted' } }),
      listAcceptedAssignments: () => [],
      getReviewForm: () => ({ ok: true, form: null, manuscriptUrl: '', manuscriptFileName: '' }),
      saveReviewDraft: () => ({ ok: true }),
      submitReview: async () => ({ ok: true }),
      listPapersReadyForDecision: () => [],
      listDecidedPapers: () => [],
      getSubmissionDecisionSummary: () => ({ status: '' }),
      getEditorReviewSet: () => ({ ok: true, reviews: [] }),
      submitDecision: async () => ({ ok: true, decision: { id: 1 }, notificationWarning: '' }),
    },
  });
  const decisionFallbackStatus = await reviewControllerStatusFallback.submitDecision({
    session: { accountId: 1 },
    body: { submissionId: 9 },
  });
  assert.match(decisionFallbackStatus.body.message, /UPDATED/);

  const scheduleDefaultsController = new ScheduleController({
    scheduleService: {
      listAcceptedSubmissions: () => [{ id: 99 }],
      listDraftSchedules: () => [{ id: 77 }],
      generateDraftSchedule: () => ({ ok: true, schedule: { id: 1 } }),
      editDraftSchedule: () => ({ ok: true }),
      publishSchedule: async () => ({ ok: false, errors: { form: 'publish failed' } }),
      getPublishedSchedule: () => ({ id: 4, status: 'final' }),
    },
  });
  const generatedDefaults = scheduleDefaultsController.generateDraft({ body: {} });
  assert.deepEqual(generatedDefaults.body.items, []);
  assert.equal(generatedDefaults.body.previewHtml, '');
  assert.equal(generatedDefaults.body.acceptedPapers[0].id, 99);
  const editedDefaults = scheduleDefaultsController.editDraft({ body: {} });
  assert.deepEqual(editedDefaults.body.items, []);
  assert.equal(editedDefaults.body.previewHtml, '');
  const publishFailDefaults = await scheduleDefaultsController.publish({ body: {} });
  assert.equal(publishFailDefaults.body.selectedScheduleId, '');
});

test('review controller exhaustive branch toggles', async () => {
  const failController = new ReviewController({
    reviewService: {
      listReviewerDirectory: () => [],
      listSubmittedPapers: () => [],
      assignReviewers: async () => ({ ok: false, errors: { form: 'nope' } }),
      listInvitations: () => [],
      respondInvitation: async () => ({ ok: false, errors: { form: 'nope' } }),
      listAcceptedAssignments: () => [],
      getReviewForm: () => ({ ok: false, errors: { form: 'nope' } }),
      saveReviewDraft: () => ({ ok: false, errors: { form: 'nope' } }),
      submitReview: async () => ({ ok: false, errors: { form: 'nope' } }),
      listPapersReadyForDecision: () => [],
      listDecidedPapers: () => [],
      getSubmissionDecisionSummary: () => null,
      getEditorReviewSet: () => ({ ok: false, errors: { form: 'nope' }, manuscriptUrl: null, manuscriptFileName: null }),
      submitDecision: async () => ({ ok: false, errors: { form: 'nope' } }),
    },
  });
  assert.equal((await failController.assignReviewers({ body: { reviewerEmails: [], reviewerIds: [] } })).status, 422);
  assert.equal((await failController.respondInvitation({ session: { accountId: 1 }, body: {} })).body.assignmentId, '');
  assert.equal(failController.showReviewForm({ session: { accountId: 1 }, body: {} }).body.assignmentId, '');
  assert.equal(failController.saveReviewDraft({ session: { accountId: 1 }, body: {} }).body.assignmentId, '');
  assert.equal((await failController.submitReview({ session: { accountId: 1 }, body: {} })).body.assignmentId, '');
  assert.equal(failController.showEditorReviews({ body: { submissionId: 0 } }).status, 200);
  assert.equal(failController.showEditorReviews({ body: { submissionId: 9 } }).status, 422);
  const failDecision = await failController.submitDecision({ session: { accountId: 1 }, body: {} });
  assert.equal(failDecision.status, 422);
  assert.equal(failDecision.body.submissionId, '');

  const successController = new ReviewController({
    reviewService: {
      listReviewerDirectory: () => [{ id: 1 }],
      listSubmittedPapers: () => [{ id: 2 }],
      assignReviewers: async () => ({ ok: true, assignments: [{ id: 1 }] }),
      listInvitations: () => [{ id: 3 }],
      respondInvitation: async ({ response }) => ({ ok: true, assignment: { status: response === 'decline' ? 'declined' : 'accepted' } }),
      listAcceptedAssignments: () => [{ id: 4 }],
      getReviewForm: () => ({ ok: true, form: null, manuscriptUrl: null, manuscriptFileName: null }),
      saveReviewDraft: () => ({ ok: true }),
      submitReview: async () => ({ ok: true }),
      listPapersReadyForDecision: () => [{ id: 5 }],
      listDecidedPapers: () => [{ id: 6 }],
      getSubmissionDecisionSummary: ({ submissionId }) => ({ id: Number(submissionId), status: submissionId ? 'accepted' : '' }),
      getEditorReviewSet: () => ({ ok: true, reviews: [{ id: 10 }], manuscriptUrl: null, manuscriptFileName: null }),
      submitDecision: async () => ({ ok: true, decision: { id: 11 }, notificationWarning: 'warn' }),
    },
  });
  assert.equal((await successController.assignReviewers({ body: { reviewerEmails: 'a@x.com,,b@x.com' } })).status, 201);
  assert.match((await successController.respondInvitation({ session: { accountId: 1 }, body: { response: 'accept' } })).body.redirectTo, /accepted/);
  assert.match((await successController.respondInvitation({ session: { accountId: 1 }, body: { response: 'decline' } })).body.redirectTo, /declined/);
  const successForm = successController.showReviewForm({
    session: { accountId: 1 },
    body: { assignmentId: 5, message: 'ok' },
  });
  assert.equal(successForm.body.assignmentId, 5);
  assert.equal(successForm.body.message, 'ok');
  assert.match(successController.saveReviewDraft({ session: { accountId: 1 }, body: { assignmentId: 2 } }).body.redirectTo, /assignmentId=2/);
  assert.match((await successController.submitReview({ session: { accountId: 1 }, body: {} })).body.redirectTo, /review-submitted/);
  const successEditor = successController.showEditorReviews({ body: { submissionId: 7 } });
  assert.equal(successEditor.status, 200);
  assert.equal(successEditor.body.manuscriptUrl, '');
  const showDecisionNoSubmission = successController.showDecisionForm({ body: {} });
  assert.equal(showDecisionNoSubmission.body.submissionSummary, null);
  const decisionResult = await successController.submitDecision({
    session: { accountId: 1 },
    body: { submissionId: 7, decision: 'accept' },
  });
  assert.equal(decisionResult.status, 200);
  assert.equal(decisionResult.body.warning, 'warn');

  const manuscriptController = new ReviewController({
    reviewService: {
      listReviewerDirectory: () => [],
      listSubmittedPapers: () => [],
      assignReviewers: async () => ({ ok: true, assignments: [] }),
      listInvitations: () => [],
      respondInvitation: async () => ({ ok: true, assignment: { status: 'accepted' } }),
      listAcceptedAssignments: () => [],
      getReviewForm: () => ({
        ok: true,
        form: { id: 99 },
        manuscriptUrl: '/assets/uploads/final.pdf',
        manuscriptFileName: 'final.pdf',
      }),
      saveReviewDraft: () => ({ ok: true }),
      submitReview: async () => ({ ok: true }),
      listPapersReadyForDecision: () => [{ id: 1 }],
      listDecidedPapers: () => [{ id: 2 }],
      getSubmissionDecisionSummary: () => ({ id: 1, status: 'accepted' }),
      getEditorReviewSet: () => ({
        ok: true,
        reviews: [{ id: 1 }],
        manuscriptUrl: '/assets/uploads/editor.pdf',
        manuscriptFileName: 'editor.pdf',
      }),
      submitDecision: async () => ({ ok: true, decision: { id: 1 }, notificationWarning: '' }),
    },
  });
  const manuscriptForm = manuscriptController.showReviewForm({
    session: { accountId: 1 },
    body: { assignmentId: 1 },
  });
  assert.equal(manuscriptForm.body.manuscriptUrl, '/assets/uploads/final.pdf');
  assert.equal(manuscriptForm.body.manuscriptFileName, 'final.pdf');
  const editorWithManuscript = manuscriptController.showEditorReviews({ body: { submissionId: 1 } });
  assert.equal(editorWithManuscript.body.manuscriptUrl, '/assets/uploads/editor.pdf');
  assert.equal(editorWithManuscript.body.manuscriptFileName, 'editor.pdf');
});
