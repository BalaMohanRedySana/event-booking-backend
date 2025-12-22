import express from "express";
import {
  getAllEvents,
  updateEventStatus,
  getAllBookings,
  getAllUsers,
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/events", protect, isAdmin, getAllEvents);
router.put("/events/:id", protect, isAdmin, updateEventStatus);
router.get("/bookings", protect, isAdmin, getAllBookings);
router.get("/users", protect, isAdmin, getAllUsers);

export default router;
