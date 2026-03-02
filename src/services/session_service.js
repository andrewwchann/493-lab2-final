const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function parseRoles(rolesJson) {
  if (!rolesJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(rolesJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

class SessionService {
  constructor({ dbPath = ':memory:' } = {}) {
    if (dbPath !== ':memory:') {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }

    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA busy_timeout = 5000');
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        account_id INTEGER NOT NULL,
        roles_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    this.insertStmt = this.db.prepare(`
      INSERT INTO sessions (token, account_id, roles_json, created_at)
      VALUES (?, ?, ?, ?)
    `);
    this.selectStmt = this.db.prepare(`
      SELECT token, account_id, roles_json, created_at
      FROM sessions
      WHERE token = ?
    `);
    this.deleteStmt = this.db.prepare(`
      DELETE FROM sessions
      WHERE token = ?
    `);
  }

  createSession(account) {
    const token = crypto.randomUUID();
    const roles = Array.isArray(account.roles) ? account.roles : [];
    const session = {
      token,
      accountId: account.id,
      roles,
      createdAt: new Date().toISOString(),
    };

    this.insertStmt.run(session.token, session.accountId, JSON.stringify(session.roles), session.createdAt);
    return session;
  }

  getSession(token) {
    if (!token) {
      return null;
    }

    const row = this.selectStmt.get(token);
    if (!row) {
      return null;
    }

    return {
      token: row.token,
      accountId: row.account_id,
      roles: parseRoles(row.roles_json),
      createdAt: row.created_at,
    };
  }

  deleteSession(token) {
    if (!token) {
      return false;
    }

    const result = this.deleteStmt.run(token);
    return result.changes > 0;
  }
}

module.exports = {
  SessionService,
};
