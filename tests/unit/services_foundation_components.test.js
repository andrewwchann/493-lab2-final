const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { canAccessRoute, isAuthorizedUser, hasAnyRole } = require('../../src/services/access_control');
const { DataStore } = require('../../src/services/data_store');
const { redactSensitiveFields, retryLaterError } = require('../../src/services/error_policy');
const { SessionService } = require('../../src/services/session_service');
const { RegistrationService, validateRegistrationPassword } = require('../../src/services/registration_service');
const { AuthService } = require('../../src/services/auth_service');
const { FileUploadService } = require('../../src/services/file_upload_service');
const { NotificationService } = require('../../src/services/notification_service');
const { PublicationService } = require('../../src/services/publication_service');
const { PricingService } = require('../../src/services/pricing_service');
const { PaymentGatewayService } = require('../../src/services/payment_gateway_service');
const { TicketService } = require('../../src/services/ticket_service');
const { PaymentService } = require('../../src/services/payment_service');

test('access control helpers enforce auth and roles', () => {
  const session = { accountId: 1, roles: ['editor'] };
  assert.equal(isAuthorizedUser(session), true);
  assert.equal(hasAnyRole(session, ['editor']), true);
  assert.equal(hasAnyRole(session, ['reviewer']), false);
  assert.equal(canAccessRoute({ session: null, isPublic: true }), true);
  assert.equal(canAccessRoute({ session, allowedRoles: ['editor'], isPublic: false }), true);
  assert.equal(canAccessRoute({ session, allowedRoles: ['author'], isPublic: false }), false);
});

test('data store CRUD clones values and supports updates', () => {
  const ds = new DataStore();
  const inserted = ds.insert('x', { name: 'a', nested: { v: 1 } });
  inserted.nested.v = 99;

  const fetched = ds.findById('x', inserted.id);
  assert.equal(fetched.nested.v, 1);

  const updated = ds.updateById('x', inserted.id, { name: 'b' });
  assert.equal(updated.name, 'b');

  const list = ds.list('x', (row) => row.name === 'b');
  assert.equal(list.length, 1);
  assert.equal(ds.updateById('x', 999, { nope: true }), null);
});

test('error policy redacts sensitive fields and builds retry error', () => {
  const redacted = redactSensitiveFields({ cardNumber: '1', cvv: '2', keep: 'x' });
  assert.equal(redacted.cardNumber, '[REDACTED]');
  assert.equal(redacted.cvv, '[REDACTED]');
  assert.equal(redacted.keep, 'x');

  const retry = retryLaterError();
  assert.equal(retry.code, 'RETRY_LATER');
  assert.match(retry.message, /temporarily unavailable/i);
});

test('session service create/get/delete lifecycle works', () => {
  const svc = new SessionService();
  const session = svc.createSession({ id: 7, roles: ['author'] });
  assert.ok(session.token);
  assert.equal(svc.getSession(session.token).accountId, 7);
  assert.equal(svc.deleteSession(session.token), true);
  assert.equal(svc.getSession(session.token), null);
});

test('registration and auth service enforce validation and login flow', () => {
  const ds = new DataStore();
  const reg = new RegistrationService({ dataStore: ds });
  const sessions = new SessionService();
  const auth = new AuthService({ dataStore: ds, sessionService: sessions });

  assert.ok(validateRegistrationPassword('Abcdef1!') === null);
  assert.ok(validateRegistrationPassword('weak'));

  const created = reg.register({ email: 'User@Example.com', password: 'Strong123!' });
  assert.equal(created.ok, true);
  assert.equal(created.account.email, 'user@example.com');

  const dup = reg.register({ email: 'user@example.com', password: 'Strong123!' });
  assert.equal(dup.ok, false);

  const missing = auth.login({ identifier: '', password: '' });
  assert.equal(missing.code, 'MISSING_FIELDS');

  const ok = auth.login({ identifier: 'user@example.com', password: 'Strong123!' });
  assert.equal(ok.ok, true);
  assert.match(ok.redirectTo, /dashboard/);

  const bad = auth.login({ identifier: 'user@example.com', password: 'bad' });
  assert.equal(bad.code, 'INVALID_PASSWORD');

  const acct = created.account;
  const change = auth.changePassword({
    accountId: acct.id,
    currentPassword: 'Strong123!',
    newPassword: 'NewStrong1!',
    confirmNewPassword: 'NewStrong1!',
  });
  assert.equal(change.ok, true);

  const reLogin = auth.login({ identifier: 'user@example.com', password: 'NewStrong1!' });
  assert.equal(reLogin.ok, true);
});

