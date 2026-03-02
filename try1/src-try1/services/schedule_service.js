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

  generateDraftSchedule({ acceptedSubmissionIds = [] }) {
    const normalizedIds = [...new Set(acceptedSubmissionIds.map(Number))].filter((id) => Number.isFinite(id) && id > 0);
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

    return { ok: true, schedule: updatedSchedule, items: storedItems, previewHtml: draftHtml };
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
      return { ok: false, errors: { form: 'Schedule publication failed; remains draft.' } };
    }

    let notificationWarning = null;
    try {
      await this.notificationService.send({
        type: 'schedule_published',
        recipient: 'public',
        payload: { scheduleId: updated.id },
      });
    } catch (error) {
      notificationWarning = 'Schedule published but notification delivery failed.';
      if (typeof this.notificationService.logNonBlockingFailure === 'function') {
        this.notificationService.logNonBlockingFailure({
          type: 'schedule_published',
          context: { scheduleId: updated.id },
          errorMessage: error.message,
        });
      }
    }

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
