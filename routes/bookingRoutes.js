// routes/bookingRoutes.js - FIXED VERSION
import express from "express";
import { bookEvent, getMyBookings } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Test routes should come FIRST
router.get("/test", (req, res) => {
  res.json({ message: "Test route works" });
});

router.get("/test-auth", protect, (req, res) => {
  res.json({ 
    message: "Auth route works",
    user: req.user 
  });
});

// Actual routes
router.get("/my-bookings", protect, getMyBookings);
router.post("/:eventId", protect, bookEvent); // This should be LAST

export default router;