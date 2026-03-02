class PasswordController {
  constructor({ authService }) {
    this.authService = authService;
  }

  showForm() {
    return {
      status: 200,
      body: { view: 'change_password.html' },
    };
  }

  submit({ session, body }) {
    const result = this.authService.changePassword({
      accountId: session.accountId,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
      confirmNewPassword: body.confirmNewPassword,
    });

    if (!result.ok) {
      const errorMap = {
        NOT_FOUND: 'Account not found.',
        INVALID_CURRENT_PASSWORD: 'Current password is incorrect.',
        INVALID_NEW_PASSWORD: result.errorMessage || 'New password is invalid.',
        PASSWORD_CONFIRMATION_MISMATCH: 'New password and confirmation do not match.',
        UPDATE_FAILED: 'Unable to update password. Please retry later.',
      };

      return {
        status: 400,
        body: {
          view: 'change_password.html',
          errors: { form: errorMap[result.code] || 'Password update failed.' },
        },
      };
    }

    return {
      status: 200,
      body: {
        redirectTo: `/dashboard/${(session.roles && session.roles[0]) || 'attendee'}?message=password-updated`,
      },
    };
  }
}

module.exports = {
  PasswordController,
};
