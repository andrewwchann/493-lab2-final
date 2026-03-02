class ReviewDecision {
  constructor({ id, submissionId, editorAccountId, decision, rationale, decidedAt }) {
    this.id = id;
    this.submissionId = submissionId;
    this.editorAccountId = editorAccountId;
    this.decision = decision;
    this.rationale = rationale;
    this.decidedAt = decidedAt;
  }
}

module.exports = {
  ReviewDecision,
};
