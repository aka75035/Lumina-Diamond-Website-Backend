const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  paymentFailed,
  razorpayWebhook,
} = require("../controllers/paymentController");

const {
  restrictToLoggedinUserOnly,
} = require("../middlewares/authentication");

// Create Razorpay order
router.post("/create-order", restrictToLoggedinUserOnly, createOrder);

// Verify successful payment
router.post("/verify", restrictToLoggedinUserOnly, verifyPayment);

// Mark dismissed/failed payments
router.post("/failed", restrictToLoggedinUserOnly, paymentFailed);

// Razorpay calls this directly; no login middleware here.
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

module.exports = router;