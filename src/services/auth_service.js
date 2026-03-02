const crypto = require('crypto');
const { retryLaterError } = require('./error_policy');
const { validateRegistrationPassword } = require('./registration_service');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

class AuthService {
  constructor({ dataStore, sessionService }) {
    this.dataStore = dataStore;
    this.sessionService = sessionService;
    this.available = true;
  }

  setAvailability(isAvailable) {
    this.available = Boolean(isAvailable);
  }

  login({ identifier, password }) {
    const errors = {};
    if (!identifier) {
      errors.identifier = 'Email or username is required.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    }
    if (Object.keys(errors).length > 0) {
      return { ok: false, code: 'MISSING_FIELDS', errors };
    }

    if (!this.available) {
      return { ok: false, code: 'SERVICE_UNAVAILABLE', error: retryLaterError() };
    }

    const normalized = String(identifier).toLowerCase();
    const account = this.dataStore.findOne('accounts', (row) => {
      const email = String(row.email || '').toLowerCase();
      const username = String(row.username || '').toLowerCase();
      return email === normalized || username === normalized;
    });

    if (!account) {
      return {
        ok: false,
        code: 'ACCOUNT_NOT_FOUND',
        errors: { form: 'Account not found.' },
      };
    }

    if (account.passwordHash !== hashPassword(password)) {
      return {
        ok: false,
        code: 'INVALID_PASSWORD',
        errors: { form: 'Invalid password.' },
      };
    }

    const session = this.sessionService.createSession(account);
    const primaryRole = (account.roles && account.roles[0]) || 'attendee';

    return {
      ok: true,
      session,
      redirectTo: `/dashboard/${primaryRole}`,
    };
  }

  changePassword({ accountId, currentPassword, newPassword, confirmNewPassword }) {
    const account = this.dataStore.findById('accounts', accountId);
    if (!account) {
      return { ok: false, code: 'NOT_FOUND' };
    }
    if (hashPassword(currentPassword) !== account.passwordHash) {
      return { ok: false, code: 'INVALID_CURRENT_PASSWORD' };
    }
    const passwordError = validateRegistrationPassword(newPassword);
    if (passwordError) {
      return { ok: false, code: 'INVALID_NEW_PASSWORD', errorMessage: passwordError };
    }
    if (newPassword !== confirmNewPassword) {
      return { ok: false, code: 'PASSWORD_CONFIRMATION_MISMATCH' };
    }

    const updated = this.dataStore.updateById('accounts', account.id, {
      passwordHash: hashPassword(newPassword),
    });
    if (!updated) {
      return { ok: false, code: 'UPDATE_FAILED' };
    }

    return { ok: true };
  }
}

module.exports = {
  AuthService,
};
