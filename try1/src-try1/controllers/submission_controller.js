class SubmissionController {
  constructor({ submissionService }) {
    this.submissionService = submissionService;
  }

  showSubmitForm() {
    return {
      status: 200,
      body: { view: 'submit_paper.html' },
    };
  }

  async submit({ session, body }) {
    const file = body.file || null;
    const result = await this.submissionService.createSubmission({
      authorAccountId: session.accountId,
      title: body.title,
      authorNames: body.authorNames,
      affiliationOrContact: body.affiliationOrContact,
      abstract: body.abstract,
      keywords: body.keywords,
      file,
      finalSubmit: true,
    });

    if (!result.ok) {
      const status = result.code === 'SUBMISSION_WINDOW_CLOSED' ? 400 : 422;
      return {
        status,
        body: {
          view: 'submit_paper.html',
          errors: result.errors,
        },
      };
    }

    return {
      status: 201,
      body: {
        redirectTo: '/dashboard/author?message=paper-submitted',
      },
    };
  }

  showReplaceForm() {
    return {
      status: 200,
      body: { view: 'update_manuscript.html' },
    };
  }

  async replace({ body }) {
    const result = await this.submissionService.replaceManuscript({
      submissionId: body.submissionId,
      file: body.file,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: {
          view: 'update_manuscript.html',
          errors: result.errors,
        },
      };
    }

    return {
      status: 200,
      body: {
        manuscriptId: result.manuscript.id,
      },
    };
  }

  showDraftList({ session }) {
    const drafts = this.submissionService.listDrafts({ authorAccountId: session.accountId });
    return {
      status: 200,
      body: {
        view: 'draft_list.html',
        drafts,
      },
    };
  }

  saveDraft({ session, body }) {
    const result = this.submissionService.saveDraft({
      authorAccountId: session.accountId,
      submissionId: body.submissionId,
      title: body.title,
      identifier: body.identifier,
      payload: body,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: { view: 'submit_paper.html', errors: result.errors },
      };
    }

    return {
      status: 201,
      body: {
        redirectTo: '/dashboard/author?message=draft-saved',
      },
    };
  }

  resumeDraft({ session, body }) {
    const result = this.submissionService.resumeDraft({
      authorAccountId: session.accountId,
      submissionId: body.submissionId,
    });

    if (!result.ok) {
      return {
        status: 404,
        body: { view: 'draft_list.html', errors: result.errors },
      };
    }

    return {
      status: 200,
      body: { draft: result.draft },
    };
  }

  async submitDraft({ session, body }) {
    const result = await this.submissionService.submitDraft({
      authorAccountId: session.accountId,
      submissionId: body.submissionId,
      file: body.file,
    });

    if (!result.ok) {
      const status = result.code === 'SUBMISSION_WINDOW_CLOSED' ? 400 : 422;
      return {
        status,
        body: { view: 'draft_list.html', errors: result.errors },
      };
    }

    return {
      status: 200,
      body: {
        submissionId: result.submission.id,
        status: 'Submitted',
      },
    };
  }
}

module.exports = {
  SubmissionController,
};
