const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const clone = (value) => JSON.parse(JSON.stringify(value));

class DataStore {
  constructor({ dbPath = ':memory:' } = {}) {
    if (dbPath !== ':memory:') {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }

    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA busy_timeout = 5000');
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS data_store_records (
        table_name TEXT NOT NULL,
        id INTEGER NOT NULL,
        payload_json TEXT NOT NULL,
        PRIMARY KEY (table_name, id)
      )
    `);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS data_store_sequences (
        table_name TEXT PRIMARY KEY,
        next_id INTEGER NOT NULL
      )
    `);

    this.selectSequenceStmt = this.db.prepare(`
      SELECT next_id
      FROM data_store_sequences
      WHERE table_name = ?
    `);
    this.insertSequenceStmt = this.db.prepare(`
      INSERT INTO data_store_sequences (table_name, next_id)
      VALUES (?, ?)
    `);
    this.updateSequenceStmt = this.db.prepare(`
      UPDATE data_store_sequences
      SET next_id = ?
      WHERE table_name = ?
    `);

    this.insertRecordStmt = this.db.prepare(`
      INSERT INTO data_store_records (table_name, id, payload_json)
      VALUES (?, ?, ?)
    `);
    this.selectRecordStmt = this.db.prepare(`
      SELECT payload_json
      FROM data_store_records
      WHERE table_name = ? AND id = ?
    `);
    this.selectAllRecordsStmt = this.db.prepare(`
      SELECT payload_json
      FROM data_store_records
      WHERE table_name = ?
      ORDER BY id ASC
    `);
    this.updateRecordStmt = this.db.prepare(`
      UPDATE data_store_records
      SET payload_json = ?
      WHERE table_name = ? AND id = ?
    `);
  }

  ensureTable(tableName) {
    const existing = this.selectSequenceStmt.get(tableName);
    if (!existing) {
      this.insertSequenceStmt.run(tableName, 1);
    }
  }

  insert(tableName, record) {
    this.ensureTable(tableName);
    const sequence = this.selectSequenceStmt.get(tableName);
    const id = sequence.next_id;
    this.updateSequenceStmt.run(id + 1, tableName);

    const row = { id, ...clone(record) };
    this.insertRecordStmt.run(tableName, id, JSON.stringify(row));
    return clone(row);
  }

  findById(tableName, id) {
    this.ensureTable(tableName);
    const record = this.selectRecordStmt.get(tableName, id);
    if (!record) {
      return null;
    }

    const row = JSON.parse(record.payload_json);
    return clone(row);
  }

  findOne(tableName, predicate) {
    this.ensureTable(tableName);
    const records = this.selectAllRecordsStmt.all(tableName);
    for (const record of records) {
      const row = JSON.parse(record.payload_json);
      if (predicate(row)) {
        return clone(row);
      }
    }
    return null;
  }

  list(tableName, predicate = () => true) {
    this.ensureTable(tableName);
    const records = this.selectAllRecordsStmt.all(tableName);
    const result = [];
    for (const record of records) {
      const row = JSON.parse(record.payload_json);
      if (predicate(row)) {
        result.push(clone(row));
      }
    }
    return result;
  }

  updateById(tableName, id, updates) {
    this.ensureTable(tableName);
    const existing = this.findById(tableName, id);
    if (!existing) {
      return null;
    }

    const merged = { ...existing, ...clone(updates), id: existing.id };
    this.updateRecordStmt.run(JSON.stringify(merged), tableName, existing.id);
    return clone(merged);
  }
}

module.exports = {
  DataStore,
};
