const { redactSensitiveFields } = require('./error_policy');

class PaymentService {
  constructor({ dataStore, paymentGatewayService, pricingService, ticketService }) {
    this.dataStore = dataStore;
    this.paymentGatewayService = paymentGatewayService;
    this.pricingService = pricingService;
    this.ticketService = ticketService;
    this.registrationOpen = true;
  }

  setRegistrationOpen(isOpen) {
    this.registrationOpen = Boolean(isOpen);
  }

  _validateCard(card = {}) {
    const errors = {};
    if (!card.cardNumber) {
      errors.cardNumber = 'Card number is required.';
    }
    if (!card.expiry) {
      errors.expiry = 'Card expiry is required.';
    }
    if (!card.cvv) {
      errors.cvv = 'Card CVV is required.';
    }
    return errors;
  }

  async processRegistrationPayment({ attendeeAccountId, attendeeName, pricingCategoryId, card }) {
    if (!this.registrationOpen) {
      return { ok: false, status: 400, errors: { form: 'Conference registration is closed.' } };
    }

    const pricing = this.pricingService.getCategoryById(pricingCategoryId);
    if (!pricing.ok) {
      return { ok: false, status: 422, errors: pricing.errors };
    }

    const cardErrors = this._validateCard(card);
    if (Object.keys(cardErrors).length > 0) {
      return { ok: false, status: 422, errors: cardErrors };
    }

    const registration = this.dataStore.insert('registrations', {
      attendeeAccountId: attendeeAccountId || null,
      attendeeName: attendeeName || 'Attendee',
      pricingCategoryId: pricing.category.id,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    });

    let charge;
    try {
      charge = await this.paymentGatewayService.charge({ amount: pricing.category.price, card });
    } catch (error) {
      this.dataStore.updateById('registrations', registration.id, { status: 'payment_declined' });
      return {
        ok: false,
        status: 503,
        errors: { form: 'Payment service is unavailable. Please retry later.' },
      };
    }

    if (!charge.approved) {
      const declined = this.dataStore.updateById('registrations', registration.id, { status: 'payment_declined' });
      const payment = this.dataStore.insert('payment_transactions', {
        registrationId: registration.id,
        amount: pricing.category.price,
        status: 'declined',
        confirmationNumber: null,
        processedAt: new Date().toISOString(),
      });
      return {
        ok: false,
        status: 402,
        registration: declined,
        payment,
        errors: { form: charge.reason || 'Payment was declined.' },
      };
    }

    const confirmedRegistration = this.dataStore.updateById('registrations', registration.id, { status: 'registered' });
    const payment = this.dataStore.insert('payment_transactions', {
      registrationId: registration.id,
      amount: pricing.category.price,
      status: 'approved',
      confirmationNumber: charge.confirmationNumber,
      processedAt: new Date().toISOString(),
    });

    const ticketResult = await this.ticketService.generateTicketForRegistration({
      registration: confirmedRegistration,
      pricingCategory: pricing.category,
      paymentConfirmationNumber: payment.confirmationNumber,
      attendeeName: confirmedRegistration.attendeeName,
    });

    if (!ticketResult.ok) {
      return {
        ok: true,
        status: 201,
        registration: this.dataStore.findById('registrations', registration.id),
        payment,
        ticket: null,
        warning: ticketResult.errors.form,
      };
    }

    return {
      ok: true,
      status: 201,
      registration: this.dataStore.findById('registrations', registration.id),
      payment,
      ticket: ticketResult.ticket,
    };
  }

  sanitizePaymentPayload(payload) {
    return redactSensitiveFields(payload);
  }
}

module.exports = {
  PaymentService,
};
