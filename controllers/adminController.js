import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

// @desc View all events
export const getAllEvents = async (req, res) => {
  const events = await Event.find().populate("organizer", "name email");
  res.json(events);
};

// @desc Approve / Reject event
export const updateEventStatus = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  event.status = req.body.status;
  await event.save();

  res.json({ message: "Event status updated" });
};

// @desc View all bookings
export const getAllBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate("user", "name email")
    .populate("event", "title");
  res.json(bookings);
};

// @desc View all users
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};
