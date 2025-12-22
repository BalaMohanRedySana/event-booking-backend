// routes/ticketRoutes.js
import express from "express";
import {
  getMyTickets,
  getTicketById,
  cancelTicket,
  getOrganizerBookings,
} from "../controllers/ticketController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.get("/my-tickets", protect, getMyTickets);
router.get("/:ticketId", protect, getTicketById);
router.put("/:ticketId/cancel", protect, cancelTicket);

// Organizer routes
router.get("/organizer/bookings", protect, getOrganizerBookings);

export default router;
