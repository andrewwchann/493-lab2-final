class ReviewController {
  constructor({ reviewService }) {
    this.reviewService = reviewService;
  }

  _buildAssignReviewersView({ errors = null, message = '', assignments = [] } = {}) {
    return {
      view: 'assign_reviewers.html',
      reviewers: this.reviewService.listReviewerDirectory(),
      errors,
      message,
      assignments,
    };
  }

  showAssignReviewersView() {
    return { status: 200, body: this._buildAssignReviewersView() };
  }

  async assignReviewers({ body }) {
    const reviewerIds = Array.isArray(body.reviewerIds) ? body.reviewerIds : [];
    const reviewerEmails = Array.isArray(body.reviewerEmails)
      ? body.reviewerEmails
      : String(body.reviewerEmails || '')
          .split(',')
          .map((email) => email.trim())
          .filter(Boolean);

    const result = await this.reviewService.assignReviewers({
      submissionId: body.submissionId,
      reviewerIds,
      reviewerEmails,
      reviewDeadline: body.reviewDeadline,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: this._buildAssignReviewersView({ errors: result.errors }),
      };
    }

    return {
      status: 201,
      body: this._buildAssignReviewersView({
        message: 'Reviewers assigned successfully.',
        assignments: result.assignments,
      }),
    };
  }

  showInvitationView() {
    return { status: 200, body: { view: 'reviewer_invitation.html' } };
  }

  async respondInvitation({ body }) {
    const result = await this.reviewService.respondInvitation({
      assignmentId: body.assignmentId,
      response: body.response,
    });
    if (!result.ok) {
      return { status: 422, body: { view: 'reviewer_invitation.html', errors: result.errors } };
    }
    return { status: 200, body: { assignment: result.assignment } };
  }

  showReviewerAssignments({ session }) {
    const assignments = this.reviewService.listAcceptedAssignments({ reviewerAccountId: session.accountId });
    return { status: 200, body: { view: 'reviewer_assignments.html', assignments } };
  }

  showReviewForm({ session, body }) {
    const result = this.reviewService.getReviewForm({
      assignmentId: body.assignmentId,
      reviewerAccountId: session.accountId,
    });

    if (!result.ok) {
      return { status: 403, body: { view: 'review_form.html', errors: result.errors } };
    }

    return { status: 200, body: { view: 'review_form.html', form: result.form } };
  }

  saveReviewDraft({ session, body }) {
    const result = this.reviewService.saveReviewDraft({
      assignmentId: body.assignmentId,
      reviewerAccountId: session.accountId,
      scores: body.scores,
      comments: body.comments,
      recommendation: body.recommendation,
    });

    if (!result.ok) {
      return { status: 422, body: { view: 'review_form.html', errors: result.errors } };
    }

    return { status: 200, body: { form: result.form } };
  }

  async submitReview({ session, body }) {
    const result = await this.reviewService.submitReview({
      assignmentId: body.assignmentId,
      reviewerAccountId: session.accountId,
      scores: body.scores,
      comments: body.comments,
      recommendation: body.recommendation,
    });

    if (!result.ok) {
      return { status: 422, body: { view: 'review_form.html', errors: result.errors } };
    }

    return { status: 200, body: { review: result.review } };
  }

  showEditorReviews({ body }) {
    const result = this.reviewService.getEditorReviewSet({ submissionId: body.submissionId });
    if (!result.ok) {
      return { status: 422, body: { view: 'editor_reviews.html', errors: result.errors } };
    }
    return { status: 200, body: { view: 'editor_reviews.html', reviews: result.reviews } };
  }

  async submitDecision({ session, body }) {
    const result = await this.reviewService.submitDecision({
      submissionId: body.submissionId,
      editorAccountId: session.accountId,
      decision: body.decision,
      rationale: body.rationale,
    });

    if (!result.ok) {
      return { status: 422, body: { view: 'decision.html', errors: result.errors } };
    }

    return {
      status: 200,
      body: {
        decision: result.decision,
        notificationWarning: result.notificationWarning || null,
      },
    };
  }
}

module.exports = {
  ReviewController,
};
