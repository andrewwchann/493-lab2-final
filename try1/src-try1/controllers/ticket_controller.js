class TicketController {
  constructor({ ticketService }) {
    this.ticketService = ticketService;
  }

  showTicket({ body }) {
    const result = this.ticketService.getTicket({ registrationId: body.registrationId });

    if (!result.ok) {
      return {
        status: result.status || 404,
        body: {
          view: 'ticket.html',
          errors: result.errors,
        },
      };
    }

    return {
      status: 200,
      body: {
        view: 'ticket.html',
        ticket: result.ticket,
        registration: result.registration,
      },
    };
  }
}

module.exports = {
  TicketController,
};
