class TicketController {
  constructor({ ticketService }) {
    this.ticketService = ticketService;
  }

  showTicket({ session, body }) {
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

    const isEditor = Boolean(session && Array.isArray(session.roles) && session.roles.includes('editor'));
    const isOwner = Boolean(
      session &&
      result.registration &&
      Number(result.registration.attendeeAccountId) === Number(session.accountId)
    );
    if (!isEditor && !isOwner) {
      return {
        status: 403,
        body: {
          view: 'ticket.html',
          errors: { form: 'You are not authorized to view this ticket.' },
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
