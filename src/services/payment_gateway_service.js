class PaymentGatewayService {
  constructor() {
    this.forceDecline = false;
    this.forceError = false;
  }

  setForceDecline(shouldDecline) {
    this.forceDecline = Boolean(shouldDecline);
  }

  setForceError(shouldError) {
    this.forceError = Boolean(shouldError);
  }

  async charge({ amount, card }) {
    if (this.forceError) {
      throw new Error('Payment gateway unavailable.');
    }

    if (!amount || !card || !card.cardNumber || !card.expiry || !card.cvv) {
      return { approved: false, reason: 'Missing payment information.' };
    }

    if (this.forceDecline) {
      return { approved: false, reason: 'Payment was declined by the gateway.' };
    }

    return {
      approved: true,
      confirmationNumber: `PAY-${Date.now()}`,
    };
  }
}

module.exports = {
  PaymentGatewayService,
};
