class RegistrationController {
  constructor({ pricingService, paymentService }) {
    this.pricingService = pricingService;
    this.paymentService = paymentService;
  }

  showForm() {
    const pricing = this.pricingService.listPricing();
    if (!pricing.ok) {
      return {
        status: 503,
        body: {
          view: 'registration.html',
          errors: pricing.errors,
          categories: [],
        },
      };
    }

    return {
      status: 200,
      body: {
        view: 'registration.html',
        categories: pricing.categories,
      },
    };
  }

  async submit({ session, body }) {
    const result = await this.paymentService.processRegistrationPayment({
      attendeeAccountId: session ? session.accountId : null,
      attendeeName: body.attendeeName,
      pricingCategoryId: body.pricingCategoryId,
      card: {
        cardNumber: body.cardNumber,
        expiry: body.expiry,
        cvv: body.cvv,
      },
    });

    if (!result.ok) {
      return {
        status: result.status || 422,
        body: {
          view: 'registration.html',
          errors: result.errors,
          registration: result.registration || null,
          payment: result.payment || null,
          sanitizedInput: this.paymentService.sanitizePaymentPayload(body),
        },
      };
    }

    return {
      status: 201,
      body: {
        view: 'registration.html',
        registration: result.registration,
        payment: result.payment,
        ticket: result.ticket,
        warning: result.warning || null,
      },
    };
  }
}

module.exports = {
  RegistrationController,
};
