const fs = require('fs');
const path = require('path');

const { DataStore } = require('../../src/services/data_store');
const { SessionService } = require('../../src/services/session_service');
const { RegistrationService } = require('../../src/services/registration_service');
const { AuthService } = require('../../src/services/auth_service');
const { FileUploadService } = require('../../src/services/file_upload_service');
const { SubmissionService } = require('../../src/services/submission_service');
const { ReviewService } = require('../../src/services/review_service');
const { NotificationService } = require('../../src/services/notification_service');
const { NotificationController } = require('../../src/controllers/notification_controller');
const { PublicationService } = require('../../src/services/publication_service');
const { ScheduleService } = require('../../src/services/schedule_service');
const { ScheduleController } = require('../../src/controllers/schedule_controller');
const { PricingService } = require('../../src/services/pricing_service');
const { PaymentGatewayService } = require('../../src/services/payment_gateway_service');
const { TicketService } = require('../../src/services/ticket_service');
const { PaymentService } = require('../../src/services/payment_service');

function check(id, name, pass, details) {
  return { id, name, pass: Boolean(pass), details };
}

function countStatus(checks) {
  const passed = checks.filter((row) => row.pass).length;
  return { passed, total: checks.length, failed: checks.length - passed };
}

async function runSC001() {
  const dataStore = new DataStore();
  const registrationService = new RegistrationService({ dataStore });
  const checks = [];

  const created = registrationService.register({ email: 'alice@example.com', password: 'ValidPass123!' });
  checks.push(check('SC001-01', 'Valid registration succeeds', created.ok && created.redirectTo === '/login', created));

  const duplicate = registrationService.register({ email: 'alice@example.com', password: 'ValidPass123!' });
  checks.push(
    check(
      'SC001-02',
      'Duplicate email is rejected',
      !duplicate.ok && duplicate.errors && duplicate.errors.email,
      duplicate
    )
  );

  const invalidEmail = registrationService.register({ email: 'not-an-email', password: 'ValidPass123!' });
  checks.push(
    check(
      'SC001-03',
      'Invalid email format is rejected',
      !invalidEmail.ok && invalidEmail.errors && invalidEmail.errors.email,
      invalidEmail
    )
  );

  return { scenario: 'sc-001', title: 'UC-01 and UC-02', checks };
}

async function runSC002() {
  const dataStore = new DataStore();
  const sessionService = new SessionService();
  const registrationService = new RegistrationService({ dataStore });
  const authService = new AuthService({ dataStore, sessionService });
  const checks = [];

  registrationService.register({ email: 'bob@example.com', password: 'ValidPass123!' });
  const success = authService.login({ identifier: 'bob@example.com', password: 'ValidPass123!' });
  checks.push(check('SC002-01', 'Login success creates session', success.ok && success.session && success.redirectTo, success));

  const invalid = authService.login({ identifier: 'bob@example.com', password: 'wrong' });
  checks.push(
    check(
      'SC002-02',
      'Login failure returns invalid-password error',
      !invalid.ok && invalid.code === 'INVALID_PASSWORD',
      invalid
    )
  );

  authService.setAvailability(false);
  const unavailable = authService.login({ identifier: 'bob@example.com', password: 'ValidPass123!' });
  checks.push(
    check(
      'SC002-03',
      'Unavailable auth service returns retry-later flow',
      !unavailable.ok && unavailable.code === 'SERVICE_UNAVAILABLE',
      unavailable
    )
  );

  return { scenario: 'sc-002', title: 'UC-03 and UC-05', checks };
}

