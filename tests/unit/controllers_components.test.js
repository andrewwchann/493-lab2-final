const test = require('node:test');
const assert = require('node:assert/strict');

const { RegisterController } = require('../../src/controllers/register_controller');
const { LoginController } = require('../../src/controllers/login_controller');
const { PasswordController } = require('../../src/controllers/password_controller');
const { SubmissionController } = require('../../src/controllers/submission_controller');
const { ReviewController } = require('../../src/controllers/review_controller');
const { NotificationController } = require('../../src/controllers/notification_controller');
const { ScheduleController } = require('../../src/controllers/schedule_controller');
const { PricingController } = require('../../src/controllers/pricing_controller');
const { RegistrationController } = require('../../src/controllers/registration_controller');
const { TicketController } = require('../../src/controllers/ticket_controller');
const { DataStore } = require('../../src/services/data_store');

test('register and login controllers map service responses to status/view/redirect', () => {
  let registerArgs = null;
  const registerController = new RegisterController({
    registrationService: {
      register: (args) => {
        registerArgs = args;
        return { ok: true, account: { id: 10 }, redirectTo: '/login' };
      },
    },
  });
  const reg = registerController.submit({ body: { email: 'a@b.com', password: 'X1!aaaaa', accountType: 'author' } });
  assert.equal(reg.status, 201);
  assert.equal(reg.body.redirectTo, '/login');
  assert.equal(registerArgs.accountType, 'author');

  const loginController = new LoginController({
    authService: {
      login: () => ({ ok: true, redirectTo: '/dashboard/editor', session: { token: 'tok' } }),
    },
  });
  const login = loginController.submit({ body: { identifier: 'a@b.com', password: 'x' } });
  assert.equal(login.status, 200);
  assert.equal(login.body.redirectTo, '/dashboard/editor');
  assert.equal(loginController.showForm().status, 200);

  const dashboard = loginController.showDashboard({ session: { accountId: 1 }, role: 'editor', message: 'm' });
  assert.equal(dashboard.body.view, 'dashboard.html');
  assert.deepEqual(dashboard.body.authorNotifications, []);
  assert.equal(dashboard.body.attendance, null);

  const ds = new DataStore();
  ds.insert('author_notifications', {
    authorAccountId: 1,
    submissionId: 10,
    message: 'Your paper has been approved for the conference.',
    deliveryStatus: 'sent',
    createdAt: '2026-03-01T00:00:00Z',
  });
  ds.insert('author_notifications', {
    authorAccountId: 1,
    submissionId: 12,
    message: 'Your paper was not accepted for this conference.',
    deliveryStatus: 'sent',
    createdAt: '2026-02-01T00:00:00Z',
  });
  ds.insert('author_notifications', {
    authorAccountId: 99,
    submissionId: 11,
    message: 'not for this user',
    deliveryStatus: 'sent',
    createdAt: '2026-03-01T00:00:00Z',
  });
  const authorDashboard = new LoginController({
    authService: { login: () => ({ ok: true, redirectTo: '/dashboard/author', session: { token: 'tok' } }) },
    dataStore: ds,
  }).showDashboard({ session: { accountId: 1 }, role: 'author', message: '' });
  assert.equal(authorDashboard.body.authorNotifications.length, 2);
  assert.match(authorDashboard.body.authorNotifications[0].message, /approved/i);

  const attendanceRegistration = ds.insert('registrations', {
    attendeeAccountId: 1,
    attendeeName: 'A',
    pricingCategoryId: 1,
    status: 'registered',
    createdAt: '2026-03-02T00:00:00Z',
  });
  ds.insert('tickets', { registrationId: attendanceRegistration.id, ticketReference: 'TKT-1', status: 'generated' });
  ds.insert('registrations', {
    attendeeAccountId: 1,
    attendeeName: 'A',
    pricingCategoryId: 1,
    status: 'registered',
    createdAt: '2026-02-01T00:00:00Z',
  });
  const attendanceDashboard = new LoginController({
    authService: { login: () => ({ ok: true, redirectTo: '/dashboard/author', session: { token: 'tok' } }) },
    dataStore: ds,
  }).showDashboard({ session: { accountId: 1 }, role: 'author', message: '' });
  assert.equal(attendanceDashboard.body.attendance.canAttend, true);
  assert.equal(attendanceDashboard.body.attendance.ticketReference, 'TKT-1');

  const dsNoTicket = new DataStore();
  dsNoTicket.insert('registrations', {
    attendeeAccountId: 1,
    attendeeName: 'A',
    pricingCategoryId: 1,
    status: 'ticket_pending',
    createdAt: '2026-03-02T00:00:00Z',
  });
  const pendingAttendanceDashboard = new LoginController({
    authService: { login: () => ({ ok: true, redirectTo: '/dashboard/author', session: { token: 'tok' } }) },
    dataStore: dsNoTicket,
  }).showDashboard({ session: { accountId: 1 }, role: 'author', message: '' });
  assert.equal(pendingAttendanceDashboard.body.attendance.canAttend, false);
  assert.equal(pendingAttendanceDashboard.body.attendance.ticketReference, '');

  const dsRegisteredNoTicket = new DataStore();
  dsRegisteredNoTicket.insert('registrations', {
    attendeeAccountId: 1,
    attendeeName: 'A',
    pricingCategoryId: 1,
    status: 'registered',
    createdAt: '2026-03-02T00:00:00Z',
  });
  const registeredNoTicketDashboard = new LoginController({
    authService: { login: () => ({ ok: true, redirectTo: '/dashboard/author', session: { token: 'tok' } }) },
    dataStore: dsRegisteredNoTicket,
  }).showDashboard({ session: { accountId: 1 }, role: 'author', message: '' });
  assert.equal(registeredNoTicketDashboard.body.attendance.canAttend, true);

  const dsMissingStatus = new DataStore();
  dsMissingStatus.insert('registrations', {
    attendeeAccountId: 1,
    attendeeName: 'A',
    pricingCategoryId: 1,
    createdAt: '2026-03-02T00:00:00Z',
  });
  const missingStatusDashboard = new LoginController({
    authService: { login: () => ({ ok: true, redirectTo: '/dashboard/author', session: { token: 'tok' } }) },
    dataStore: dsMissingStatus,
  }).showDashboard({ session: { accountId: 1 }, role: 'author', message: '' });
  assert.equal(missingStatusDashboard.body.attendance.status, '');
});

