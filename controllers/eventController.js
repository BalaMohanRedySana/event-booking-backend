import Event from "../models/Event.js";

// @desc Create event (Organizer)
export const createEvent = async (req, res) => {
  const event = await Event.create({
    ...req.body,
    organizer: req.user._id,
    availableSeats: req.body.totalSeats,
  });

  res.status(201).json(event);
};

// @desc Get approved events
export const getEvents = async (req, res) => {
  const events = await Event.find({ status: "approved" })
    .populate("organizer", "name email");
  res.json(events);
};

// @desc Get event by ID
export const getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate("organizer", "name email");

  if (!event) return res.status(404).json({ message: "Event not found" });

  res.json(event);
};

// @desc Get events for logged in organizer
export const getOrganizerEvents = async (req, res) => {
  const events = await Event.find({ organizer: req.user._id });
  res.json(events);
};
