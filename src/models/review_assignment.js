class ReviewAssignment {
  constructor({ id, submissionId, reviewerAccountId, status = 'invited', reviewDeadline, assignedAt }) {
    this.id = id;
    this.submissionId = submissionId;
    this.reviewerAccountId = reviewerAccountId;
    this.status = status;
    this.reviewDeadline = reviewDeadline;
    this.assignedAt = assignedAt;
  }
}

module.exports = {
  ReviewAssignment,
};
