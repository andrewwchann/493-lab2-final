class PricingController {
  constructor({ pricingService }) {
    this.pricingService = pricingService;
  }

  showPricing() {
    const pricing = this.pricingService.listPricing();
    if (!pricing.ok) {
      return {
        status: 503,
        body: {
          view: 'pricing.html',
          errors: pricing.errors,
          categories: [],
        },
      };
    }

    return {
      status: 200,
      body: {
        view: 'pricing.html',
        categories: pricing.categories,
      },
    };
  }
}

module.exports = {
  PricingController,
};
