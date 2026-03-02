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
      const latestPricing = this.pricingService.listPricing();
      return {
        status: result.status || 422,
        body: {
          view: 'registration.html',
          errors: result.errors,
          categories: latestPricing.ok ? latestPricing.categories : [],
          registration: result.registration || null,
          payment: result.payment || null,
          sanitizedInput: this.paymentService.sanitizePaymentPayload(body),
        },
      };
    }

    if (session && result.registration) {
      const primaryRole = Array.isArray(session.roles) && session.roles.length ? session.roles[0] : 'attendee';
      const messageCode = result.ticket ? 'registration-complete' : 'registration-pending-ticket';
      return {
        status: 201,
        body: {
          redirectTo: `/dashboard/${encodeURIComponent(primaryRole)}?message=${encodeURIComponent(messageCode)}`,
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
