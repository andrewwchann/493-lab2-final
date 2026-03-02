class ScheduleController {
  constructor({ scheduleService }) {
    this.scheduleService = scheduleService;
  }

  generateDraft({ body }) {
    const result = this.scheduleService.generateDraftSchedule({
      acceptedSubmissionIds: body.acceptedSubmissionIds || [],
    });

    if (!result.ok) {
      return { status: 422, body: { view: 'schedule_preview.html', errors: result.errors } };
    }

    return {
      status: 201,
      body: {
        view: 'schedule_preview.html',
        schedule: result.schedule,
        items: result.items || [],
        previewHtml: result.previewHtml || '',
      },
    };
  }

  editDraft({ body }) {
    const result = this.scheduleService.editDraftSchedule({
      scheduleId: body.scheduleId,
      items: body.items || [],
      cancel: Boolean(body.cancel),
    });
    if (!result.ok) {
      return { status: 422, body: { view: 'schedule_edit.html', errors: result.errors } };
    }
    if (result.cancelled) {
      return {
        status: 200,
        body: {
          view: 'schedule_edit.html',
          message: 'Edits cancelled. Last saved draft restored.',
          items: result.items || [],
        },
      };
    }
    return {
      status: 200,
      body: {
        view: 'schedule_edit.html',
        message: 'Draft updated.',
        items: result.items || [],
        previewHtml: result.previewHtml || '',
      },
    };
  }

  async publish({ body }) {
    const result = await this.scheduleService.publishSchedule({
      scheduleId: body.scheduleId,
      confirmed: Boolean(body.confirmed),
    });

    if (!result.ok) {
      return { status: 422, body: { view: 'schedule_publish.html', errors: result.errors } };
    }

    return {
      status: 200,
      body: {
        view: 'schedule_publish.html',
        schedule: result.schedule,
        notificationWarning: result.notificationWarning,
      },
    };
  }

  showPublicSchedule({ body }) {
    const schedule = this.scheduleService.getPublishedSchedule({ scheduleId: body.scheduleId || null });
    if (!schedule) {
      return { status: 404, body: { view: 'public_schedule.html', errors: { form: 'Published schedule not found.' } } };
    }
    return { status: 200, body: { view: 'public_schedule.html', schedule } };
  }
}

module.exports = {
  ScheduleController,
};
