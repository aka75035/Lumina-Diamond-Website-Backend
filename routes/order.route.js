const express = require("express");

const router = express.Router();

const {
  restrictToLoggedinUserOnly,
} = require("../middlewares/authentication");


const {
  getMyOrders,
  getOrderById,
  getTracking,
  cancelOrder,
} = require("../controllers/order.controller");

router.get(
    "/my-orders",
    restrictToLoggedinUserOnly,
    getMyOrders
);

router.get(
    "/:id",
    restrictToLoggedinUserOnly,
    getOrderById
);

router.get(
    "/:id/tracking",
    restrictToLoggedinUserOnly,
    getTracking
);

router.put(
    "/:id/cancel",
    restrictToLoggedinUserOnly,
    cancelOrder
);
module.exports = router;