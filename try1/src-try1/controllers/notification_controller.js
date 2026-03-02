class NotificationController {
  constructor({ dataStore, notificationService }) {
    this.dataStore = dataStore;
    this.notificationService = notificationService;
  }

  async notifyAuthorDecision({ body }) {
    const submission = this.dataStore.findById('submissions', Number(body.submissionId));
    if (!submission) {
      return { status: 404, body: { errors: { form: 'Submission not found.' } } };
    }

    const authorId = submission.authorAccountId;
    const message = body.message || `Decision: ${body.decision}`;
    const delivery = await this.notificationService.notifyAuthorDecision({
      authorId,
      submissionId: submission.id,
      decision: body.decision,
    });

    this.dataStore.insert('author_notifications', {
      authorAccountId: authorId,
      submissionId: submission.id,
      message,
      deliveryStatus: delivery.status,
      createdAt: new Date().toISOString(),
    });

    return {
      status: 200,
      body: {
        view: 'author_notification.html',
        deliveryStatus: delivery.status,
      },
    };
  }
}

module.exports = {
  NotificationController,
};
