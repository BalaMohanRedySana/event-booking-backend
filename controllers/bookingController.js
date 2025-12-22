import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import Ticket from "../models/Ticket.js";
import QRCode from "qrcode";

// @desc Book event with seat locking & duplicate prevention
export const bookEvent = async (req, res, next) => { // ✅ ADD 'next' parameter here
  const session = await Event.startSession();
  session.startTransaction();

  try {
    console.log("Booking event for user:", req.user._id);
    console.log("Event ID:", req.params.eventId);

    const event = await Event.findById(req.params.eventId).session(session);

    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status !== "approved") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Event not approved" });
    }

    const alreadyBooked = await Booking.findOne({
      user: req.user._id,
      event: event._id,
    }).session(session);

    if (alreadyBooked) {
      await session.abortTransaction();
      return res.status(400).json({ message: "You have already booked this event" });
    }

    if (event.availableSeats <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "No seats available" });
    }

    // ✅ Lock seat
    event.availableSeats -= 1;
    await event.save({ session });



    // ✅ Create booking
    const bookingData = await Booking.create(
      [
        {
          user: req.user._id,
          event: event._id,
        },
      ],
      { session }
    );
    const booking = bookingData[0];

    // ✅ Generate ticket ID
    const ticketId = `TKT-${event._id.toString().slice(-6).toUpperCase()}-${req.user._id.toString().slice(-6).toUpperCase()}-${Date.now()}`;

    // ✅ Generate QR code
    const qrCodeData = JSON.stringify({
      ticketId,
      eventId: event._id,
      userId: req.user._id,
      eventTitle: event.title,
      eventDate: event.eventDate,
    });

    const qrCode = await QRCode.toDataURL(qrCodeData);

    // ✅ Create ticket
    const ticketData = await Ticket.create(
      [
        {
          ticketId,
          booking: booking._id,
          user: req.user._id,
          event: event._id,
          qrCode,
          expiresAt: event.eventDate,
        },
      ],
      { session }
    );
    const ticket = ticketData[0];

    // ✅ Link ticket to booking
    booking.ticket = ticket._id;
    await booking.save({ session });

    await session.commitTransaction();

    console.log("Booking successful for ticket:", ticketId);

    return res.status(201).json({
      success: true,
      message: "Booking confirmed",
      ticketId,
      booking: booking,
      ticket: ticket,
    });

  } catch (error) {
    console.error("Booking error:", error);

    // Check if session is still active before aborting
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }

    // Handle specific errors
    if (error.name === 'MongoServerError' && error.code === 11000) {
      console.log("Duplicate key error details:", error.keyPattern, error.keyValue);
      return res.status(400).json({
        success: false,
        message: "Duplicate booking detected",
        details: error.keyValue // This will show you what's duplicating
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // For unexpected errors, you can either:
    // Option 1: Send response
    return res.status(500).json({
      success: false,
      message: "Internal server error during booking"
    });

    // Option 2: Or pass to Express error handler
    // next(error);

  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// @desc Get logged in user bookings
export const getMyBookings = async (req, res, next) => { // ✅ ADD 'next' parameter here too
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("event", "title eventDate location")
      .populate("ticket");
    return res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};