async function runSC003() {
  const dataStore = new DataStore();
  const sessionService = new SessionService();
  const registrationService = new RegistrationService({ dataStore });
  const authService = new AuthService({ dataStore, sessionService });
  const checks = [];

  const account = registrationService.register({ email: 'chris@example.com', password: 'OldPass123!' }).account;
  const changed = authService.changePassword({
    accountId: account.id,
    currentPassword: 'OldPass123!',
    newPassword: 'NewPass123!',
    confirmNewPassword: 'NewPass123!',
  });
  checks.push(check('SC003-01', 'Password can be changed with valid current password', changed.ok, changed));

  const newLogin = authService.login({ identifier: 'chris@example.com', password: 'NewPass123!' });
  checks.push(check('SC003-02', 'User can login with new password', newLogin.ok, newLogin));

  const invalidCurrent = authService.changePassword({
    accountId: account.id,
    currentPassword: 'bad-current',
    newPassword: 'Another123!',
    confirmNewPassword: 'Another123!',
  });
  checks.push(
    check(
      'SC003-03',
      'Invalid current password is rejected',
      !invalidCurrent.ok && invalidCurrent.code === 'INVALID_CURRENT_PASSWORD',
      invalidCurrent
    )
  );

  return { scenario: 'sc-003', title: 'UC-04', checks };
}

async function runSC004() {
  const dataStore = new DataStore();
  const upload = new FileUploadService();
  const submissionService = new SubmissionService({ dataStore, fileUploadService: upload });
  const checks = [];

  const create = await submissionService.createSubmission({
    authorAccountId: 1,
    title: 'Paper A',
    authorNames: 'Alice, Bob',
    affiliationOrContact: 'ECE Department',
    abstract: 'Abstract',
    keywords: 'ai',
    file: { name: 'paper.pdf', sizeMb: 1.2 },
  });
  checks.push(check('SC004-01', 'Valid final submission succeeds', create.ok && create.submission.status === 'submitted', create));

  const invalid = await submissionService.createSubmission({
    authorAccountId: 1,
    title: '',
    abstract: '',
    keywords: '',
    file: { name: 'paper.exe', sizeMb: 1 },
  });
  checks.push(check('SC004-02', 'Missing/invalid submission fields are rejected', !invalid.ok, invalid));

  const originalManuscript = dataStore.findOne('manuscripts', (row) => row.submissionId === create.submission.id && row.isCurrent);
  upload.setFailUpload(true);
  const failedReplace = await submissionService.replaceManuscript({
    submissionId: create.submission.id,
    file: { name: 'replacement.pdf', sizeMb: 1.0 },
  });
  upload.setFailUpload(false);
  const currentAfterFail = dataStore.findOne('manuscripts', (row) => row.submissionId === create.submission.id && row.isCurrent);
  checks.push(
    check(
      'SC004-03',
      'Failed replace keeps prior manuscript current',
      !failedReplace.ok && currentAfterFail && currentAfterFail.id === originalManuscript.id,
      { failedReplace, currentAfterFail }
    )
  );

  const badDraft = submissionService.saveDraft({ authorAccountId: 1, title: '', identifier: '' });
  checks.push(check('SC004-04', 'Draft save requires minimum identifying field', !badDraft.ok, badDraft));

  const goodDraft = submissionService.saveDraft({ authorAccountId: 1, title: 'Draft Title', identifier: '' });
  const resumed = submissionService.resumeDraft({ authorAccountId: 1, submissionId: goodDraft.draft.id });
  checks.push(check('SC004-05', 'Draft can be saved and resumed', goodDraft.ok && resumed.ok, { goodDraft, resumed }));

  submissionService.setSubmissionWindowOpen(false);
  const submitClosed = await submissionService.submitDraft({
    authorAccountId: 1,
    submissionId: goodDraft.draft.id,
    file: { name: 'draft.pdf', sizeMb: 0.5 },
  });
  const stillDraft = dataStore.findById('submissions', goodDraft.draft.id);
  checks.push(
    check(
      'SC004-06',
      'Closed submission window blocks draft-to-submit while keeping draft',
      !submitClosed.ok && stillDraft && stillDraft.status === 'draft',
      { submitClosed, stillDraft }
    )
  );

  return { scenario: 'sc-004', title: 'UC-06 to UC-09', checks };
}

