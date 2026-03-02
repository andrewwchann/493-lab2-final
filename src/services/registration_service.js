const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRegistrationPassword(password) {
  if (!password) {
    return 'Password is required.';
  }
  const value = String(password);
  const hasMinLength = value.length >= 8;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasDigit = /[0-9]/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);

  if (!hasMinLength || !hasUpper || !hasLower || !hasDigit || !hasSymbol) {
    return 'Password must be at least 8 characters and include upper/lowercase letters, a number, and a symbol.';
  }
  return null;
}

class RegistrationService {
  constructor({ dataStore }) {
    this.dataStore = dataStore;
  }

  register({ email, password }) {
    const errors = {};

    if (!email) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Email format is invalid.';
    }

    const passwordError = validateRegistrationPassword(password);
    if (passwordError) {
      errors.password = passwordError;
    }

    const normalizedEmail = String(email || '').toLowerCase();
    const existing = normalizedEmail
      ? this.dataStore.findOne('accounts', (row) => String(row.email).toLowerCase() === normalizedEmail)
      : null;

    if (existing) {
      errors.email = 'Email is already registered.';
    }

    if (Object.keys(errors).length > 0) {
      return {
        ok: false,
        errors,
      };
    }

    const account = this.dataStore.insert('accounts', {
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      roles: ['attendee'],
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    return {
      ok: true,
      account,
      redirectTo: '/login',
    };
  }
}

module.exports = {
  RegistrationService,
  validateRegistrationPassword,
};
