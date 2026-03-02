class PaymentTransaction {
  constructor({
    id,
    registrationId,
    amount,
    status,
    confirmationNumber = null,
    processedAt,
  }) {
    this.id = id;
    this.registrationId = registrationId;
    this.amount = Number(amount || 0);
    this.status = status;
    this.confirmationNumber = confirmationNumber;
    this.processedAt = processedAt;
  }
}

module.exports = {
  PaymentTransaction,
};
