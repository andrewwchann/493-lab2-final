class ReviewForm {
  constructor({ id, assignmentId, scores, comments, recommendation, status = 'in_progress', submittedAt = null }) {
    this.id = id;
    this.assignmentId = assignmentId;
    this.scores = scores;
    this.comments = comments;
    this.recommendation = recommendation;
    this.status = status;
    this.submittedAt = submittedAt;
  }
}

module.exports = {
  ReviewForm,
};
