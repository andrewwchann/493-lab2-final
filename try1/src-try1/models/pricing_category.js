class PricingCategory {
  constructor({ id, attendeeType, price, currency = 'USD' }) {
    this.id = id;
    this.attendeeType = attendeeType;
    this.price = Number(price || 0);
    this.currency = currency;
  }
}

module.exports = {
  PricingCategory,
};
