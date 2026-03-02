class Ticket {
  constructor({
    id,
    registrationId,
    ticketReference,
    status,
    attendeeName,
    registrationCategory,
    paymentConfirmationNumber,
    createdAt,
  }) {
    this.id = id;
    this.registrationId = registrationId;
    this.ticketReference = ticketReference;
    this.status = status;
    this.attendeeName = attendeeName;
    this.registrationCategory = registrationCategory;
    this.paymentConfirmationNumber = paymentConfirmationNumber;
    this.createdAt = createdAt;
  }
}

module.exports = {
  Ticket,
};