async function runSC005() {
  const dataStore = new DataStore();
  const notificationService = new NotificationService({ dataStore });
  const reviewService = new ReviewService({ dataStore, notificationService });
  const checks = [];

  const submission = dataStore.insert('submissions', {
    authorAccountId: 50,
    title: 'Reviewable Paper',
    abstract: 'A long abstract',
    keywords: 'ml',
    status: 'submitted',
  });

  const reviewers = [1, 2, 3].map((id) =>
    dataStore.insert('accounts', {
      email: `rev${id}@example.com`,
      roles: ['reviewer'],
      passwordHash: 'x',
      status: 'active',
      createdAt: new Date().toISOString(),
    })
  );

  const assignment = await reviewService.assignReviewers({
    submissionId: submission.id,
    reviewerIds: reviewers.map((row) => row.id),
    reviewDeadline: '2026-05-05T23:00:00Z',
  });
  checks.push(check('SC005-01', 'Editor can assign exactly 3 valid reviewers', assignment.ok && assignment.assignments.length === 3, assignment));

  const duplicateAssign = await reviewService.assignReviewers({
    submissionId: submission.id,
    reviewerIds: reviewers.map((row) => row.id),
    reviewDeadline: '2026-05-06T23:00:00Z',
  });
  checks.push(
    check(
      'SC005-01B',
      'Submission cannot be assigned multiple times concurrently',
      !duplicateAssign.ok,
      duplicateAssign
    )
  );

  const badCount = await reviewService.assignReviewers({ submissionId: submission.id, reviewerIds: [reviewers[0].id] });
  checks.push(check('SC005-02', 'Reviewer assignment rejects non-3 reviewer count', !badCount.ok, badCount));

  for (const row of assignment.assignments) {
    await reviewService.respondInvitation({ assignmentId: row.id, response: 'accept' });
  }

  const accepted = reviewService.listAcceptedAssignments({ reviewerAccountId: reviewers[0].id });
  checks.push(check('SC005-03', 'Accepted invitations appear in reviewer assignment list', accepted.length === 1, accepted));

  const formAccess = reviewService.getReviewForm({
    assignmentId: assignment.assignments[0].id,
    reviewerAccountId: reviewers[0].id,
  });
  checks.push(check('SC005-04', 'Accepted reviewer can access review form', formAccess.ok, formAccess));

  for (const row of assignment.assignments) {
    await reviewService.submitReview({
      assignmentId: row.id,
      reviewerAccountId: row.reviewerAccountId,
      scores: '4/5',
      comments: 'Looks good',
      recommendation: 'accept',
    });
  }

  const submissionAfter = dataStore.findById('submissions', submission.id);
  checks.push(
    check(
      'SC005-05',
      'Third valid review transitions paper to reviews_complete',
      submissionAfter && submissionAfter.status === 'reviews_complete',
      submissionAfter
    )
  );

  return { scenario: 'sc-005', title: 'UC-10 to UC-14', checks };
}

