class ScheduleService {
  constructor({ dataStore, publicationService, notificationService }) {
    this.dataStore = dataStore;
    this.publicationService = publicationService;
    this.notificationService = notificationService;
    this.simulateGenerationFailure = false;
    this.simulateStorageFailure = false;
  }

  setGenerationFailure(shouldFail) {
    this.simulateGenerationFailure = Boolean(shouldFail);
  }

  setStorageFailure(shouldFail) {
    this.simulateStorageFailure = Boolean(shouldFail);
  }

  _formatHour(hour) {
    return String(hour).padStart(2, '0');
  }

  _buildDraftItems({ scheduleId, acceptedSubmissionIds }) {
    return acceptedSubmissionIds.map((submissionId, index) => {
      const startHour = 9 + index;
      const endHour = startHour + 1;
      return {
        scheduleId,
        submissionId,
        session: `Session ${Math.floor(index / 3) + 1}`,
        room: `Room ${index % 3 + 1}`,
        startTime: `2026-05-01T${this._formatHour(startHour)}:00:00Z`,
        endTime: `2026-05-01T${this._formatHour(endHour)}:00:00Z`,
      };
    });
  }

  listAcceptedSubmissions() {
    return this.dataStore
      .list('submissions', (row) => row.status === 'accepted')
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((submission) => ({
        id: submission.id,
        title: submission.title || '',
        authorAccountId: submission.authorAccountId || null,
        authorNames: submission.authorNames || '',
        status: submission.status,
      }));
  }

  _resolveAcceptedSubmissionIds(acceptedSubmissionIds = []) {
    const requestedIds = [...new Set((acceptedSubmissionIds || []).map(Number))].filter(
      (id) => Number.isFinite(id) && id > 0
    );
    if (requestedIds.length > 0) {
      return requestedIds;
    }
    return this.listAcceptedSubmissions().map((submission) => submission.id);
  }

