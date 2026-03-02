const test = require('node:test');
const assert = require('node:assert/strict');

const { DataStore } = require('../../src/services/data_store');
const { FileUploadService } = require('../../src/services/file_upload_service');
const { SubmissionService } = require('../../src/services/submission_service');
const { SubmissionController } = require('../../src/controllers/submission_controller');
const { ReviewService } = require('../../src/services/review_service');
const { NotificationService } = require('../../src/services/notification_service');
const { ReviewController } = require('../../src/controllers/review_controller');
const { PricingService } = require('../../src/services/pricing_service');
const { PaymentGatewayService } = require('../../src/services/payment_gateway_service');
const { TicketService } = require('../../src/services/ticket_service');
const { PaymentService } = require('../../src/services/payment_service');
const { RegistrationController } = require('../../src/controllers/registration_controller');

test('submission replace returns redirect to author dashboard on success', async () => {
  const dataStore = new DataStore();
  const fileUploadService = new FileUploadService();
  const submissionService = new SubmissionService({ dataStore, fileUploadService });
  const controller = new SubmissionController({ submissionService });

  const created = await submissionService.createSubmission({
    authorAccountId: 1,
    title: 'Paper 1',
    authorNames: 'A',
    affiliationOrContact: 'B',
    abstract: 'C',
    keywords: 'D',
    file: { name: 'paper.pdf', sizeMb: 1 },
  });

  const response = await controller.replace({
    body: {
      submissionId: created.submission.id,
      file: { name: 'paper-v2.pdf', sizeMb: 1.1 },
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.redirectTo, '/dashboard/author?message=manuscript-updated');
});

test('review invitation response redirects to assignments list', async () => {
  const dataStore = new DataStore();
  const notificationService = new NotificationService({ dataStore });
  const reviewService = new ReviewService({ dataStore, notificationService });
  const controller = new ReviewController({ reviewService });

  const submission = dataStore.insert('submissions', {
    authorAccountId: 1,
    title: 'Reviewable',
    abstract: 'A',
    keywords: 'k',
    status: 'submitted',
  });
  const reviewer = dataStore.insert('accounts', {
    email: 'rev@example.com',
    roles: ['reviewer'],
    passwordHash: 'x',
  });
  const reviewer2 = dataStore.insert('accounts', {
    email: 'rev2@example.com',
    roles: ['reviewer'],
    passwordHash: 'x',
  });
  const reviewer3 = dataStore.insert('accounts', {
    email: 'rev3@example.com',
    roles: ['reviewer'],
    passwordHash: 'x',
  });

  const assigned = await reviewService.assignReviewers({
    submissionId: submission.id,
    reviewerIds: [reviewer.id, reviewer2.id, reviewer3.id],
  });

  const response = await controller.respondInvitation({
    session: { accountId: reviewer.id, roles: ['reviewer'] },
    body: {
      assignmentId: assigned.assignments[0].id,
      response: 'accept',
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.redirectTo, '/reviews/assignments?message=invitation-accepted');
});

test('guest registration submit is rejected when attendee is not signed in', async () => {
  const dataStore = new DataStore();
  const pricingService = new PricingService({ dataStore });
  const paymentGatewayService = new PaymentGatewayService();
  const ticketService = new TicketService({ dataStore, notificationService: null });
  const paymentService = new PaymentService({
    dataStore,
    paymentGatewayService,
    pricingService,
    ticketService,
  });
  const controller = new RegistrationController({ pricingService, paymentService });

  const category = pricingService.listPricing().categories[0];
  const response = await controller.submit({
    session: null,
    body: {
      attendeeName: 'Guest User',
      pricingCategoryId: category.id,
      cardNumber: '4111111111111111',
      expiry: '12/30',
      cvv: '123',
    },
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.view, 'registration.html');
  assert.match(response.body.errors.form, /sign in as an attendee/i);
  assert.equal(response.body.registration, null);
});
