const { Router } = require("express");

const {
  handleAddtoCart,
  handleGetCart,
  handleMergeCart,
  handleGetCartForAdmin,
  handleUpdateCartItem,
  handleDeleteCartItem,
} = require("../controllers/cart.controller");

const {
  restrictToLoggedinUserOnly,
  restrictToAdminOnly,
  restrictToUserOnly,
} = require("../middlewares/authentication");

const router = Router();

// ==========================
// ADMIN
// ==========================
router.get(
  "/",
  restrictToLoggedinUserOnly,
  restrictToAdminOnly,
  handleGetCartForAdmin
);

// ==========================
// USER CART
// ==========================

// Get logged in user's cart
router.get(
  "/:id",
  restrictToLoggedinUserOnly,
  restrictToUserOnly,
  handleGetCart
);

// Add product to cart
router.post(
  "/",
  restrictToLoggedinUserOnly,
  restrictToUserOnly,
  handleAddtoCart
);

// Merge guest cart
router.post(
  "/merge",
  restrictToLoggedinUserOnly,
  restrictToUserOnly,
  handleMergeCart
);

// Update quantity
router.put(
  "/:id",
  restrictToLoggedinUserOnly,
  restrictToUserOnly,
  handleUpdateCartItem
);

// Delete cart item
router.delete(
  "/:id",
  restrictToLoggedinUserOnly,
  restrictToUserOnly,
  handleDeleteCartItem
);

module.exports = router;