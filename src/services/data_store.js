const clone = (value) => JSON.parse(JSON.stringify(value));

class DataStore {
  constructor() {
    this.tables = new Map();
    this.sequences = new Map();
  }

  ensureTable(tableName) {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, new Map());
      this.sequences.set(tableName, 1);
    }
  }

  insert(tableName, record) {
    this.ensureTable(tableName);
    const id = this.sequences.get(tableName);
    this.sequences.set(tableName, id + 1);
    const row = { id, ...clone(record) };
    this.tables.get(tableName).set(id, row);
    return clone(row);
  }

  findById(tableName, id) {
    this.ensureTable(tableName);
    const row = this.tables.get(tableName).get(id);
    return row ? clone(row) : null;
  }

  findOne(tableName, predicate) {
    this.ensureTable(tableName);
    for (const row of this.tables.get(tableName).values()) {
      if (predicate(row)) {
        return clone(row);
      }
    }
    return null;
  }

  list(tableName, predicate = () => true) {
    this.ensureTable(tableName);
    const result = [];
    for (const row of this.tables.get(tableName).values()) {
      if (predicate(row)) {
        result.push(clone(row));
      }
    }
    return result;
  }

  updateById(tableName, id, updates) {
    this.ensureTable(tableName);
    const table = this.tables.get(tableName);
    const existing = table.get(id);
    if (!existing) {
      return null;
    }
    const merged = { ...existing, ...clone(updates), id };
    table.set(id, merged);
    return clone(merged);
  }
}

module.exports = {
  DataStore,
};
