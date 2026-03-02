class RegisterController {
  constructor({ registrationService }) {
    this.registrationService = registrationService;
  }

  showForm() {
    return {
      status: 200,
      body: {
        view: 'register.html',
      },
    };
  }

  submit({ body }) {
    const result = this.registrationService.register({
      email: body.email,
      password: body.password,
      accountType: body.accountType,
    });

    if (!result.ok) {
      return {
        status: 400,
        body: {
          view: 'register.html',
          errors: result.errors,
          values: {
            email: body.email || '',
            accountType: body.accountType || 'attendee',
          },
        },
      };
    }

    return {
      status: 201,
      body: {
        accountId: result.account.id,
        redirectTo: result.redirectTo,
      },
    };
  }
}

module.exports = {
  RegisterController,
};