async function runSC006() {
  const dataStore = new DataStore();
  const notificationService = new NotificationService({ dataStore });
  const reviewService = new ReviewService({ dataStore, notificationService });
  const notificationController = new NotificationController({ dataStore, notificationService });
  const checks = [];

  const author = dataStore.insert('accounts', {
    email: 'author@example.com',
    roles: ['author'],
    passwordHash: 'x',
    status: 'active',
    createdAt: new Date().toISOString(),
  });

  const submission = dataStore.insert('submissions', {
    authorAccountId: author.id,
    title: 'Decision Paper',
    abstract: 'A long abstract',
    keywords: 'ml',
    status: 'under_review',
  });

  const reviewers = [1, 2, 3].map((id) =>
    dataStore.insert('accounts', {
      email: `decision-rev${id}@example.com`,
      roles: ['reviewer'],
      passwordHash: 'x',
      status: 'active',
      createdAt: new Date().toISOString(),
    })
  );

  const assignment = await reviewService.assignReviewers({
    submissionId: submission.id,
    reviewerIds: reviewers.map((row) => row.id),
    reviewDeadline: '2026-05-05T23:00:00Z',
  });

  for (const row of assignment.assignments) {
    await reviewService.respondInvitation({ assignmentId: row.id, response: 'accept' });
    await reviewService.submitReview({
      assignmentId: row.id,
      reviewerAccountId: row.reviewerAccountId,
      scores: '4/5',
      comments: 'Ready for decision',
      recommendation: 'accept',
    });
  }

  const reviewSet = reviewService.getEditorReviewSet({ submissionId: submission.id });
  checks.push(check('SC006-01', 'Editor can access complete set of 3 reviews', reviewSet.ok && reviewSet.reviews.length === 3, reviewSet));

  const decision = await reviewService.submitDecision({
    submissionId: submission.id,
    editorAccountId: 777,
    decision: 'accept',
    rationale: 'Strong paper',
  });
  const submissionAfter = dataStore.findById('submissions', submission.id);
  checks.push(
    check(
      'SC006-02',
      'Editor decision updates submission status',
      decision.ok && submissionAfter && submissionAfter.status === 'accepted',
      { decision, submissionAfter }
    )
  );

  notificationService.setFailDelivery(true);
  const notify = await notificationController.notifyAuthorDecision({
    body: {
      submissionId: submission.id,
      decision: 'accept',
      message: 'Accepted',
    },
  });
  const authorNotice = dataStore
    .list('author_notifications', (row) => row.submissionId === submission.id)
    .find((row) => row.deliveryStatus === 'failed');
  checks.push(
    check(
      'SC006-03',
      'Author notification remains visible in dashboard even if delivery fails',
      notify.status === 200 && authorNotice && authorNotice.deliveryStatus === 'failed',
      { notify, authorNotice }
    )
  );

  return { scenario: 'sc-006', title: 'UC-15 to UC-17', checks };
}

