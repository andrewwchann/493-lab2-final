const test = require('node:test');
const assert = require('node:assert/strict');

const { enforceRouteAccess } = require('../../src/controllers/guard');
const {
  Router,
  wireRegistrationRoutes,
  wireAuthRoutes,
  wireSubmissionRoutes,
  wireReviewRoutes,
  wireNotificationRoutes,
  wireScheduleRoutes,
  wirePricingRoutes,
  wireConferenceRegistrationRoutes,
  wireTicketRoutes,
} = require('../../src/controllers/router');

test('guard returns redirect for missing session and 403 for role mismatch', () => {
  const noSession = enforceRouteAccess({
    session: null,
    routeConfig: { isPublic: false, allowedRoles: ['editor'] },
  });
  assert.equal(noSession.allowed, false);
  assert.equal(noSession.status, 302);
  assert.equal(noSession.redirectTo, '/login');

  const badRole = enforceRouteAccess({
    session: { accountId: 1, roles: ['author'] },
    routeConfig: { isPublic: false, allowedRoles: ['editor'] },
  });
  assert.equal(badRole.allowed, false);
  assert.equal(badRole.status, 403);

  const ok = enforceRouteAccess({
    session: { accountId: 1, roles: ['editor'] },
    routeConfig: { isPublic: false, allowedRoles: ['editor'] },
  });
  assert.equal(ok.allowed, true);
});

test('router dispatch handles not found, access control, and session token lookup', () => {
  const sessionService = {
    getSession: (token) => (token === 'ok-token' ? { accountId: 1, roles: ['editor'] } : null),
  };
  const router = new Router({ sessionService });

  router.register('GET', '/public', () => ({ status: 200, body: { ok: true } }), { isPublic: true });
  router.register('GET', '/protected', () => ({ status: 200, body: { ok: true } }), { allowedRoles: ['editor'] });

  const missing = router.dispatch({ method: 'GET', path: '/none' });
  assert.equal(missing.status, 404);

  const publicResult = router.dispatch({ method: 'GET', path: '/public' });
  assert.equal(publicResult.status, 200);

  const blocked = router.dispatch({ method: 'GET', path: '/protected', headers: {} });
  assert.equal(blocked.status, 302);
  assert.equal(blocked.body.redirectTo, '/login');

  const allowed = router.dispatch({ method: 'GET', path: '/protected', headers: { 'x-session-token': 'ok-token' } });
  assert.equal(allowed.status, 200);
});

