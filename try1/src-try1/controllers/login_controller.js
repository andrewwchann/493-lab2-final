class LoginController {
  constructor({ authService }) {
    this.authService = authService;
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
    return {
      status: 200,
      body: {
        view: 'dashboard.html',
        accountId: session.accountId,
        role,
        message,
      },
    };
  }
}

module.exports = {
  LoginController,
};
