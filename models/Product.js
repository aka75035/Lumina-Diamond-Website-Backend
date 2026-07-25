const mongoose = require("mongoose");

/* ============================================================
   CUSTOMIZATION FIELD SCHEMA
============================================================ */

const customizationFieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["select", "text", "number", "checkbox", "radio"],
      required: true,
    },

    options: {
      type: [String],
      default: [],
    },

    required: {
      type: Boolean,
      default: false,
    },

    placeholder: {
      type: String,
      default: "",
    },

    dependsOn: {
      field: String,
      value: String,
    },
  },
  { _id: false }
);

/* ============================================================
   STONE SCHEMA
============================================================ */

const stoneSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "",
    },

    shape: {
      type: String,
      default: "",
    },

    weight: {
      type: Number,
      default: 0,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    price: {
      type: Number,
      default: 0,
    },

    pricingType: {
      type: String,
      enum: ["fixed", "perCarat"],
      default: "fixed",
    },

    color: {
      type: String,
      default: "",
    },

    clarity: {
      type: String,
      default: "",
    },

    sizeRange: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

/* ============================================================
   PRODUCT SCHEMA
============================================================ */

const productSchema = new mongoose.Schema(
  {
    // =========================================================
    // BASIC INFORMATION
    // =========================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    // =========================================================
    // PRODUCT TYPE
    // =========================================================

    productType: {
      type: String,
      enum: [
        "Ring",
        "Pendant",
        "Chain",
        "Necklace",
        "Bracelet",
        "Bangle",
        "Earrings",
        "Coin",
        "Loose Diamond",
        "Gemstone",
        "Mangalsutra",
        "Nose Pin",
        "Anklet",
        "Other",
      ],
      required: true,
    },

    // =========================================================
    // CATEGORY
    // =========================================================

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],

    // =========================================================
    // PRICING
    // =========================================================

    pricing: {
      mode: {
        type: String,
        enum: ["dynamic", "manual", "fixed"],
        default: "dynamic",
      },

      fixedPrice: {
        type: Number,
        default: 0,
      },

      dynamicMetal: {
        type: Boolean,
        default: true,
      },

      dynamicStone: {
        type: Boolean,
        default: false,
      },

      dynamicMakingCharges: {
        type: Boolean,
        default: false,
      },
    },

    mrp: {
      type: Number,
      required: true,
      default: 0,
    },

    salePrice: {
      type: Number,
      required: true,
      default: 0,
    },

    makingCharges: {
      value: {
        type: Number,
        default: 0,
      },

      type: {
        type: String,
        enum: ["fixed", "perGram", "percentage"],
        default: "fixed",
      },
    },

    // =========================================================
    // STOCK
    // =========================================================

    stock: {
      type: Number,
      default: 0,
    },

    // =========================================================
    // MEDIA
    // =========================================================

    images: {
      type: [String],
      default: [],
    },

    videos: {
      type: [String],
      default: [],
    },

    // =========================================================
    // METAL
    // =========================================================

    metalType: {
      type: String,
      default: "",
    },

    purity: {
      type: String,
      enum: ["24K", "22K", "18K", "14K", "999", "925"],
    },

    metalWeight: {
      type: Number,
      default: 0,
    },

    productWeight: {
      type: Number,
      default: 0,
    },

    // =========================================================
    // STONES
    // =========================================================

    stones: {
      type: [stoneSchema],
      default: [],
    },
        // =========================================================
    // SPECIFICATIONS
    // =========================================================

    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // =========================================================
    // CUSTOMIZATION
    // =========================================================

    customizationFields: {
      type: [customizationFieldSchema],
      default: [],
    },

    // =========================================================
    // SEO
    // =========================================================

    seoTitle: {
      type: String,
      default: "",
      trim: true,
    },

    seoDescription: {
      type: String,
      default: "",
      trim: true,
    },

    seoKeywords: {
      type: [String],
      default: [],
    },

    // =========================================================
    // STATUS
    // =========================================================

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);