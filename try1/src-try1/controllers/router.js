const { enforceRouteAccess } = require('./guard');
const routeRoles = require('./route_roles');

class Router {
  constructor({ sessionService } = {}) {
    this.sessionService = sessionService;
    this.routes = new Map();
  }

  key(method, path) {
    return `${method.toUpperCase()} ${path}`;
  }

  register(method, path, handler, options = {}) {
    const routeKey = this.key(method, path);
    const defaultRoles = routeRoles[routeKey] || [];
    this.routes.set(routeKey, {
      handler,
      isPublic: Boolean(options.isPublic),
      allowedRoles: options.allowedRoles || defaultRoles,
    });
  }

  dispatch({ method, path, body = {}, params = {}, headers = {} }) {
    const routeKey = this.key(method, path);
    const routeConfig = this.routes.get(routeKey);

    if (!routeConfig) {
      return { status: 404, body: { error: 'Route not found.' } };
    }

    const token = headers['x-session-token'] || headers['X-Session-Token'];
    const session = token && this.sessionService ? this.sessionService.getSession(token) : null;
    const accessResult = enforceRouteAccess({ session, routeConfig });

    if (!accessResult.allowed) {
      return { status: accessResult.status, body: { error: accessResult.error } };
    }

    return routeConfig.handler({ body, params, headers, session });
  }
}

function wireRegistrationRoutes(router, registerController) {
  router.register('GET', '/register', () => registerController.showForm(), { isPublic: true });
  router.register('POST', '/register', ({ body }) => registerController.submit({ body }), { isPublic: true });
}

function wireAuthRoutes(router, loginController, passwordController) {
  router.register('GET', '/login', () => loginController.showForm(), { isPublic: true });
  router.register('POST', '/login', ({ body }) => loginController.submit({ body }), { isPublic: true });

  const roleDashboardPaths = ['author', 'reviewer', 'editor', 'attendee'];
  for (const role of roleDashboardPaths) {
    router.register(
      'GET',
      `/dashboard/${role}`,
      ({ session, body }) => loginController.showDashboard({ session, role, message: body.message }),
      { allowedRoles: [role] }
    );
  }

  if (passwordController) {
    router.register('GET', '/password/change', () => passwordController.showForm(), {
      allowedRoles: roleDashboardPaths,
    });
    router.register(
      'POST',
      '/accounts/password',
      ({ session, body }) => passwordController.submit({ session, body }),
      { allowedRoles: roleDashboardPaths }
    );
  }
}

function wireSubmissionRoutes(router, submissionController) {
  router.register('GET', '/submissions/new', () => submissionController.showSubmitForm(), {
    allowedRoles: ['author'],
  });
  router.register(
    'POST',
    '/submissions',
    ({ session, body }) => submissionController.submit({ session, body }),
    { allowedRoles: ['author'] }
  );
  router.register('GET', '/submissions/replace', () => submissionController.showReplaceForm(), {
    allowedRoles: ['author'],
  });
  router.register(
    'POST',
    '/submissions/replace',
    ({ body }) => submissionController.replace({ body }),
    { allowedRoles: ['author'] }
  );
  router.register('GET', '/submissions/drafts', ({ session }) => submissionController.showDraftList({ session }), {
    allowedRoles: ['author'],
  });
  router.register(
    'POST',
    '/submissions/drafts/save',
    ({ session, body }) => submissionController.saveDraft({ session, body }),
    { allowedRoles: ['author'] }
  );
  router.register(
    'POST',
    '/submissions/drafts/resume',
    ({ session, body }) => submissionController.resumeDraft({ session, body }),
    { allowedRoles: ['author'] }
  );
  router.register(
    'POST',
    '/submissions/drafts/submit',
    ({ session, body }) => submissionController.submitDraft({ session, body }),
    { allowedRoles: ['author'] }
  );
}

function wireReviewRoutes(router, reviewController) {
  router.register('GET', '/reviews/assign', () => reviewController.showAssignReviewersView(), {
    allowedRoles: ['editor'],
  });
  router.register(
    'POST',
    '/reviews/assign',
    ({ body }) => reviewController.assignReviewers({ body }),
    { allowedRoles: ['editor'] }
  );
  router.register('GET', '/reviews/invitation', () => reviewController.showInvitationView(), {
    allowedRoles: ['reviewer'],
  });
  router.register(
    'POST',
    '/reviews/invitation/respond',
    ({ body }) => reviewController.respondInvitation({ body }),
    { allowedRoles: ['reviewer'] }
  );
  router.register(
    'GET',
    '/reviews/assignments',
    ({ session }) => reviewController.showReviewerAssignments({ session }),
    { allowedRoles: ['reviewer'] }
  );
  router.register(
    'POST',
    '/reviews/form',
    ({ session, body }) => reviewController.showReviewForm({ session, body }),
    { allowedRoles: ['reviewer'] }
  );
  router.register(
    'POST',
    '/reviews/form/save',
    ({ session, body }) => reviewController.saveReviewDraft({ session, body }),
    { allowedRoles: ['reviewer'] }
  );
  router.register(
    'POST',
    '/reviews/form/submit',
    ({ session, body }) => reviewController.submitReview({ session, body }),
    { allowedRoles: ['reviewer'] }
  );
  router.register(
    'POST',
    '/editor/reviews',
    ({ body }) => reviewController.showEditorReviews({ body }),
    { allowedRoles: ['editor'] }
  );
  router.register(
    'POST',
    '/editor/decision',
    ({ session, body }) => reviewController.submitDecision({ session, body }),
    { allowedRoles: ['editor'] }
  );
}

function wireNotificationRoutes(router, notificationController) {
  router.register(
    'POST',
    '/notifications/author-decision',
    ({ body }) => notificationController.notifyAuthorDecision({ body }),
    { allowedRoles: ['editor'] }
  );
}

function wireScheduleRoutes(router, scheduleController) {
  router.register('POST', '/schedule/generate', ({ body }) => scheduleController.generateDraft({ body }), {
    allowedRoles: ['editor'],
  });
  router.register('POST', '/schedule/edit', ({ body }) => scheduleController.editDraft({ body }), {
    allowedRoles: ['editor'],
  });
  router.register('POST', '/schedule/publish', ({ body }) => scheduleController.publish({ body }), {
    allowedRoles: ['editor'],
  });
  router.register('GET', '/schedule/public', ({ body }) => scheduleController.showPublicSchedule({ body }), {
    isPublic: true,
  });
}

function wirePricingRoutes(router, pricingController) {
  router.register('GET', '/pricing', () => pricingController.showPricing(), { isPublic: true });
}

function wireConferenceRegistrationRoutes(router, registrationController) {
  router.register('GET', '/conference/register', () => registrationController.showForm(), {
    isPublic: true,
  });
  router.register(
    'POST',
    '/conference/register',
    ({ session, body }) => registrationController.submit({ session, body }),
    { isPublic: true }
  );
}

function wireTicketRoutes(router, ticketController) {
  router.register(
    'POST',
    '/tickets/view',
    ({ body }) => ticketController.showTicket({ body }),
    { allowedRoles: ['attendee', 'editor'] }
  );
}

module.exports = {
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
};