test('password controller maps error codes and success redirect', () => {
  const controller = new PasswordController({
    authService: {
      changePassword: () => ({ ok: false, code: 'INVALID_CURRENT_PASSWORD' }),
    },
  });
  const bad = controller.submit({
    session: { accountId: 1, roles: ['author'] },
    body: { currentPassword: 'x', newPassword: 'y', confirmNewPassword: 'y' },
  });
  assert.equal(bad.status, 400);
  assert.match(bad.body.errors.form, /incorrect/i);

  const okController = new PasswordController({ authService: { changePassword: () => ({ ok: true }) } });
  const ok = okController.submit({
    session: { accountId: 1, roles: ['reviewer'] },
    body: { currentPassword: 'x', newPassword: 'y', confirmNewPassword: 'y' },
  });
  assert.equal(ok.status, 200);
  assert.match(ok.body.redirectTo, /dashboard\/reviewer/);
});

test('submission controller handles form, save, resume and submit routes', async () => {
  const controller = new SubmissionController({
    submissionService: {
      resumeDraft: () => ({ ok: true, draft: { id: 44 } }),
      createSubmission: async () => ({ ok: true, submission: { id: 99 } }),
      replaceManuscript: async () => ({ ok: true, manuscript: { id: 2 } }),
      listDrafts: () => [{ id: 1 }],
      listSubmittedByAuthor: () => [{ id: 2 }],
      saveDraft: () => ({ ok: true, draft: { id: 1 } }),
      submitDraft: async () => ({ ok: true, submission: { id: 1 } }),
    },
  });

  const show = controller.showSubmitForm({ session: { accountId: 1 }, body: { draftId: 44 } });
  assert.equal(show.status, 200);
  assert.equal(show.body.draft.id, 44);

  const submitted = await controller.submit({ session: { accountId: 1 }, body: {} });
  assert.equal(submitted.status, 201);
  assert.match(submitted.body.redirectTo, /paper-submitted/);

  const replaced = await controller.replace({ body: {} });
  assert.equal(replaced.status, 200);

  const list = controller.showDraftList({ session: { accountId: 1 } });
  assert.equal(list.body.drafts.length, 1);
  assert.equal(list.body.submittedPapers.length, 1);

  const resumed = controller.resumeDraft({ session: { accountId: 1 }, body: { submissionId: 44 } });
  assert.equal(resumed.status, 302);

  const saved = controller.saveDraft({ session: { accountId: 1 }, body: {} });
  assert.equal(saved.status, 201);

  const submitDraft = await controller.submitDraft({ session: { accountId: 1 }, body: {} });
  assert.equal(submitDraft.status, 200);
});

