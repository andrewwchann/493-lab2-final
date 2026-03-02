class PricingService {
  constructor({ dataStore }) {
    this.dataStore = dataStore;
    this.failRetrieval = false;
  }

  setFailRetrieval(shouldFail) {
    this.failRetrieval = Boolean(shouldFail);
  }

  seedDefaultPricingIfMissing() {
    const existing = this.dataStore.list('pricing_categories');
    if (existing.length > 0) {
      return existing;
    }

    const defaults = [
      { attendeeType: 'student', price: 100, currency: 'USD' },
      { attendeeType: 'professional', price: 250, currency: 'USD' },
      { attendeeType: 'author', price: 180, currency: 'USD' },
    ];

    return defaults.map((row) => this.dataStore.insert('pricing_categories', row));
  }

  listPricing() {
    if (this.failRetrieval) {
      return { ok: false, errors: { form: 'Pricing is temporarily unavailable. Please retry later.' } };
    }

    const categories = this.seedDefaultPricingIfMissing();
    if (!categories.length) {
      return { ok: false, errors: { form: 'Pricing is not configured.' } };
    }

    return { ok: true, categories };
  }

  getCategoryById(pricingCategoryId) {
    const pricing = this.listPricing();
    if (!pricing.ok) {
      return pricing;
    }

    const category = pricing.categories.find((row) => row.id === Number(pricingCategoryId));
    if (!category) {
      return { ok: false, errors: { pricingCategoryId: 'Please choose a valid attendee category.' } };
    }

    return { ok: true, category };
  }
}

module.exports = {
  PricingService,
};
