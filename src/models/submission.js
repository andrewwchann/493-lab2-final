class Submission {
  constructor({
    id,
    authorAccountId,
    title,
    abstract,
    keywords = [],
    status = 'draft',
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.authorAccountId = authorAccountId;
    this.title = title;
    this.abstract = abstract;
    this.keywords = keywords;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = {
  Submission,
};
