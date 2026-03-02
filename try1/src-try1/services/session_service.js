const crypto = require('crypto');

class SessionService {
  constructor() {
    this.sessions = new Map();
  }

  createSession(account) {
    const token = crypto.randomUUID();
    const session = {
      token,
      accountId: account.id,
      roles: account.roles || [],
      createdAt: new Date().toISOString(),
    };
    this.sessions.set(token, session);
    return session;
  }

  getSession(token) {
    return this.sessions.get(token) || null;
  }

  deleteSession(token) {
    return this.sessions.delete(token);
  }
}

module.exports = {
  SessionService,
};
