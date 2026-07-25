const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    // Kept as String because your current cart queries use user_id: String(userId).
    user_id: {
      type: String,
      required: true,
      index: true,
    },

    // Kept as String to remain compatible with your existing cart data.
    product_id: {
      type: String,
      required: true,
      index: true,
    },

    // `name` supports your existing cart records.
    name: {
        type: String,
        default: "",
        trim: true,
    },

    title: {
    type: String,
    default: "",
    trim: true,
    },
    sku: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    customizations: {
      Material: {
        type: String,
        default: "",
      },

      Purity: {
        type: String,
        default: "",
      },
    },

    // Price before GST, for one product.
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // GST amount for one product, not a percentage.
    gst: {
      type: Number,
      default: 0,
      min: 0,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// A user should have only one cart entry for the same product/customization.
// Remove this index if your application intentionally allows duplicate entries.
cartSchema.index(
  {
    user_id: 1,
    product_id: 1,
    "customizations.Material": 1,
    "customizations.Purity": 1,
  },
  { unique: true }
);


cartSchema.pre("validate", function () {
  if (!this.title && this.name) {
    this.title = this.name;
  }

  if (!this.name && this.title) {
    this.name = this.title;
  }
});

module.exports = mongoose.model("Cart", cartSchema);