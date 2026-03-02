const test = require('node:test');
const assert = require('node:assert/strict');

const { DataStore } = require('../../src/services/data_store');
const { SubmissionService } = require('../../src/services/submission_service');
const { FileUploadService } = require('../../src/services/file_upload_service');
const { ReviewService } = require('../../src/services/review_service');
const { NotificationService } = require('../../src/services/notification_service');
const { ScheduleService } = require('../../src/services/schedule_service');
const { PublicationService } = require('../../src/services/publication_service');
const { PricingService } = require('../../src/services/pricing_service');
const { PaymentGatewayService } = require('../../src/services/payment_gateway_service');
const { TicketService } = require('../../src/services/ticket_service');
const { PaymentService } = require('../../src/services/payment_service');

test('submission service supports draft file persistence, resume, and submit', async () => {
  const ds = new DataStore();
  const uploads = new FileUploadService();
  const svc = new SubmissionService({ dataStore: ds, fileUploadService: uploads });

  const draft = svc.saveDraft({
    authorAccountId: 1,
    title: 'Draft title',
    payload: {
      authorNames: 'Author',
      affiliationOrContact: 'Dept',
      abstract: 'A',
      keywords: 'k',
      file: { name: 'draft.pdf', sizeMb: 1, buffer: Buffer.from('%PDF-1.4', 'utf8') },
    },
  });
  assert.equal(draft.ok, true);

  const drafts = svc.listDrafts({ authorAccountId: 1 });
  assert.equal(drafts.length, 1);
  assert.match(drafts[0].manuscriptUrl, /\/assets\/uploads\//);

  const resumed = svc.resumeDraft({ authorAccountId: 1, submissionId: draft.draft.id });
  assert.equal(resumed.ok, true);

  const submitted = await svc.submitDraft({ authorAccountId: 1, submissionId: draft.draft.id });
  assert.equal(submitted.ok, true);
  assert.equal(submitted.submission.status, 'submitted');

  const submittedList = svc.listSubmittedByAuthor({ authorAccountId: 1 });
  assert.equal(submittedList.length, 1);
  assert.equal(submittedList[0].id, draft.draft.id);
});

test('review service enforces assignment constraints and decision flow', async () => {
  const ds = new DataStore();
  const notifications = new NotificationService({ dataStore: ds });
  const reviews = new ReviewService({ dataStore: ds, notificationService: notifications });

  const submission = ds.insert('submissions', {
    authorAccountId: 101,
    title: 'Paper',
    abstract: 'Abstract',
    keywords: 'ml',
    status: 'submitted',
  });
  ds.insert('manuscripts', {
    submissionId: submission.id,
    fileName: 'paper.pdf',
    fileType: 'pdf',
    fileSizeMb: 1,
    storageRef: '/assets/uploads/paper.pdf',
    version: 1,
    isCurrent: true,
    uploadedAt: new Date().toISOString(),
  });

  const reviewer1 = ds.insert('accounts', { email: 'r1@example.com', roles: ['reviewer'] });
  const reviewer2 = ds.insert('accounts', { email: 'r2@example.com', roles: ['reviewer'] });
  const reviewer3 = ds.insert('accounts', { email: 'r3@example.com', roles: ['reviewer'] });

  const assigned = await reviews.assignReviewers({
    submissionId: submission.id,
    reviewerIds: [reviewer1.id, reviewer2.id, reviewer3.id],
    reviewDeadline: '2099-01-01T00:00:00Z',
  });
  assert.equal(assigned.ok, true);
  assert.equal(assigned.assignments.length, 3);

  const dup = await reviews.assignReviewers({
    submissionId: submission.id,
    reviewerIds: [reviewer1.id, reviewer2.id, reviewer3.id],
  });
  assert.equal(dup.ok, false);

  const invites = reviews.listInvitations({ reviewerAccountId: reviewer1.id });
  assert.equal(invites.length, 1);
  assert.match(invites[0].manuscriptUrl, /\/assets\/uploads\//);

  const accepted = await reviews.respondInvitation({
    assignmentId: assigned.assignments[0].id,
    reviewerAccountId: reviewer1.id,
    response: 'accept',
  });
  assert.equal(accepted.ok, true);

  await reviews.respondInvitation({ assignmentId: assigned.assignments[1].id, reviewerAccountId: reviewer2.id, response: 'accept' });
  await reviews.respondInvitation({ assignmentId: assigned.assignments[2].id, reviewerAccountId: reviewer3.id, response: 'accept' });

  const form = reviews.getReviewForm({ assignmentId: assigned.assignments[0].id, reviewerAccountId: reviewer1.id });
  assert.equal(form.ok, true);
  assert.match(form.manuscriptUrl, /\/assets\/uploads\//);

  await reviews.submitReview({ assignmentId: assigned.assignments[0].id, reviewerAccountId: reviewer1.id, scores: '4', comments: 'ok', recommendation: 'accept' });
  await reviews.submitReview({ assignmentId: assigned.assignments[1].id, reviewerAccountId: reviewer2.id, scores: '4', comments: 'ok', recommendation: 'accept' });
  const third = await reviews.submitReview({ assignmentId: assigned.assignments[2].id, reviewerAccountId: reviewer3.id, scores: '4', comments: 'ok', recommendation: 'accept' });
  assert.equal(third.ok, true);

  const afterReviews = ds.findById('submissions', submission.id);
  assert.equal(afterReviews.status, 'reviews_complete');

  const editorSet = reviews.getEditorReviewSet({ submissionId: submission.id });
  assert.equal(editorSet.ok, true);
  assert.equal(editorSet.reviews.length, 3);

  const decision = await reviews.submitDecision({ submissionId: submission.id, editorAccountId: 999, decision: 'accept', rationale: 'good' });
  assert.equal(decision.ok, true);
  assert.equal(ds.findById('submissions', submission.id).status, 'accepted');
});

test('schedule service handles generation, validation, publish rollback and success', async () => {
  const ds = new DataStore();
  const publication = new PublicationService();
  const notifications = new NotificationService({ dataStore: ds });
  const schedules = new ScheduleService({ dataStore: ds, publicationService: publication, notificationService: notifications });

  const accepted1 = ds.insert('submissions', { status: 'accepted', title: 'A' });
  const accepted2 = ds.insert('submissions', { status: 'accepted', title: 'B' });

  const generated = schedules.generateDraftSchedule({ acceptedSubmissionIds: [accepted1.id, accepted2.id] });
  assert.equal(generated.ok, true);
  assert.equal(generated.items.length, 2);

  const invalidEdit = schedules.editDraftSchedule({
    scheduleId: generated.schedule.id,
    items: [{ ...generated.items[0], startTime: '2026-05-01T10:00:00Z', endTime: '2026-05-01T09:00:00Z' }],
  });
  assert.equal(invalidEdit.ok, false);

  publication.setFailPublish(true);
  const failedPublish = await schedules.publishSchedule({ scheduleId: generated.schedule.id, confirmed: true });
  assert.equal(failedPublish.ok, false);
  assert.equal(ds.findById('schedules', generated.schedule.id).status, 'draft');

  publication.setFailPublish(false);
  notifications.setFailDelivery(true);
  const published = await schedules.publishSchedule({ scheduleId: generated.schedule.id, confirmed: true });
  assert.equal(published.ok, true);
  assert.ok(published.notificationWarning);
  assert.equal(ds.findById('schedules', generated.schedule.id).status, 'final');

  const publicSchedule = schedules.getPublishedSchedule({ scheduleId: generated.schedule.id });
  assert.equal(publicSchedule.status, 'final');
});

test('schedule generation uses accepted papers list and final publication notifies authors while replacing prior final', async () => {
  const ds = new DataStore();
  const publication = new PublicationService();
  const notifications = new NotificationService({ dataStore: ds });
  const schedules = new ScheduleService({ dataStore: ds, publicationService: publication, notificationService: notifications });

  const accepted1 = ds.insert('submissions', {
    authorAccountId: 201,
    authorNames: 'Author One',
    title: 'Accepted One',
    status: 'accepted',
  });
  const accepted2 = ds.insert('submissions', {
    authorAccountId: 202,
    authorNames: 'Author Two',
    title: 'Accepted Two',
    status: 'accepted',
  });
  ds.insert('submissions', {
    authorAccountId: 203,
    authorNames: 'Author Three',
    title: 'Rejected',
    status: 'rejected',
  });

  const eligible = schedules.listAcceptedSubmissions();
  assert.equal(eligible.length, 2);
  assert.equal(eligible[0].id, accepted1.id);
  assert.equal(eligible[1].id, accepted2.id);

  const generatedAuto = schedules.generateDraftSchedule({ acceptedSubmissionIds: [] });
  assert.equal(generatedAuto.ok, true);
  assert.equal(generatedAuto.items.length, 2);

  const firstPublish = await schedules.publishSchedule({
    scheduleId: generatedAuto.schedule.id,
    confirmed: true,
  });
  assert.equal(firstPublish.ok, true);
  assert.equal(ds.findById('schedules', generatedAuto.schedule.id).status, 'final');

  const sentLogsAfterFirst = ds.list(
    'notification_logs',
    (row) => row.notificationType === 'schedule_published' && row.status === 'sent'
  );
  const recipientsAfterFirst = sentLogsAfterFirst.map((row) => row.recipientAccountId);
  assert.ok(recipientsAfterFirst.includes('public'));
  assert.ok(recipientsAfterFirst.includes(201));
  assert.ok(recipientsAfterFirst.includes(202));

  const generatedSecond = schedules.generateDraftSchedule({ acceptedSubmissionIds: [accepted1.id] });
  assert.equal(generatedSecond.ok, true);
  const secondPublish = await schedules.publishSchedule({
    scheduleId: generatedSecond.schedule.id,
    confirmed: true,
  });
  assert.equal(secondPublish.ok, true);
  assert.equal(ds.findById('schedules', generatedAuto.schedule.id).status, 'superseded');
  assert.equal(ds.findById('schedules', generatedSecond.schedule.id).status, 'final');
  assert.equal(schedules.getPublishedSchedule({}).id, generatedSecond.schedule.id);
});

test('full lifecycle covers submission to reviewer workflow to editor approval to schedule publication to registration payment', async () => {
  const ds = new DataStore();
  const uploads = new FileUploadService();
  const notifications = new NotificationService({ dataStore: ds });
  const submissions = new SubmissionService({ dataStore: ds, fileUploadService: uploads });
  const reviews = new ReviewService({ dataStore: ds, notificationService: notifications });
  const publication = new PublicationService();
  const schedules = new ScheduleService({ dataStore: ds, publicationService: publication, notificationService: notifications });
  const pricing = new PricingService({ dataStore: ds });
  const gateway = new PaymentGatewayService();
  const tickets = new TicketService({ dataStore: ds, notificationService: notifications });
  const payments = new PaymentService({
    dataStore: ds,
    paymentGatewayService: gateway,
    pricingService: pricing,
    ticketService: tickets,
  });

  const author = ds.insert('accounts', { email: 'author-flow@example.com', roles: ['author'] });
  const reviewer1 = ds.insert('accounts', { email: 'flow-r1@example.com', roles: ['reviewer'] });
  const reviewer2 = ds.insert('accounts', { email: 'flow-r2@example.com', roles: ['reviewer'] });
  const reviewer3 = ds.insert('accounts', { email: 'flow-r3@example.com', roles: ['reviewer'] });

  const created = await submissions.createSubmission({
    authorAccountId: author.id,
    title: 'Lifecycle Paper',
    authorNames: 'Flow Author',
    affiliationOrContact: 'Dept',
    abstract: 'Abstract',
    keywords: 'cms',
    file: { name: 'lifecycle.pdf', sizeMb: 1, buffer: Buffer.from('%PDF-1.4 lifecycle', 'utf8') },
  });
  assert.equal(created.ok, true);
  assert.equal(ds.findById('submissions', created.submission.id).status, 'submitted');

  const assigned = await reviews.assignReviewers({
    submissionId: created.submission.id,
    reviewerIds: [reviewer1.id, reviewer2.id, reviewer3.id],
    reviewDeadline: '2099-01-01T00:00:00Z',
  });
  assert.equal(assigned.ok, true);
  assert.equal(assigned.assignments.length, 3);

  for (const assignment of assigned.assignments) {
    const reviewerId = assignment.reviewerAccountId;
    const accepted = await reviews.respondInvitation({
      assignmentId: assignment.id,
      reviewerAccountId: reviewerId,
      response: 'accept',
    });
    assert.equal(accepted.ok, true);

    const submitted = await reviews.submitReview({
      assignmentId: assignment.id,
      reviewerAccountId: reviewerId,
      scores: '4',
      comments: 'good paper',
      recommendation: 'accept',
    });
    assert.equal(submitted.ok, true);
  }
  assert.equal(ds.findById('submissions', created.submission.id).status, 'reviews_complete');

  const decision = await reviews.submitDecision({
    submissionId: created.submission.id,
    editorAccountId: 999,
    decision: 'accept',
    rationale: 'accepted after review',
  });
  assert.equal(decision.ok, true);
  assert.equal(ds.findById('submissions', created.submission.id).status, 'accepted');

  const generated = schedules.generateDraftSchedule({ acceptedSubmissionIds: [] });
  assert.equal(generated.ok, true);
  assert.ok(generated.items.some((item) => item.submissionId === created.submission.id));

  const published = await schedules.publishSchedule({
    scheduleId: generated.schedule.id,
    confirmed: true,
  });
  assert.equal(published.ok, true);
  assert.equal(ds.findById('schedules', generated.schedule.id).status, 'final');
  const scheduleNotice = ds.findOne(
    'notification_logs',
    (row) =>
      row.notificationType === 'schedule_published' &&
      row.recipientAccountId === author.id &&
      row.status === 'sent'
  );
  assert.ok(scheduleNotice);

  const category = pricing.listPricing().categories[0];
  const payment = await payments.processRegistrationPayment({
    attendeeAccountId: author.id,
    attendeeName: 'Flow Author',
    pricingCategoryId: category.id,
    card: { cardNumber: '4111111111111111', expiry: '12/30', cvv: '123' },
  });
  assert.equal(payment.ok, true);
  assert.equal(payment.registration.status, 'registered');
  assert.equal(payment.payment.status, 'approved');
  assert.ok(payment.ticket);

  const ticketLookup = tickets.getTicket({ registrationId: payment.registration.id });
  assert.equal(ticketLookup.ok, true);
  assert.equal(ticketLookup.ticket.ticketReference, payment.ticket.ticketReference);
});
