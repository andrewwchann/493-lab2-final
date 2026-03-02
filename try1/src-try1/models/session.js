class Session {
  constructor({ token, accountId, roles = [], createdAt }) {
    this.token = token;
    this.accountId = accountId;
    this.roles = roles;
    this.createdAt = createdAt;
  }

  static fromRecord(record) {
    return new Session(record);
  }
}

module.exports = {
  Session,
};
