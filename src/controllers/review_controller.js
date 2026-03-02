class ReviewController {
  constructor({ reviewService }) {
    this.reviewService = reviewService;
  }

  _buildAssignReviewersView({ errors = null, message = '', assignments = [], submissionId = '' } = {}) {
    return {
      view: 'assign_reviewers.html',
      reviewers: this.reviewService.listReviewerDirectory(),
      submittedPapers: this.reviewService.listSubmittedPapers(),
      selectedSubmissionId: submissionId,
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
        body: this._buildAssignReviewersView({ errors: result.errors, submissionId: body.submissionId }),
      };
    }

    return {
      status: 201,
      body: this._buildAssignReviewersView({
        message: 'Reviewers assigned successfully.',
        assignments: result.assignments,
        submissionId: body.submissionId,
      }),
    };
  }

  showInvitationView({ session, body = {} } = {}) {
    const invitations = this.reviewService.listInvitations({ reviewerAccountId: session.accountId });
    return {
      status: 200,
      body: {
        view: 'reviewer_invitation.html',
        assignmentId: body.assignmentId || '',
        message: body.message || '',
        invitations,
      },
    };
  }

  async respondInvitation({ session, body }) {
    const result = await this.reviewService.respondInvitation({
      assignmentId: body.assignmentId,
      reviewerAccountId: session.accountId,
      response: body.response,
    });
    if (!result.ok) {
      return {
        status: 422,
        body: {
          view: 'reviewer_invitation.html',
          errors: result.errors,
          assignmentId: body.assignmentId || '',
          invitations: this.reviewService.listInvitations({ reviewerAccountId: session.accountId }),
        },
      };
    }
    const message = result.assignment.status === 'accepted' ? 'invitation-accepted' : 'invitation-declined';
    return {
      status: 200,
      body: { redirectTo: `/reviews/assignments?message=${encodeURIComponent(message)}` },
    };
  }

  showReviewerAssignments({ session, body = {} }) {
    const assignments = this.reviewService.listAcceptedAssignments({ reviewerAccountId: session.accountId });
    return {
      status: 200,
      body: {
        view: 'reviewer_assignments.html',
        assignments,
        message: body.message || '',
      },
    };
  }

  showReviewForm({ session, body }) {
    const result = this.reviewService.getReviewForm({
      assignmentId: body.assignmentId,
      reviewerAccountId: session.accountId,
    });

    if (!result.ok) {
      return {
        status: 403,
        body: {
          view: 'review_form.html',
          assignmentId: body.assignmentId || '',
          message: body.message || '',
          errors: result.errors,
        },
      };
    }

    return {
      status: 200,
      body: {
        view: 'review_form.html',
        assignmentId: body.assignmentId || '',
        message: body.message || '',
        form: result.form,
        manuscriptUrl: result.manuscriptUrl || '',
        manuscriptFileName: result.manuscriptFileName || '',
      },
    };
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
      return {
        status: 422,
        body: {
          view: 'review_form.html',
          assignmentId: body.assignmentId || '',
          errors: result.errors,
        },
      };
    }

    return {
      status: 200,
      body: {
        redirectTo: `/reviews/form?assignmentId=${encodeURIComponent(body.assignmentId)}&message=review-saved`,
      },
    };
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
      return {
        status: 422,
        body: {
          view: 'review_form.html',
          assignmentId: body.assignmentId || '',
          errors: result.errors,
        },
      };
    }

    return {
      status: 200,
      body: {
        redirectTo: '/reviews/assignments?message=review-submitted',
      },
    };
  }

  showEditorReviews({ body }) {
    const readyPapers = this.reviewService.listPapersReadyForDecision();
    const decidedPapers = this.reviewService.listDecidedPapers();
    if (!body.submissionId) {
      return {
        status: 200,
        body: {
          view: 'editor_reviews.html',
          readyPapers,
          decidedPapers,
        },
      };
    }

    const submissionSummary = this.reviewService.getSubmissionDecisionSummary({
      submissionId: body.submissionId,
    });
    const result = this.reviewService.getEditorReviewSet({ submissionId: body.submissionId });
    if (!result.ok) {
      return {
        status: 422,
        body: {
          view: 'editor_reviews.html',
          errors: result.errors,
          submissionId: body.submissionId,
          manuscriptUrl: result.manuscriptUrl || '',
          manuscriptFileName: result.manuscriptFileName || '',
          readyPapers,
          decidedPapers,
          submissionSummary,
        },
      };
    }
    return {
      status: 200,
      body: {
        view: 'editor_reviews.html',
        reviews: result.reviews,
        submissionId: body.submissionId,
        manuscriptUrl: result.manuscriptUrl || '',
        manuscriptFileName: result.manuscriptFileName || '',
        readyPapers,
        decidedPapers,
        submissionSummary,
      },
    };
  }

  showDecisionForm({ body = {} }) {
    const readyPapers = this.reviewService.listPapersReadyForDecision();
    const decidedPapers = this.reviewService.listDecidedPapers();
    const submissionSummary = body.submissionId
      ? this.reviewService.getSubmissionDecisionSummary({ submissionId: body.submissionId })
      : null;
    return {
      status: 200,
      body: {
        view: 'decision.html',
        submissionId: body.submissionId || '',
        readyPapers,
        decidedPapers,
        submissionSummary,
      },
    };
  }

  async submitDecision({ session, body }) {
    const result = await this.reviewService.submitDecision({
      submissionId: body.submissionId,
      editorAccountId: session.accountId,
      decision: body.decision,
      rationale: body.rationale,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: {
          view: 'decision.html',
          submissionId: body.submissionId || '',
          errors: result.errors,
          readyPapers: this.reviewService.listPapersReadyForDecision(),
          decidedPapers: this.reviewService.listDecidedPapers(),
          submissionSummary: body.submissionId
            ? this.reviewService.getSubmissionDecisionSummary({ submissionId: body.submissionId })
            : null,
        },
      };
    }

    const submissionSummary = this.reviewService.getSubmissionDecisionSummary({
      submissionId: body.submissionId,
    });
    const prettyStatus = submissionSummary && submissionSummary.status
      ? String(submissionSummary.status).toUpperCase()
      : 'UPDATED';

    return {
      status: 200,
      body: {
        view: 'decision.html',
        submissionId: body.submissionId || '',
        message: `Final decision saved. Submission #${body.submissionId} is now ${prettyStatus}.`,
        warning: result.notificationWarning || '',
        decisionRecord: result.decision,
        readyPapers: this.reviewService.listPapersReadyForDecision(),
        decidedPapers: this.reviewService.listDecidedPapers(),
        submissionSummary,
      },
    };
  }
}

module.exports = {
  ReviewController,
};
