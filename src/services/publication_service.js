class PublicationService {
  constructor() {
    this.failPublish = false;
  }

  setFailPublish(shouldFail) {
    this.failPublish = Boolean(shouldFail);
  }

  async publishSchedule(scheduleHtml) {
    if (!scheduleHtml) {
      throw new Error('Schedule content required for publication.');
    }
    if (this.failPublish) {
      throw new Error('Public website publication failed.');
    }

    return {
      published: true,
      publishedAt: new Date().toISOString(),
    };
  }
}

module.exports = {
  PublicationService,
};
