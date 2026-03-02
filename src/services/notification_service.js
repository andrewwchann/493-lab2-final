class NotificationService {
  constructor({ dataStore } = {}) {
    this.dataStore = dataStore || null;
    this.failDelivery = false;
  }

  setFailDelivery(shouldFail) {
    this.failDelivery = Boolean(shouldFail);
  }

  async send({ type, recipient, payload }) {
    if (this.failDelivery) {
      throw new Error('Notification delivery failed.');
    }
    const delivery = {
      type,
      recipient,
      payload,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
    if (this.dataStore) {
      this.dataStore.insert('notification_logs', {
        notificationType: type,
        recipientAccountId: recipient,
        relatedEntityId: payload && payload.submissionId ? payload.submissionId : null,
        status: 'sent',
        createdAt: delivery.sentAt,
      });
    }
    return delivery;
  }

  async notifyAuthorDecision({ authorId, submissionId, decision }) {
    try {
      await this.send({
        type: 'decision_notice',
        recipient: authorId,
        payload: { submissionId, decision },
      });
      return { status: 'sent' };
    } catch (error) {
      return { status: 'failed', reason: error.message };
    }
  }

  logNonBlockingFailure({ type, context = {}, errorMessage = 'Notification failure.' }) {
    if (this.dataStore) {
      this.dataStore.insert('notification_logs', {
        notificationType: type,
        recipientAccountId: context.recipient || null,
        relatedEntityId: context.scheduleId || context.submissionId || null,
        status: 'failed',
        createdAt: new Date().toISOString(),
      });
    }
    return {
      logged: true,
      message: errorMessage,
    };
  }
}

module.exports = {
  NotificationService,
};
