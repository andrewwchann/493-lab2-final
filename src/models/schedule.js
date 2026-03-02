class Schedule {
  constructor({
    id,
    status = 'draft',
    generatedAt,
    publishedAt = null,
    publishedHtmlSnapshot = '',
    draftHtmlSnapshot = '',
  }) {
    this.id = id;
    this.status = status;
    this.generatedAt = generatedAt;
    this.publishedAt = publishedAt;
    this.publishedHtmlSnapshot = publishedHtmlSnapshot;
    this.draftHtmlSnapshot = draftHtmlSnapshot;
  }
}

module.exports = {
  Schedule,
};