async function runSC007() {
  const dataStore = new DataStore();
  const publicationService = new PublicationService();
  const notificationService = new NotificationService({ dataStore });
  const scheduleService = new ScheduleService({ dataStore, publicationService, notificationService });
  const scheduleController = new ScheduleController({ scheduleService });
  const checks = [];

  const none = scheduleController.generateDraft({ body: { acceptedSubmissionIds: [] } });
  checks.push(check('SC007-01', 'Schedule generation is blocked when no accepted papers exist', none.status === 422, none));

  const acceptedSubmissions = [100, 101, 102].map((seedId) =>
    dataStore.insert('submissions', {
      title: `Accepted ${seedId}`,
      authorAccountId: seedId,
      authorNames: 'Author Name',
      affiliationOrContact: 'Contact',
      abstract: 'Accepted abstract',
      keywords: 'ece',
      status: 'accepted',
    })
  );
  const generated = scheduleController.generateDraft({
    body: { acceptedSubmissionIds: acceptedSubmissions.map((row) => row.id) },
  });
  checks.push(
    check(
      'SC007-02',
      'Draft schedule generation stores schedule and preview',
      generated.status === 201 && generated.body.previewHtml && (generated.body.acceptedPapers || []).length === 3,
      generated
    )
  );

  const scheduleId = generated.body.schedule.id;
  const items = dataStore.list('schedule_items', (row) => row.scheduleId === scheduleId);

  const conflictEdit = scheduleController.editDraft({
    body: {
      scheduleId,
      items: [
        { ...items[0], startTime: '2026-05-01T09:00:00Z', endTime: '2026-05-01T10:00:00Z', room: 'Room 1' },
        { ...items[1], startTime: '2026-05-01T09:30:00Z', endTime: '2026-05-01T10:30:00Z', room: 'Room 1' },
      ],
    },
  });
  checks.push(check('SC007-03', 'Conflict edit is rejected', conflictEdit.status === 422, conflictEdit));

  const invalidTime = scheduleController.editDraft({
    body: {
      scheduleId,
      items: [
        { ...items[0], startTime: '2026-05-01T23:30:00Z', endTime: '2026-05-01T23:45:00Z', room: 'Room 9' },
      ],
    },
  });
  checks.push(check('SC007-04', 'Invalid timeslot is rejected', invalidTime.status === 422, invalidTime));

  const cancelled = scheduleController.editDraft({ body: { scheduleId, cancel: true } });
  checks.push(check('SC007-05', 'Cancel edit restores last saved draft', cancelled.status === 200, cancelled));

  const noConfirm = await scheduleController.publish({ body: { scheduleId, confirmed: false } });
  checks.push(check('SC007-06', 'Publish requires explicit confirmation', noConfirm.status === 422, noConfirm));

  publicationService.setFailPublish(true);
  const publishFail = await scheduleController.publish({ body: { scheduleId, confirmed: true } });
  const afterFail = dataStore.findById('schedules', scheduleId);
  publicationService.setFailPublish(false);
  checks.push(
    check(
      'SC007-07',
      'Website publication failure keeps schedule draft',
      publishFail.status === 422 && afterFail && afterFail.status === 'draft',
      { publishFail, afterFail }
    )
  );

  const publishSuccess = await scheduleController.publish({ body: { scheduleId, confirmed: true } });
  const publicView = scheduleController.showPublicSchedule({ body: { scheduleId } });
  const authorScheduleNotifications = dataStore.list(
    'notification_logs',
    (row) =>
      row.notificationType === 'schedule_published' &&
      row.status === 'sent' &&
      row.recipientAccountId !== 'public'
  );
  checks.push(
    check(
      'SC007-08',
      'Published schedule notifies authors of accepted papers and becomes publicly accessible',
      publishSuccess.status === 200 &&
        publishSuccess.body.redirectTo &&
        authorScheduleNotifications.length === 3 &&
        publicView.status === 200,
      { publishSuccess, authorScheduleNotifications, publicView }
    )
  );

  const replacementDraft = scheduleController.generateDraft({
    body: { acceptedSubmissionIds: [acceptedSubmissions[0].id, acceptedSubmissions[1].id] },
  });
  const replacementScheduleId = replacementDraft.body.schedule.id;
  notificationService.setFailDelivery(true);
  const publishWithWarning = await scheduleController.publish({ body: { scheduleId: replacementScheduleId, confirmed: true } });
  const replacementSchedule = dataStore.findById('schedules', replacementScheduleId);
  const previousSchedule = dataStore.findById('schedules', scheduleId);
  checks.push(
    check(
      'SC007-09',
      'Notification failures are non-blocking and replacement publication updates the final schedule',
      publishWithWarning.status === 200 &&
        publishWithWarning.body.notificationWarning &&
        replacementSchedule &&
        replacementSchedule.status === 'final' &&
        previousSchedule &&
        previousSchedule.status === 'superseded',
      { publishWithWarning, replacementSchedule, previousSchedule }
    )
  );

  return { scenario: 'sc-007', title: 'UC-18 to UC-20', checks };
}