test('review/schedule controllers expose expected views and redirects', async () => {
  const reviewController = new ReviewController({
    reviewService: {
      listPapersReadyForDecision: () => [{ id: 1, completedReviewCount: 3 }],
      listDecidedPapers: () => [{ id: 8, status: 'accepted', decision: 'accept', decidedAt: 'now' }],
      getSubmissionDecisionSummary: ({ submissionId }) => ({
        id: Number(submissionId || 1),
        status: 'reviews_complete',
        completedReviewCount: 3,
      }),
      listReviewerDirectory: () => [],
      listSubmittedPapers: () => [],
      assignReviewers: async () => ({ ok: true, assignments: [{ id: 1, submissionId: 1, reviewerAccountId: 2 }] }),
      listInvitations: () => [{ id: 1 }],
      respondInvitation: async () => ({ ok: true, assignment: { status: 'accepted' } }),
      listAcceptedAssignments: () => [{ id: 1 }],
      getReviewForm: () => ({ ok: true, form: null, manuscriptUrl: '', manuscriptFileName: '' }),
      saveReviewDraft: () => ({ ok: true }),
      submitReview: async () => ({ ok: true }),
      getEditorReviewSet: () => ({ ok: true, reviews: [{ id: 1 }], manuscriptUrl: '', manuscriptFileName: '' }),
      submitDecision: async () => ({ ok: true, decision: { id: 10 }, notificationWarning: '' }),
    },
  });

  assert.equal(reviewController.showAssignReviewersView().status, 200);
  assert.equal((await reviewController.assignReviewers({ body: {} })).status, 201);
  assert.equal(reviewController.showInvitationView({ session: { accountId: 1 } }).status, 200);
  assert.match((await reviewController.respondInvitation({ session: { accountId: 1 }, body: {} })).body.redirectTo, /reviews\/assignments/);
  assert.equal(reviewController.showReviewerAssignments({ session: { accountId: 1 } }).status, 200);
  assert.equal(reviewController.showReviewForm({ session: { accountId: 1 }, body: {} }).status, 200);
  assert.match(reviewController.saveReviewDraft({ session: { accountId: 1 }, body: { assignmentId: 1 } }).body.redirectTo, /review-saved/);
  assert.match((await reviewController.submitReview({ session: { accountId: 1 }, body: {} })).body.redirectTo, /review-submitted/);
  assert.equal(reviewController.showEditorReviews({ body: {} }).status, 200);
  assert.equal(reviewController.showDecisionForm({ body: { submissionId: 5 } }).body.submissionId, 5);
  const decisionResult = await reviewController.submitDecision({
    session: { accountId: 1 },
    body: { submissionId: 5, decision: 'accept' },
  });
  assert.equal(decisionResult.status, 200);
  assert.equal(decisionResult.body.view, 'decision.html');
  assert.match(decisionResult.body.message, /Final decision saved/);

  const scheduleController = new ScheduleController({
    scheduleService: {
      listAcceptedSubmissions: () => [{ id: 11, title: 'Accepted' }],
      listDraftSchedules: () => [{ id: 4, itemCount: 2 }],
      generateDraftSchedule: () => ({ ok: true, schedule: { id: 1 }, items: [], previewHtml: '<table></table>' }),
      editDraftSchedule: () => ({ ok: true, items: [], previewHtml: '<table></table>' }),
      publishSchedule: async () => ({ ok: true, schedule: { id: 1 } }),
      getPublishedSchedule: () => ({ id: 1, status: 'final' }),
    },
  });

  assert.equal(scheduleController.showGenerateView().body.view, 'schedule_preview.html');
  assert.equal(scheduleController.showGenerateView().body.acceptedPapers.length, 1);
  assert.equal(scheduleController.showEditView().body.view, 'schedule_edit.html');
  assert.equal(scheduleController.showPublishView().body.view, 'schedule_publish.html');
  assert.equal(scheduleController.showPublishView().body.draftSchedules.length, 1);
  assert.equal(scheduleController.generateDraft({ body: {} }).status, 201);
  assert.equal(scheduleController.editDraft({ body: {} }).status, 200);
  assert.match((await scheduleController.publish({ body: { scheduleId: 1, confirmed: true } })).body.redirectTo, /schedule\/public/);
  assert.equal(scheduleController.showPublicSchedule({ body: {} }).status, 200);
});

