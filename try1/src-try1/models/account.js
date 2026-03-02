class Account {
  constructor({ id, email, passwordHash, roles = ['attendee'], status = 'active', createdAt = new Date().toISOString() }) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.roles = roles;
    this.status = status;
    this.createdAt = createdAt;
  }

  static fromRecord(record) {
    return new Account(record);
  }
}

module.exports = {
  Account,
};
