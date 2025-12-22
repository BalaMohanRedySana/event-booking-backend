import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  getOrganizerEvents,
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isOrganizer } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, isOrganizer, createEvent);      // Organizer
router.get("/", getEvents);                  // Public
router.get("/organizer/my-events", protect, isOrganizer, getOrganizerEvents);
router.get("/:id", getEventById);             // Public

export default router;
