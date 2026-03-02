const test = require('node:test');
const assert = require('node:assert/strict');

const { Account } = require('../../src/models/account');
const { ReviewDecision } = require('../../src/models/decision');
const { Manuscript } = require('../../src/models/manuscript');
const { PaymentTransaction } = require('../../src/models/payment_transaction');
const { PricingCategory } = require('../../src/models/pricing_category');
const { Registration } = require('../../src/models/registration');
const { ReviewAssignment } = require('../../src/models/review_assignment');
const { ReviewForm } = require('../../src/models/review_form');
const { Schedule } = require('../../src/models/schedule');
const { ScheduleItem } = require('../../src/models/schedule_item');
const { Session } = require('../../src/models/session');
const { Submission } = require('../../src/models/submission');
const { Ticket } = require('../../src/models/ticket');
const { escapeHtml, renderFieldError, renderPage } = require('../../src/views/helpers');
const routeRoles = require('../../src/controllers/route_roles');

test('model constructors map required fields', () => {
  const account = new Account({ id: 1, email: 'a@b.com', passwordHash: 'h' });
  const decision = new ReviewDecision({ id: 2, submissionId: 8, editorAccountId: 3, decision: 'accept', rationale: '', decidedAt: 'now' });
  const manuscript = new Manuscript({ id: 3, submissionId: 8, fileName: 'p.pdf', fileType: 'pdf', fileSizeMb: 1, storageRef: '/x', uploadedAt: 'now' });
  const payment = new PaymentTransaction({ id: 4, registrationId: 9, amount: '100', status: 'approved', processedAt: 'now' });
  const pricing = new PricingCategory({ id: 5, attendeeType: 'student', price: '10', currency: 'USD' });
  const registration = new Registration({ id: 6, attendeeAccountId: 1, pricingCategoryId: 5, attendeeName: 'A', createdAt: 'now' });
  const assignment = new ReviewAssignment({ id: 7, submissionId: 8, reviewerAccountId: 2, assignedAt: 'now' });
  const reviewForm = new ReviewForm({ id: 8, assignmentId: 7, scores: {}, comments: 'ok', recommendation: 'accept' });
  const schedule = new Schedule({ id: 9, generatedAt: 'now' });
  const scheduleItem = new ScheduleItem({ id: 10, scheduleId: 9, submissionId: 8, session: 'S1', room: 'R1', startTime: 's', endTime: 'e' });
  const session = new Session({ token: 't', accountId: 1, roles: ['author'], createdAt: 'now' });
  const submission = new Submission({ id: 11, authorAccountId: 1, title: 'T', abstract: 'A', createdAt: 'now', updatedAt: 'now' });
  const ticket = new Ticket({ id: 12, registrationId: 6, ticketReference: 'ref', status: 'generated', createdAt: 'now' });

  assert.equal(account.id, 1);
  assert.equal(decision.submissionId, 8);
  assert.equal(manuscript.fileName, 'p.pdf');
  assert.equal(payment.amount, 100);
  assert.equal(pricing.price, 10);
  assert.equal(registration.status, 'pending_payment');
  assert.equal(assignment.status, 'invited');
  assert.equal(reviewForm.status, 'in_progress');
  assert.equal(schedule.status, 'draft');
  assert.equal(scheduleItem.room, 'R1');
  assert.equal(session.token, 't');
  assert.equal(submission.status, 'draft');
  assert.equal(ticket.ticketReference, 'ref');
});

test('fromRecord helpers create model instances', () => {
  const account = Account.fromRecord({ id: 5, email: 'x@y.com', passwordHash: 'z' });
  const session = Session.fromRecord({ token: 'abc', accountId: 5, roles: ['editor'], createdAt: 'now' });

  assert.ok(account instanceof Account);
  assert.ok(session instanceof Session);
  assert.equal(session.roles[0], 'editor');
});

test('view helpers escape and render safe html', () => {
  assert.equal(escapeHtml('<script>"\'&'), '&lt;script&gt;&quot;&#39;&amp;');

  const fieldError = renderFieldError('email', '<bad>');
  assert.match(fieldError, /data-field="email"/);
  assert.match(fieldError, /&lt;bad&gt;/);

  const page = renderPage('Login <Page>', '<main>Hello</main>');
  assert.match(page, /<title>Login &lt;Page&gt;<\/title>/);
  assert.match(page, /<main>Hello<\/main>/);
});

test('route role map contains key protected routes', () => {
  assert.deepEqual(routeRoles['GET /dashboard/editor'], ['editor']);
  assert.deepEqual(routeRoles['POST /submissions'], ['author']);
  assert.deepEqual(routeRoles['GET /pricing'], []);
  assert.ok(routeRoles['GET /conference/register'].includes('author'));
  assert.ok(routeRoles['GET /conference/register'].includes('attendee'));
  assert.ok(Array.isArray(routeRoles['POST /editor/decision']));
});
