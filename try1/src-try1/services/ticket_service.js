class TicketService {
  constructor({ dataStore, notificationService } = {}) {
    this.dataStore = dataStore || null;
    this.notificationService = notificationService || null;
    this.failGeneration = false;
    this.failStorage = false;
  }

  setFailGeneration(shouldFail) {
    this.failGeneration = Boolean(shouldFail);
  }

  setFailStorage(shouldFail) {
    this.failStorage = Boolean(shouldFail);
  }

  _buildReference() {
    return `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  _markRegistrationTicketPending(registrationId) {
    if (this.dataStore) {
      this.dataStore.updateById('registrations', Number(registrationId), {
        status: 'ticket_pending',
      });
    }
  }

  async generateTicketForRegistration({
    registration,
    pricingCategory,
    paymentConfirmationNumber,
    attendeeName,
  }) {
    if (!registration || !registration.id) {
      return { ok: false, errors: { form: 'Registration is required before ticket generation.' } };
    }

    if (this.failGeneration) {
      this._markRegistrationTicketPending(registration.id);
      return {
        ok: false,
        delayed: true,
        errors: { form: 'Registration confirmed. Ticket generation is delayed.' },
      };
    }

    const ticketPayload = {
      registrationId: registration.id,
      ticketReference: this._buildReference(),
      status: 'generated',
      attendeeName,
      registrationCategory: pricingCategory.attendeeType,
      paymentConfirmationNumber,
      createdAt: new Date().toISOString(),
    };

    if (this.failStorage) {
      this._markRegistrationTicketPending(registration.id);
      return {
        ok: false,
        delayed: true,
        errors: { form: 'Registration confirmed. Ticket access is delayed due to storage error.' },
      };
    }

    let ticket = ticketPayload;
    if (this.dataStore) {
      ticket = this.dataStore.insert('tickets', ticketPayload);
      this.dataStore.updateById('registrations', Number(registration.id), {
        status: 'registered',
      });
    }

    if (this.notificationService) {
      try {
        await this.notificationService.send({
          type: 'ticket_ready',
          recipient: registration.attendeeAccountId,
          payload: { registrationId: registration.id, ticketId: ticket.id || null },
        });
      } catch (error) {
        if (typeof this.notificationService.logNonBlockingFailure === 'function') {
          this.notificationService.logNonBlockingFailure({
            type: 'ticket_ready',
            context: { recipient: registration.attendeeAccountId, registrationId: registration.id },
            errorMessage: error.message,
          });
        }
      }
    }

    return { ok: true, ticket };
  }

  async generateTicket({ registrationId, attendeeName }) {
    const registration = this.dataStore ? this.dataStore.findById('registrations', Number(registrationId)) : null;
    if (this.dataStore && !registration) {
      return { ok: false, errors: { form: 'Registration not found.' } };
    }

    return this.generateTicketForRegistration({
      registration: registration || { id: registrationId, attendeeAccountId: null },
      pricingCategory: { attendeeType: 'attendee' },
      paymentConfirmationNumber: null,
      attendeeName,
    });
  }

  getTicket({ registrationId }) {
    if (!this.dataStore) {
      return { ok: false, errors: { form: 'Ticket store is unavailable.' } };
    }

    const registration = this.dataStore.findById('registrations', Number(registrationId));
    if (!registration) {
      return { ok: false, status: 404, errors: { form: 'Registration not found.' } };
    }

    const ticket = this.dataStore.findOne('tickets', (row) => row.registrationId === registration.id);
    if (!ticket) {
      if (registration.status === 'ticket_pending') {
        return {
          ok: false,
          status: 202,
          errors: { form: 'Ticket is delayed. Your registration is confirmed.' },
        };
      }
      return { ok: false, status: 404, errors: { form: 'Ticket not found.' } };
    }

    return { ok: true, ticket, registration };
  }
}

module.exports = {
  TicketService,
};
