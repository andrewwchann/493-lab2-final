class Registration {
  constructor({
    id,
    attendeeAccountId,
    pricingCategoryId,
    status = 'pending_payment',
    attendeeName,
    createdAt,
  }) {
    this.id = id;
    this.attendeeAccountId = attendeeAccountId;
    this.pricingCategoryId = pricingCategoryId;
    this.status = status;
    this.attendeeName = attendeeName;
    this.createdAt = createdAt;
  }
}

module.exports = {
  Registration,
};
