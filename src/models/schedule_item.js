class ScheduleItem {
  constructor({ id, scheduleId, submissionId, session, room, startTime, endTime }) {
    this.id = id;
    this.scheduleId = scheduleId;
    this.submissionId = submissionId;
    this.session = session;
    this.room = room;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

module.exports = {
  ScheduleItem,
};
