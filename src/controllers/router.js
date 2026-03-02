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
      if (accessResult.redirectTo) {
        return { status: accessResult.status, body: { redirectTo: accessResult.redirectTo } };
      }
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
  router.register('GET', '/submissions/new', ({ session, body }) => submissionController.showSubmitForm({ session, body }), {
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
  router.register(
    'GET',
    '/reviews/invitation',
    ({ session, body }) => reviewController.showInvitationView({ session, body }),
    {
      allowedRoles: ['reviewer'],
    }
  );
  router.register(
    'POST',
    '/reviews/invitation/respond',
    ({ session, body }) => reviewController.respondInvitation({ session, body }),
    { allowedRoles: ['reviewer'] }
  );
  router.register(
    'GET',
    '/reviews/assignments',
    ({ session, body }) => reviewController.showReviewerAssignments({ session, body }),
    { allowedRoles: ['reviewer'] }
  );
  router.register(
    'GET',
    '/reviews/form',
    ({ session, body }) => reviewController.showReviewForm({ session, body }),
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
    'GET',
    '/editor/reviews',
    ({ body }) => reviewController.showEditorReviews({ body }),
    { allowedRoles: ['editor'] }
  );
  router.register(
    'POST',
    '/editor/reviews',
    ({ body }) => reviewController.showEditorReviews({ body }),
    { allowedRoles: ['editor'] }
  );
  router.register(
    'GET',
    '/editor/decision',
    ({ body }) => reviewController.showDecisionForm({ body }),
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
  router.register('GET', '/schedule/generate', () => scheduleController.showGenerateView(), {
    allowedRoles: ['editor'],
  });
  router.register('POST', '/schedule/generate', ({ body }) => scheduleController.generateDraft({ body }), {
    allowedRoles: ['editor'],
  });
  router.register('GET', '/schedule/edit', () => scheduleController.showEditView(), {
    allowedRoles: ['editor'],
  });
  router.register('POST', '/schedule/edit', ({ body }) => scheduleController.editDraft({ body }), {
    allowedRoles: ['editor'],
  });
  router.register('GET', '/schedule/publish', ({ body }) => scheduleController.showPublishView({ body }), {
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
  const authorizedRoles = ['author', 'reviewer', 'editor', 'attendee'];
  router.register('GET', '/conference/register', () => registrationController.showForm(), {
    allowedRoles: authorizedRoles,
  });
  router.register(
    'POST',
    '/conference/register',
    ({ session, body }) => registrationController.submit({ session, body }),
    { allowedRoles: authorizedRoles }
  );
}

function wireTicketRoutes(router, ticketController) {
  const authorizedRoles = ['author', 'reviewer', 'editor', 'attendee'];
  router.register(
    'GET',
    '/tickets/view',
    ({ session, body }) => ticketController.showTicket({ session, body }),
    { allowedRoles: authorizedRoles }
  );
  router.register(
    'POST',
    '/tickets/view',
    ({ session, body }) => ticketController.showTicket({ session, body }),
    { allowedRoles: authorizedRoles }
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