async function runSC008() {
  const dataStore = new DataStore();
  const notificationService = new NotificationService({ dataStore });
  const pricingService = new PricingService({ dataStore });
  const paymentGatewayService = new PaymentGatewayService();
  const ticketService = new TicketService({ dataStore, notificationService });
  const paymentService = new PaymentService({
    dataStore,
    paymentGatewayService,
    pricingService,
    ticketService,
  });
  const checks = [];

  const pricing = pricingService.listPricing();
  checks.push(check('SC008-01', 'Pricing categories are available to attendees', pricing.ok && pricing.categories.length > 0, pricing));

  const invalidCategory = await paymentService.processRegistrationPayment({
    attendeeAccountId: 12,
    attendeeName: 'Dana',
    pricingCategoryId: 9999,
    card: { cardNumber: '1', expiry: '12/30', cvv: '111' },
  });
  checks.push(check('SC008-02', 'Invalid category is rejected before payment', !invalidCategory.ok && invalidCategory.status === 422, invalidCategory));

  const missingCard = await paymentService.processRegistrationPayment({
    attendeeAccountId: 12,
    attendeeName: 'Dana',
    pricingCategoryId: pricing.categories[0].id,
    card: { cardNumber: '', expiry: '', cvv: '' },
  });
  checks.push(check('SC008-03', 'Incomplete payment details are rejected', !missingCard.ok && missingCard.status === 422, missingCard));

  paymentGatewayService.setForceDecline(true);
  const declined = await paymentService.processRegistrationPayment({
    attendeeAccountId: 12,
    attendeeName: 'Dana',
    pricingCategoryId: pricing.categories[1].id,
    card: { cardNumber: '4111111111111111', expiry: '12/30', cvv: '123' },
  });
  paymentGatewayService.setForceDecline(false);
  checks.push(check('SC008-04', 'Declined payment does not confirm registration', !declined.ok && declined.status === 402, declined));

  const approved = await paymentService.processRegistrationPayment({
    attendeeAccountId: 12,
    attendeeName: 'Dana',
    pricingCategoryId: pricing.categories[1].id,
    card: { cardNumber: '4111111111111111', expiry: '12/30', cvv: '123' },
  });
  checks.push(
    check(
      'SC008-05',
      'Approved payment confirms registration and generates ticket',
      approved.ok && approved.registration && approved.registration.status === 'registered' && approved.ticket,
      approved
    )
  );

  ticketService.setFailGeneration(true);
  const delayed = await paymentService.processRegistrationPayment({
    attendeeAccountId: 33,
    attendeeName: 'Eli',
    pricingCategoryId: pricing.categories[0].id,
    card: { cardNumber: '4111111111111111', expiry: '11/30', cvv: '555' },
  });
  ticketService.setFailGeneration(false);
  const delayedLookup = ticketService.getTicket({ registrationId: delayed.registration.id });
  checks.push(
    check(
      'SC008-06',
      'Ticket-generation failure keeps registration confirmed and reports delayed ticket',
      delayed.ok && delayed.warning && delayed.registration.status === 'ticket_pending' && delayedLookup.status === 202,
      { delayed, delayedLookup }
    )
  );

  return { scenario: 'sc-008', title: 'UC-21 to UC-23', checks };
}

function writeScenarioResult(result) {
  const status = countStatus(result.checks);
  const outDir = path.resolve(__dirname, 'results');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${result.scenario}.md`);

  const lines = [];
  lines.push(`# ${result.scenario.toUpperCase()} Acceptance Results`);
  lines.push('');
  lines.push(`- Scenario Group: ${result.title}`);
  lines.push(`- Executed At: ${new Date().toISOString()}`);
  lines.push(`- Passed: ${status.passed}/${status.total}`);
  lines.push(`- Overall: ${status.failed === 0 ? 'PASS' : 'FAIL'}`);
  lines.push('');
  lines.push('| Check ID | Result | Details |');
  lines.push('|---|---|---|');
  for (const row of result.checks) {
    const detail = row.pass ? row.name : `${row.name} :: ${JSON.stringify(row.details)}`;
    lines.push(`| ${row.id} | ${row.pass ? 'PASS' : 'FAIL'} | ${detail.replace(/\|/g, '/')} |`);
  }
  lines.push('');

  fs.writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');
  return { outPath, status };
}

async function main() {
  const scenarios = [
    await runSC001(),
    await runSC002(),
    await runSC003(),
    await runSC004(),
    await runSC005(),
    await runSC006(),
    await runSC007(),
    await runSC008(),
  ];

  const summaries = scenarios.map(writeScenarioResult);
  const failed = summaries.filter((row) => row.status.failed > 0);

  for (const row of summaries) {
    console.log(`${path.basename(row.outPath)}: ${row.status.failed === 0 ? 'PASS' : 'FAIL'} (${row.status.passed}/${row.status.total})`);
  }

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
