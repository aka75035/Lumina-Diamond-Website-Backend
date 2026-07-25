const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const shiprocketSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      default: null,
    },

    shipmentId: {
      type: String,
      default: null,
    },

    awbCode: {
      type: String,
      default: null,
    },

    courierName: {
      type: String,
      default: null,
    },

    trackingUrl: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Price of one item before GST
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // GST for one item
    gst: {
      type: Number,
      default: 0,
      min: 0,
    },

    // (price + gst) × quantity
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
    },

    company: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pinCode: {
      type: String,
      default: "",
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Human-readable order number
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An order must contain at least one item",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Final payable amount
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "RAZORPAY",
        "COD",
      ],
      default: "RAZORPAY",
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "SUCCESS",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
      index: true,
    },

    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "PACKED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
      ],
      default: "PLACED",
      index: true,
    },

    // Razorpay Details
    razorpayOrderId: {
      type: String,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    // Shiprocket Details
    shiprocket: {
      type: shiprocketSchema,
      default: () => ({}),
    },

    // Tracking Timeline
    tracking: {
      type: [trackingSchema],
      default: [
        {
          status: "Order Placed",
          location: "Online Store",
          message: "Your order has been placed successfully.",
        },
      ],
    },

    receipt: {
      type: String,
      unique: true,
      sparse: true,
    },

    paidAt: Date,

    deliveredAt: Date,

    cancelledAt: Date,

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);