test('route wiring functions register expected routes and invoke controllers', async () => {
  const router = new Router({ sessionService: { getSession: () => ({ accountId: 1, roles: ['editor', 'author', 'reviewer', 'attendee'] }) } });

  const registerController = {
    showForm: () => ({ status: 200, body: { view: 'register.html' } }),
    submit: () => ({ status: 201, body: { redirectTo: '/login' } }),
  };
  const loginController = {
    showForm: () => ({ status: 200, body: { view: 'login.html' } }),
    submit: () => ({ status: 200, body: { redirectTo: '/dashboard/editor', sessionToken: 'tok' } }),
    showDashboard: () => ({ status: 200, body: { view: 'dashboard.html' } }),
  };
  const passwordController = {
    showForm: () => ({ status: 200, body: { view: 'change_password.html' } }),
    submit: () => ({ status: 200, body: { redirectTo: '/dashboard/editor' } }),
  };

  const submissionController = {
    showSubmitForm: () => ({ status: 200, body: { view: 'submit_paper.html' } }),
    submit: () => ({ status: 201, body: { redirectTo: '/dashboard/author' } }),
    showReplaceForm: () => ({ status: 200, body: { view: 'update_manuscript.html' } }),
    replace: () => ({ status: 200, body: { redirectTo: '/dashboard/author' } }),
    showDraftList: () => ({ status: 200, body: { view: 'draft_list.html' } }),
    saveDraft: () => ({ status: 201, body: { redirectTo: '/dashboard/author' } }),
    resumeDraft: () => ({ status: 302, body: { redirectTo: '/submissions/new' } }),
    submitDraft: () => ({ status: 200, body: { redirectTo: '/dashboard/author' } }),
  };

  const reviewController = {
    showAssignReviewersView: () => ({ status: 200, body: { view: 'assign_reviewers.html' } }),
    assignReviewers: async () => ({ status: 201, body: {} }),
    showInvitationView: () => ({ status: 200, body: { view: 'reviewer_invitation.html' } }),
    respondInvitation: async () => ({ status: 200, body: { redirectTo: '/reviews/assignments' } }),
    showReviewerAssignments: () => ({ status: 200, body: { view: 'reviewer_assignments.html' } }),
    showReviewForm: () => ({ status: 200, body: { view: 'review_form.html' } }),
    saveReviewDraft: () => ({ status: 200, body: { redirectTo: '/reviews/form' } }),
    submitReview: async () => ({ status: 200, body: { redirectTo: '/reviews/assignments' } }),
    showEditorReviews: () => ({ status: 200, body: { view: 'editor_reviews.html' } }),
    showDecisionForm: () => ({ status: 200, body: { view: 'decision.html' } }),
    submitDecision: async () => ({ status: 200, body: { redirectTo: '/dashboard/editor' } }),
  };

  const notificationController = { notifyAuthorDecision: async () => ({ status: 200, body: { view: 'author_notification.html' } }) };
  const scheduleController = {
    showGenerateView: () => ({ status: 200, body: { view: 'schedule_preview.html' } }),
    generateDraft: () => ({ status: 201, body: { view: 'schedule_preview.html' } }),
    showEditView: () => ({ status: 200, body: { view: 'schedule_edit.html' } }),
    editDraft: () => ({ status: 200, body: { view: 'schedule_edit.html' } }),
    showPublishView: () => ({ status: 200, body: { view: 'schedule_publish.html' } }),
    publish: async () => ({ status: 200, body: { redirectTo: '/schedule/public' } }),
    showPublicSchedule: () => ({ status: 200, body: { view: 'public_schedule.html' } }),
  };
  const pricingController = { showPricing: () => ({ status: 200, body: { view: 'pricing.html' } }) };
  const registrationController = {
    showForm: () => ({ status: 200, body: { view: 'registration.html' } }),
    submit: async () => ({ status: 201, body: { view: 'registration.html' } }),
  };
  const ticketController = { showTicket: () => ({ status: 200, body: { view: 'ticket.html' } }) };

  wireRegistrationRoutes(router, registerController);
  wireAuthRoutes(router, loginController, passwordController);
  wireSubmissionRoutes(router, submissionController);
  wireReviewRoutes(router, reviewController);
  wireNotificationRoutes(router, notificationController);
  wireScheduleRoutes(router, scheduleController);
  wirePricingRoutes(router, pricingController);
  wireConferenceRegistrationRoutes(router, registrationController);
  wireTicketRoutes(router, ticketController);

  const routesToCheck = [
    ['GET', '/register'],
    ['POST', '/register'],
    ['GET', '/login'],
    ['POST', '/login'],
    ['GET', '/submissions/new'],
    ['POST', '/reviews/assign'],
    ['GET', '/schedule/public'],
    ['GET', '/pricing'],
    ['POST', '/conference/register'],
    ['GET', '/tickets/view'],
  ];

  for (const [method, path] of routesToCheck) {
    const result = await Promise.resolve(router.dispatch({ method, path, headers: { 'x-session-token': 'ok-token' } }));
    assert.ok(result.status >= 200 && result.status < 400);
  }

  const blockedRegistration = router.dispatch({ method: 'GET', path: '/conference/register' });
  assert.equal(blockedRegistration.status, 302);
  assert.equal(blockedRegistration.body.redirectTo, '/login');
});