  _buildScheduleHtml(items) {
    const rows = items
      .map(
        (item) =>
          `<tr><td>${item.session}</td><td>${item.room}</td><td>${item.startTime}</td><td>${item.endTime}</td><td>${item.submissionId}</td></tr>`
      )
      .join('');
    return `<table><thead><tr><th>Session</th><th>Room</th><th>Start</th><th>End</th><th>Submission</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  _isOutsideConferenceHours(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return true;
    }
    const hour = date.getUTCHours();
    return hour < 8 || hour > 20;
  }

  _hasRoomOverlap(items) {
    const byRoom = new Map();
    for (const item of items) {
      const key = String(item.room || '');
      if (!byRoom.has(key)) {
        byRoom.set(key, []);
      }
      byRoom.get(key).push(item);
    }

    for (const roomItems of byRoom.values()) {
      const sorted = roomItems
        .map((item) => ({
          ...item,
          start: new Date(item.startTime).getTime(),
          end: new Date(item.endTime).getTime(),
        }))
        .sort((a, b) => a.start - b.start);

      for (let i = 1; i < sorted.length; i += 1) {
        if (sorted[i].start < sorted[i - 1].end) {
          return true;
        }
      }
    }

    return false;
  }

  _replacePreviousFinalSchedules({ nextFinalScheduleId }) {
    const previousFinals = this.dataStore.list(
      'schedules',
      (row) => row.status === 'final' && row.id !== Number(nextFinalScheduleId)
    );
    for (const schedule of previousFinals) {
      this.dataStore.updateById('schedules', schedule.id, {
        status: 'superseded',
      });
    }
    return previousFinals.map((schedule) => schedule.id);
  }

  _restorePreviousFinalSchedules(previousFinalIds = []) {
    for (const scheduleId of previousFinalIds) {
      this.dataStore.updateById('schedules', Number(scheduleId), {
        status: 'final',
      });
    }
  }

  _collectScheduledAuthors(items = []) {
    const authorMap = new Map();
    for (const item of items) {
      const submission = this.dataStore.findById('submissions', Number(item.submissionId));
      if (!submission || !submission.authorAccountId) {
        continue;
      }
      if (!authorMap.has(submission.authorAccountId)) {
        authorMap.set(submission.authorAccountId, new Set());
      }
      authorMap.get(submission.authorAccountId).add(submission.id);
    }

    return Array.from(authorMap.entries()).map(([authorAccountId, submissionIds]) => ({
      authorAccountId,
      submissionIds: Array.from(submissionIds.values()),
    }));
  }

  async _sendScheduleNotifications({ scheduleId, items }) {
    const warningParts = [];
    const notify = async ({ recipient, payload }) => {
      try {
        await this.notificationService.send({
          type: 'schedule_published',
          recipient,
          payload,
        });
      } catch (error) {
        warningParts.push(`Notification delivery failed for recipient ${recipient}.`);
        if (typeof this.notificationService.logNonBlockingFailure === 'function') {
          this.notificationService.logNonBlockingFailure({
            type: 'schedule_published',
            context: { scheduleId, recipient },
            errorMessage: error.message,
          });
        }
      }
    };

    await notify({
      recipient: 'public',
      payload: { scheduleId },
    });

    const scheduledAuthors = this._collectScheduledAuthors(items);
    for (const author of scheduledAuthors) {
      await notify({
        recipient: author.authorAccountId,
        payload: {
          scheduleId,
          submissionIds: author.submissionIds,
        },
      });
    }

    return warningParts.length > 0 ? warningParts.join(' ') : null;
  }

  listDraftSchedules() {
    return this.dataStore
      .list('schedules', (row) => row.status === 'draft')
      .sort((a, b) => String(b.generatedAt || '').localeCompare(String(a.generatedAt || '')))
      .map((schedule) => {
        const items = this.dataStore.list('schedule_items', (row) => row.scheduleId === schedule.id);
        return {
          id: schedule.id,
          status: schedule.status,
          generatedAt: schedule.generatedAt || '',
          itemCount: items.length,
          submissionIds: items.map((item) => item.submissionId),
          hasPreview: Boolean(schedule.draftHtmlSnapshot),
        };
      });
  }

  generateDraftSchedule({ acceptedSubmissionIds = [] }) {
    const normalizedIds = this._resolveAcceptedSubmissionIds(acceptedSubmissionIds);
    if (!normalizedIds.length) {
      return { ok: false, errors: { form: 'No accepted papers available for scheduling.' } };
    }

    const invalidSubmission = normalizedIds.find((submissionId) => {
      const submission = this.dataStore.findById('submissions', submissionId);
      return !submission || submission.status !== 'accepted';
    });
    if (invalidSubmission) {
      return { ok: false, errors: { form: 'Only accepted submissions can be scheduled.' } };
    }

    if (this.simulateGenerationFailure) {
      return { ok: false, errors: { form: 'Scheduling engine failed to generate a draft.' } };
    }
    if (this.simulateStorageFailure) {
      return { ok: false, errors: { form: 'Could not save generated schedule draft.' } };
    }

    const schedule = this.dataStore.insert('schedules', {
      status: 'draft',
      generatedAt: new Date().toISOString(),
      publishedAt: null,
      publishedHtmlSnapshot: '',
      draftHtmlSnapshot: '',
    });

    const draftItems = this._buildDraftItems({ scheduleId: schedule.id, acceptedSubmissionIds: normalizedIds });
    const storedItems = draftItems.map((item) => this.dataStore.insert('schedule_items', item));
    const draftHtml = this._buildScheduleHtml(storedItems);
    const updatedSchedule = this.dataStore.updateById('schedules', schedule.id, {
      draftHtmlSnapshot: draftHtml,
    });

    return {
      ok: true,
      schedule: updatedSchedule,
      items: storedItems,
      previewHtml: draftHtml,
      acceptedPapers: this.listAcceptedSubmissions(),
    };
  }

  editDraftSchedule({ scheduleId, items = [], cancel = false }) {
    const schedule = this.dataStore.findById('schedules', Number(scheduleId));
    if (!schedule || schedule.status !== 'draft') {
      return { ok: false, errors: { form: 'Draft schedule not found.' } };
    }
    if (cancel) {
      const existingItems = this.dataStore.list('schedule_items', (row) => row.scheduleId === schedule.id);
      return { ok: true, cancelled: true, items: existingItems };
    }
    if (this.simulateStorageFailure) {
      return { ok: false, errors: { form: 'Unable to save schedule edits. Last saved draft is unchanged.' } };
    }

    for (const item of items) {
      if (!item.id || !item.session || !item.room || !item.startTime || !item.endTime) {
        return { ok: false, errors: { form: 'Session, room, start, and end times are required.' } };
      }
      if (new Date(item.startTime) >= new Date(item.endTime)) {
        return { ok: false, errors: { form: 'Invalid timeslot ordering.' } };
      }
      if (this._isOutsideConferenceHours(item.startTime) || this._isOutsideConferenceHours(item.endTime)) {
        return { ok: false, errors: { form: 'Timeslot must be within conference hours.' } };
      }
    }

    if (this._hasRoomOverlap(items)) {
      return { ok: false, errors: { form: 'Schedule conflict detected for room/timeslot.' } };
    }

    for (const item of items) {
      this.dataStore.updateById('schedule_items', Number(item.id), {
        session: item.session,
        room: item.room,
        startTime: item.startTime,
        endTime: item.endTime,
      });
    }

    const refreshedItems = this.dataStore.list('schedule_items', (row) => row.scheduleId === schedule.id);
    const draftHtml = this._buildScheduleHtml(refreshedItems);
    this.dataStore.updateById('schedules', schedule.id, { draftHtmlSnapshot: draftHtml });
    return { ok: true, items: refreshedItems, previewHtml: draftHtml };
  }

  async publishSchedule({ scheduleId, confirmed }) {
    const schedule = this.dataStore.findById('schedules', Number(scheduleId));
    if (!schedule || schedule.status !== 'draft') {
      return { ok: false, errors: { form: 'Draft schedule not found.' } };
    }
    if (!confirmed) {
      return { ok: false, errors: { form: 'Publish confirmation is required.' } };
    }
    if (this.simulateStorageFailure) {
      return { ok: false, errors: { form: 'Could not finalize schedule. Draft remains unchanged.' } };
    }

    const draftItems = this.dataStore.list('schedule_items', (row) => row.scheduleId === schedule.id);
    const publishedHtml = this._buildScheduleHtml(draftItems);
    const previousFinalIds = this._replacePreviousFinalSchedules({ nextFinalScheduleId: scheduleId });

    const updated = this.dataStore.updateById('schedules', Number(scheduleId), {
      status: 'final',
      publishedAt: new Date().toISOString(),
      publishedHtmlSnapshot: publishedHtml,
    });

    try {
      await this.publicationService.publishSchedule(publishedHtml);
    } catch (error) {
      this.dataStore.updateById('schedules', Number(scheduleId), {
        status: 'draft',
        publishedAt: null,
        publishedHtmlSnapshot: '',
      });
      this._restorePreviousFinalSchedules(previousFinalIds);
      return { ok: false, errors: { form: 'Schedule publication failed; remains draft.' } };
    }

    const notificationWarning = await this._sendScheduleNotifications({
      scheduleId: updated.id,
      items: draftItems,
    });

    return { ok: true, schedule: updated, notificationWarning };
  }

  getPublishedSchedule({ scheduleId = null } = {}) {
    if (scheduleId) {
      return this.dataStore.findOne(
        'schedules',
        (row) => row.id === Number(scheduleId) && row.status === 'final'
      );
    }
    const finals = this.dataStore
      .list('schedules', (row) => row.status === 'final')
      .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));
    return finals[0] || null;
  }
}

module.exports = {
  ScheduleService,
};
