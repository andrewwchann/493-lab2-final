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
    });

    if (!result.ok) {
      return {
        status: 400,
        body: {
          view: 'register.html',
          errors: result.errors,
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