test('pricing/registration/ticket/notification controllers map service outputs', async () => {
  const pricingController = new PricingController({ pricingService: { listPricing: () => ({ ok: true, categories: [{ id: 1 }] }) } });
  assert.equal(pricingController.showPricing().status, 200);

  const registrationController = new RegistrationController({
    pricingService: { listPricing: () => ({ ok: true, categories: [{ id: 1 }] }) },
    paymentService: {
      processRegistrationPayment: async ({ attendeeAccountId }) =>
        attendeeAccountId
          ? { ok: true, registration: { id: 9 }, payment: {}, ticket: { id: 1 } }
          : { ok: false, status: 401, errors: { form: 'Please sign in as an attendee before registering for the conference.' } },
      sanitizePaymentPayload: (x) => x,
    },
  });

  assert.equal(registrationController.showForm().status, 200);
  const regGuest = await registrationController.submit({ session: null, body: {} });
  assert.equal(regGuest.status, 401);
  assert.equal(regGuest.body.view, 'registration.html');
  assert.match(regGuest.body.errors.form, /sign in as an attendee/i);
  const regAuthed = await registrationController.submit({ session: { accountId: 5, roles: ['author'] }, body: {} });
  assert.match(regAuthed.body.redirectTo, /dashboard\/author/);
  assert.match(regAuthed.body.redirectTo, /registration-complete/);

  const ticketController = new TicketController({
    ticketService: {
      getTicket: () => ({ ok: true, ticket: { id: 1 }, registration: { id: 2, attendeeAccountId: 5 } }),
    },
  });
  assert.equal(ticketController.showTicket({ session: { accountId: 5, roles: ['author'] }, body: { registrationId: 2 } }).status, 200);
  assert.equal(ticketController.showTicket({ session: { accountId: 99, roles: ['reviewer'] }, body: { registrationId: 2 } }).status, 403);

  const ds = new DataStore();
  ds.insert('submissions', { id: 1, authorAccountId: 7, title: 'T' });
  const notificationController = new NotificationController({
    dataStore: ds,
    notificationService: { notifyAuthorDecision: async () => ({ status: 'sent' }) },
  });
  const notified = await notificationController.notifyAuthorDecision({ body: { submissionId: 1, decision: 'accept' } });
  assert.equal(notified.status, 200);
});
