// models/Ticket.js
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    qrCode: {
      type: String, // Base64 encoded QR code
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Virtual field to check if ticket is expired
ticketSchema.virtual("isExpired").get(function () {
  return new Date() > this.expiresAt;
});

// Middleware to auto-update status based on expiration
ticketSchema.pre("save", function () {
  if (this.isExpired && this.status === "active") {
    this.status = "expired";
  }
});

// Ensure virtuals are included in JSON
ticketSchema.set("toJSON", { virtuals: true });
ticketSchema.set("toObject", { virtuals: true });

export default mongoose.model("Ticket", ticketSchema);