test('file upload service stores manuscript to disk and supports failure mode', () => {
  const upload = new FileUploadService();
  upload.uploadDir = path.resolve('/tmp', `cms-upload-test-${Date.now()}`);

  const result = upload.uploadManuscript({
    name: 'paper.pdf',
    buffer: Buffer.from('%PDF-1.4\n%%EOF', 'utf8'),
    sizeMb: 0.1,
  });

  assert.match(result.storageRef, /\/assets\/uploads\//);
  const filename = result.storageRef.split('/').pop();
  const filePath = path.join(upload.uploadDir, filename);
  assert.equal(fs.existsSync(filePath), true);

  upload.setFailUpload(true);
  assert.throws(() => upload.uploadManuscript({ name: 'x.pdf', buffer: Buffer.from('a') }), /unavailable/);
});

test('notification and publication services handle success and failure contracts', async () => {
  const ds = new DataStore();
  const notifications = new NotificationService({ dataStore: ds });

  const sent = await notifications.send({ type: 'x', recipient: 1, payload: { submissionId: 3 } });
  assert.equal(sent.status, 'sent');
  assert.equal(ds.list('notification_logs').length, 1);

  notifications.setFailDelivery(true);
  const decisionNotice = await notifications.notifyAuthorDecision({ authorId: 1, submissionId: 3, decision: 'accept' });
  assert.equal(decisionNotice.status, 'failed');

  const log = notifications.logNonBlockingFailure({ type: 'schedule_published', context: { scheduleId: 2 } });
  assert.equal(log.logged, true);

  const publication = new PublicationService();
  const ok = await publication.publishSchedule('<table></table>');
  assert.equal(ok.published, true);
  publication.setFailPublish(true);
  await assert.rejects(() => publication.publishSchedule('<table></table>'), /failed/);
});

test('pricing/payment gateway/ticket/payment services enforce payment lifecycle', async () => {
  const ds = new DataStore();
  const pricing = new PricingService({ dataStore: ds });
  const gateway = new PaymentGatewayService();
  const notifications = new NotificationService({ dataStore: ds });
  const ticketService = new TicketService({ dataStore: ds, notificationService: notifications });
  const payment = new PaymentService({
    dataStore: ds,
    paymentGatewayService: gateway,
    pricingService: pricing,
    ticketService,
  });

  const pricingRows = pricing.listPricing();
  assert.equal(pricingRows.ok, true);

  pricing.setFailRetrieval(true);
  assert.equal(pricing.listPricing().ok, false);
  pricing.setFailRetrieval(false);

  gateway.setForceDecline(true);
  const declined = await payment.processRegistrationPayment({
    attendeeAccountId: 1,
    attendeeName: 'A',
    pricingCategoryId: pricingRows.categories[0].id,
    card: { cardNumber: '1', expiry: '12/30', cvv: '123' },
  });
  assert.equal(declined.ok, false);
  assert.equal(declined.status, 402);
  gateway.setForceDecline(false);

  const approved = await payment.processRegistrationPayment({
    attendeeAccountId: 1,
    attendeeName: 'A',
    pricingCategoryId: pricingRows.categories[0].id,
    card: { cardNumber: '4111111111111111', expiry: '12/30', cvv: '123' },
  });
  assert.equal(approved.ok, true);
  assert.ok(approved.registration);

  ticketService.setFailGeneration(true);
  const delayed = await payment.processRegistrationPayment({
    attendeeAccountId: 2,
    attendeeName: 'B',
    pricingCategoryId: pricingRows.categories[1].id,
    card: { cardNumber: '4111111111111111', expiry: '11/31', cvv: '999' },
  });
  assert.equal(delayed.ok, true);
  assert.ok(delayed.warning);

  const sanitized = payment.sanitizePaymentPayload({ cardNumber: 'x', cvv: 'y', keep: 'z' });
  assert.equal(sanitized.cardNumber, '[REDACTED]');
  assert.equal(sanitized.keep, 'z');
});
