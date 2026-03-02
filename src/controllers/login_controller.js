class LoginController {
  constructor({ authService, dataStore = null }) {
    this.authService = authService;
    this.dataStore = dataStore || { list: () => [], findOne: () => null };
  }

  showForm() {
    return {
      status: 200,
      body: { view: 'login.html' },
    };
  }

  submit({ body }) {
    const result = this.authService.login({
      identifier: body.identifier || body.email,
      password: body.password,
    });

    if (!result.ok) {
      if (result.code === 'SERVICE_UNAVAILABLE') {
        return {
          status: 503,
          body: {
            view: 'login.html',
            errors: { form: result.error.message },
          },
        };
      }

      return {
        status: 401,
        body: {
          view: 'login.html',
          errors: result.errors || { form: 'Login failed.' },
        },
      };
    }

    return {
      status: 200,
      body: {
        redirectTo: result.redirectTo,
        sessionToken: result.session.token,
      },
    };
  }

  showDashboard({ session, role, message = '' }) {
    const authorNotifications = this.dataStore
      .list('author_notifications', (row) => Number(row.authorAccountId) === Number(session.accountId))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 5);
    const registrations = this.dataStore
      .list('registrations', (row) => Number(row.attendeeAccountId) === Number(session.accountId))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const latestRegistration = registrations[0] || null;
    const latestTicket = latestRegistration
      ? this.dataStore.findOne('tickets', (row) => Number(row.registrationId) === Number(latestRegistration.id))
      : null;
    const attendance = latestRegistration
      ? {
          registrationId: latestRegistration.id,
          status: latestRegistration.status || '',
          ticketReference: latestTicket ? latestTicket.ticketReference : '',
          canAttend: Boolean((latestTicket && latestTicket.ticketReference) || latestRegistration.status === 'registered'),
        }
      : null;

    return {
      status: 200,
      body: {
        view: 'dashboard.html',
        accountId: session.accountId,
        role,
        message,
        authorNotifications,
        attendance,
      },
    };
  }
}

module.exports = {
  LoginController,
};
