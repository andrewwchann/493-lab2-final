class ReviewService {
  constructor({ dataStore, notificationService }) {
    this.dataStore = dataStore;
    this.notificationService = notificationService;
  }

  _getCurrentManuscript(submissionId) {
    return this.dataStore.findOne(
      'manuscripts',
      (row) => row.submissionId === Number(submissionId) && row.isCurrent
    );
  }

  _countActiveAssignments(reviewerAccountId) {
    return this.dataStore
      .list('review_assignments', (row) => row.reviewerAccountId === reviewerAccountId)
      .filter((row) => row.status === 'invited' || row.status === 'accepted').length;
  }

  _countSubmittedReviewsForSubmission(submissionId) {
    return this.dataStore
      .list('review_forms', (row) => {
        const assignment = this.dataStore.findById('review_assignments', row.assignmentId);
        return (
          assignment &&
          assignment.submissionId === Number(submissionId) &&
          row.status === 'submitted'
        );
      })
      .length;
  }

  _latestDecisionForSubmission(submissionId) {
    const decisions = this.dataStore
      .list('decisions', (row) => row.submissionId === Number(submissionId))
      .sort((a, b) => String(b.decidedAt || '').localeCompare(String(a.decidedAt || '')));
    return decisions[0] || null;
  }

  listReviewerDirectory() {
    const reviewers = this.dataStore.list('accounts', (row) => (row.roles || []).includes('reviewer'));
    return reviewers.map((reviewer) => {
      const activeAssignments = this._countActiveAssignments(reviewer.id);
      return {
        id: reviewer.id,
        email: reviewer.email,
        activeAssignments,
        availableSlots: Math.max(0, 5 - activeAssignments),
      };
    });
  }

  listSubmittedPapers() {
    const submissions = this.dataStore.list(
      'submissions',
      (row) => row.status === 'submitted' || row.status === 'under_review' || row.status === 'reviews_complete'
    );

    return submissions.map((submission) => {
      const manuscript = this._getCurrentManuscript(submission.id);
      return {
        id: submission.id,
        title: submission.title,
        status: submission.status,
        manuscriptUrl: manuscript ? manuscript.storageRef : '',
        manuscriptFileName: manuscript ? manuscript.fileName : '',
      };
    });
  }

  listPapersReadyForDecision() {
    const submissions = this.dataStore.list(
      'submissions',
      (row) => row.status === 'reviews_complete'
    );

    return submissions.map((submission) => {
      const manuscript = this._getCurrentManuscript(submission.id);
      return {
        id: submission.id,
        title: submission.title,
        status: submission.status,
        completedReviewCount: this._countSubmittedReviewsForSubmission(submission.id),
        manuscriptUrl: manuscript ? manuscript.storageRef : '',
        manuscriptFileName: manuscript ? manuscript.fileName : '',
      };
    });
  }

  listDecidedPapers() {
    const submissions = this.dataStore.list(
      'submissions',
      (row) => row.status === 'accepted' || row.status === 'rejected'
    );

    return submissions.map((submission) => {
      const manuscript = this._getCurrentManuscript(submission.id);
      const decision = this._latestDecisionForSubmission(submission.id);
      return {
        id: submission.id,
        title: submission.title,
        status: submission.status,
        decision: decision ? decision.decision : submission.status,
        rationale: decision ? decision.rationale || '' : '',
        decidedAt: decision ? decision.decidedAt || '' : '',
        manuscriptUrl: manuscript ? manuscript.storageRef : '',
        manuscriptFileName: manuscript ? manuscript.fileName : '',
      };
    });
  }

  getSubmissionDecisionSummary({ submissionId }) {
    const submission = this.dataStore.findById('submissions', Number(submissionId));
    if (!submission) {
      return null;
    }

    const manuscript = this._getCurrentManuscript(submission.id);
    const decision = this._latestDecisionForSubmission(submission.id);
    return {
      id: submission.id,
      title: submission.title,
      status: submission.status,
      completedReviewCount: this._countSubmittedReviewsForSubmission(submission.id),
      decision: decision ? decision.decision : null,
      rationale: decision ? decision.rationale || '' : '',
      decidedAt: decision ? decision.decidedAt || '' : '',
      manuscriptUrl: manuscript ? manuscript.storageRef : '',
      manuscriptFileName: manuscript ? manuscript.fileName : '',
    };
  }

  listInvitations({ reviewerAccountId }) {
    const invitations = this.dataStore.list(
      'review_assignments',
      (row) => row.reviewerAccountId === Number(reviewerAccountId) && row.status === 'invited'
    );

    return invitations.map((assignment) => {
      const submission = this.dataStore.findById('submissions', assignment.submissionId) || {};
      const manuscript = this._getCurrentManuscript(assignment.submissionId);
      return {
        id: assignment.id,
        submissionId: assignment.submissionId,
        title: submission.title || '',
        abstract: submission.abstract || '',
        reviewDeadline: assignment.reviewDeadline || '',
        manuscriptUrl: manuscript ? manuscript.storageRef : '',
        manuscriptFileName: manuscript ? manuscript.fileName : '',
      };
    });
  }

  _resolveReviewerIds({ reviewerIds = [], reviewerEmails = [] }) {
    if (Array.isArray(reviewerEmails) && reviewerEmails.length > 0) {
      const resolved = [];
      for (const rawEmail of reviewerEmails) {
        const email = String(rawEmail || '').trim().toLowerCase();
        if (!email) {
          continue;
        }

        const reviewer = this.dataStore.findOne('accounts', (row) => {
          return (row.roles || []).includes('reviewer') && String(row.email || '').toLowerCase() === email;
        });
        if (!reviewer) {
          return {
            ok: false,
            errors: { form: `Reviewer email ${rawEmail} is invalid or not registered.` },
          };
        }
        resolved.push(reviewer.id);
      }

      return { ok: true, reviewerIds: resolved };
    }

    return {
      ok: true,
      reviewerIds: Array.isArray(reviewerIds) ? reviewerIds : [],
    };
  }

  async assignReviewers({ submissionId, reviewerIds = [], reviewerEmails = [], reviewDeadline }) {
    const resolvedIds = this._resolveReviewerIds({ reviewerIds, reviewerEmails });
    if (!resolvedIds.ok) {
      return resolvedIds;
    }

    const uniqueReviewerIds = [...new Set(resolvedIds.reviewerIds.map(Number))];
    if (uniqueReviewerIds.length !== 3) {
      return { ok: false, errors: { form: 'Exactly three reviewers are required.' } };
    }

    const submission = this.dataStore.findById('submissions', Number(submissionId));
    if (!submission) {
      return { ok: false, errors: { form: 'Submission not found.' } };
    }

    const existingActiveAssignments = this.dataStore.list(
      'review_assignments',
      (row) =>
        row.submissionId === Number(submissionId) &&
        (row.status === 'invited' || row.status === 'accepted')
    );
    if (existingActiveAssignments.length > 0) {
      return {
        ok: false,
        errors: { form: 'Reviewers are already assigned to this submission.' },
      };
    }

    for (const reviewerId of uniqueReviewerIds) {
      const reviewer = this.dataStore.findById('accounts', reviewerId);
      if (!reviewer || !(reviewer.roles || []).includes('reviewer')) {
        return { ok: false, errors: { form: `Reviewer ${reviewerId} is invalid.` } };
      }
      if (this._countActiveAssignments(reviewerId) >= 5) {
        return { ok: false, errors: { form: `Reviewer ${reviewerId} exceeds workload limit.` } };
      }
    }

    const assignments = uniqueReviewerIds.map((reviewerId) =>
      this.dataStore.insert('review_assignments', {
        submissionId: Number(submissionId),
        reviewerAccountId: reviewerId,
        status: 'invited',
        reviewDeadline: reviewDeadline || null,
        assignedAt: new Date().toISOString(),
      })
    );

    this.dataStore.updateById('submissions', Number(submissionId), { status: 'under_review' });

    const warnings = [];
    for (const assignment of assignments) {
      try {
        await this.notificationService.send({
          type: 'review_invitation',
          recipient: assignment.reviewerAccountId,
          payload: { assignmentId: assignment.id, submissionId: assignment.submissionId },
        });
      } catch (error) {
        warnings.push(`Invitation delivery failed for reviewer ${assignment.reviewerAccountId}.`);
      }
    }

    return { ok: true, assignments, warnings };
  }

  async respondInvitation({ assignmentId, reviewerAccountId, response }) {
    const assignment = this.dataStore.findById('review_assignments', Number(assignmentId));
    if (!assignment) {
      return { ok: false, errors: { form: 'Assignment not found.' } };
    }
    if (reviewerAccountId && assignment.reviewerAccountId !== Number(reviewerAccountId)) {
      return { ok: false, errors: { form: 'You are not authorized to respond to this invitation.' } };
    }

    const normalized = String(response || '').toLowerCase();
    if (!['accept', 'decline'].includes(normalized)) {
      return { ok: false, errors: { form: 'Response must be accept or decline.' } };
    }

    const status = normalized === 'accept' ? 'accepted' : 'declined';
    const updated = this.dataStore.updateById('review_assignments', assignment.id, { status });

    try {
      await this.notificationService.send({
        type: `review_${status}`,
        recipient: 'editor',
        payload: { assignmentId: assignment.id, status },
      });
    } catch (error) {
      if (typeof this.notificationService.logNonBlockingFailure === 'function') {
        this.notificationService.logNonBlockingFailure({
          type: `review_${status}`,
          context: { assignmentId: assignment.id },
          errorMessage: error.message,
        });
      }
    }

    return { ok: true, assignment: updated };
  }

  listAcceptedAssignments({ reviewerAccountId }) {
    const assignments = this.dataStore.list(
      'review_assignments',
      (row) => row.reviewerAccountId === Number(reviewerAccountId) && row.status === 'accepted'
    );

    return assignments.map((assignment) => {
      const submission = this.dataStore.findById('submissions', assignment.submissionId) || {};
      const manuscript = this._getCurrentManuscript(assignment.submissionId);
      return {
        ...assignment,
        title: submission.title,
        abstract: submission.abstract,
        manuscriptUrl: manuscript ? manuscript.storageRef : '',
        manuscriptFileName: manuscript ? manuscript.fileName : '',
      };
    });
  }

  _canAccessReviewForm({ assignment, reviewerAccountId, now = new Date() }) {
    if (!assignment || assignment.reviewerAccountId !== Number(reviewerAccountId)) {
      return false;
    }
    if (assignment.status !== 'accepted') {
      return false;
    }
    if (assignment.reviewDeadline && new Date(assignment.reviewDeadline) < now) {
      return false;
    }
    return true;
  }

  getReviewForm({ assignmentId, reviewerAccountId }) {
    const assignment = this.dataStore.findById('review_assignments', Number(assignmentId));
    if (!this._canAccessReviewForm({ assignment, reviewerAccountId })) {
      return { ok: false, errors: { form: 'Review form access denied.' } };
    }

    const manuscript = this._getCurrentManuscript(assignment.submissionId);
    const existing = this.dataStore.findOne('review_forms', (row) => row.assignmentId === assignment.id);
    if (!existing) {
      return {
        ok: true,
        form: null,
        manuscriptUrl: manuscript ? manuscript.storageRef : '',
        manuscriptFileName: manuscript ? manuscript.fileName : '',
      };
    }
    return {
      ok: true,
      form: existing,
      manuscriptUrl: manuscript ? manuscript.storageRef : '',
      manuscriptFileName: manuscript ? manuscript.fileName : '',
    };
  }

  saveReviewDraft({ assignmentId, reviewerAccountId, scores, comments, recommendation }) {
    const assignment = this.dataStore.findById('review_assignments', Number(assignmentId));
    if (!this._canAccessReviewForm({ assignment, reviewerAccountId })) {
      return { ok: false, errors: { form: 'Review form access denied.' } };
    }

    const existing = this.dataStore.findOne('review_forms', (row) => row.assignmentId === assignment.id);
    if (existing) {
      const updated = this.dataStore.updateById('review_forms', existing.id, {
        scores,
        comments,
        recommendation,
        status: 'in_progress',
      });
      return { ok: true, form: updated };
    }

    const created = this.dataStore.insert('review_forms', {
      assignmentId: assignment.id,
      scores,
      comments,
      recommendation,
      status: 'in_progress',
      submittedAt: null,
    });
    return { ok: true, form: created };
  }

  async submitReview({ assignmentId, reviewerAccountId, scores, comments, recommendation }) {
    const assignment = this.dataStore.findById('review_assignments', Number(assignmentId));
    if (!this._canAccessReviewForm({ assignment, reviewerAccountId })) {
      return { ok: false, errors: { form: 'Review form access denied.' } };
    }

    if (!scores || !comments || !recommendation) {
      return { ok: false, errors: { form: 'Scores, comments, and recommendation are required.' } };
    }

    const existing = this.dataStore.findOne('review_forms', (row) => row.assignmentId === assignment.id);
    const now = new Date().toISOString();

    let review;
    if (existing) {
      review = this.dataStore.updateById('review_forms', existing.id, {
        scores,
        comments,
        recommendation,
        status: 'submitted',
        submittedAt: now,
      });
    } else {
      review = this.dataStore.insert('review_forms', {
        assignmentId: assignment.id,
        scores,
        comments,
        recommendation,
        status: 'submitted',
        submittedAt: now,
      });
    }

    const submissionId = assignment.submissionId;
    const submittedCount = this.dataStore
      .list('review_forms', (row) => {
        const linked = this.dataStore.findById('review_assignments', row.assignmentId);
        return linked && linked.submissionId === submissionId && row.status === 'submitted';
      })
      .length;

    if (submittedCount === 3) {
      this.dataStore.updateById('submissions', submissionId, { status: 'reviews_complete' });
      try {
        await this.notificationService.send({
          type: 'reviews_complete',
          recipient: 'editor',
          payload: { submissionId },
        });
      } catch (error) {
        if (typeof this.notificationService.logNonBlockingFailure === 'function') {
          this.notificationService.logNonBlockingFailure({
            type: 'reviews_complete',
            context: { submissionId },
            errorMessage: error.message,
          });
        }
      }
    }

    return { ok: true, review, submittedCount };
  }

  getEditorReviewSet({ submissionId }) {
    const assignments = this.dataStore.list('review_assignments', (row) => row.submissionId === Number(submissionId));
    const reviews = assignments
      .map((a) => this.dataStore.findOne('review_forms', (row) => row.assignmentId === a.id && row.status === 'submitted'))
      .filter(Boolean);

    const manuscript = this._getCurrentManuscript(submissionId);

    if (reviews.length < 3) {
      return {
        ok: false,
        errors: { form: 'Three completed reviews are required.' },
        reviews,
        manuscriptUrl: manuscript ? manuscript.storageRef : '',
        manuscriptFileName: manuscript ? manuscript.fileName : '',
      };
    }

    return {
      ok: true,
      reviews,
      manuscriptUrl: manuscript ? manuscript.storageRef : '',
      manuscriptFileName: manuscript ? manuscript.fileName : '',
    };
  }

  async submitDecision({ submissionId, editorAccountId, decision, rationale = '' }) {
    const reviewSet = this.getEditorReviewSet({ submissionId });
    if (!reviewSet.ok) {
      return { ok: false, errors: reviewSet.errors };
    }

    const submission = this.dataStore.findById('submissions', Number(submissionId));
    if (!submission) {
      return { ok: false, errors: { form: 'Submission not found.' } };
    }

    const normalized = String(decision || '').toLowerCase();
    if (!['accept', 'reject'].includes(normalized)) {
      return { ok: false, errors: { form: 'Decision must be accept or reject.' } };
    }

    const record = this.dataStore.insert('decisions', {
      submissionId: Number(submissionId),
      editorAccountId,
      decision: normalized,
      rationale,
      decidedAt: new Date().toISOString(),
    });

    this.dataStore.updateById('submissions', Number(submissionId), {
      status: normalized === 'accept' ? 'accepted' : 'rejected',
    });

    let deliveryStatus = 'failed';
    if (this.notificationService && typeof this.notificationService.notifyAuthorDecision === 'function') {
      const delivery = await this.notificationService.notifyAuthorDecision({
        authorId: submission.authorAccountId,
        submissionId: submission.id,
        decision: normalized,
      });
      deliveryStatus = delivery.status;
    }

    this.dataStore.insert('author_notifications', {
      authorAccountId: submission.authorAccountId,
      submissionId: submission.id,
      message:
        normalized === 'accept'
          ? 'Your paper has been approved for the conference.'
          : 'Your paper was not accepted for this conference.',
      deliveryStatus,
      createdAt: new Date().toISOString(),
    });

    return {
      ok: true,
      decision: record,
      notificationWarning:
        deliveryStatus === 'failed' ? 'Decision saved but author notification delivery failed.' : null,
    };
  }
}

module.exports = {
  ReviewService,
};
