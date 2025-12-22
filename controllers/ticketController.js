// controllers/ticketController.js
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";

// @desc Get all tickets for logged-in user
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate("event", "title eventDate location description")
      .populate("booking", "status")
      .sort({ createdAt: -1 });

    // Auto-update expired tickets
    for (let ticket of tickets) {
      if (ticket.isExpired && ticket.status === "active") {
        ticket.status = "expired";
        await ticket.save();
      }
    }

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get specific ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      ticketId: req.params.ticketId,
      user: req.user._id,
    })
      .populate("event", "title eventDate location description totalSeats")
      .populate("user", "name email")
      .populate("booking", "status createdAt");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Auto-update if expired
    if (ticket.isExpired && ticket.status === "active") {
      ticket.status = "expired";
      await ticket.save();
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Cancel a ticket
export const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      ticketId: req.params.ticketId,
      user: req.user._id,
    }).populate("event");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status === "cancelled") {
      return res.status(400).json({ message: "Ticket already cancelled" });
    }

    if (ticket.status === "expired") {
      return res.status(400).json({ message: "Cannot cancel expired ticket" });
    }

    // Update ticket status
    ticket.status = "cancelled";
    await ticket.save();

    // Update booking status
    const Booking = (await import("../models/Booking.js")).default;
    await Booking.findByIdAndUpdate(ticket.booking, { status: "cancelled" });

    // Restore seat availability
    const Event = (await import("../models/Event.js")).default;
    await Event.findByIdAndUpdate(ticket.event._id, {
      $inc: { availableSeats: 1 },
    });

    res.json({ message: "Ticket cancelled successfully", ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get organizer's bookings/tickets
export const getOrganizerBookings = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate("event", "title eventDate location")
      .populate("booking", "status")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
