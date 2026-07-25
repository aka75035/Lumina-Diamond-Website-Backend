const Order = require("../models/order");

// ==============================
// GET MY ORDERS
// ==============================
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const orders = await Order.find({
      user: userId,
    })
      .select(
        "orderNumber amount paymentStatus orderStatus createdAt tracking"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
};

// ==============================
// GET ORDER DETAILS
// ==============================
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;

    const order = await Order.findById(id).populate(
      "items.product",
      "title images slug"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(order.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order",
    });
  }
};

// ==============================
// GET TRACKING
// ==============================
exports.getTracking = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;

    const order = await Order.findById(id).select(
      "orderNumber orderStatus tracking"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(order.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      tracking: order.tracking,
    });
  } catch (error) {
    console.error("Tracking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tracking",
    });
  }
};

// ==============================
// CANCEL ORDER
// ==============================
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(order.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      order.orderStatus === "SHIPPED" ||
      order.orderStatus === "OUT_FOR_DELIVERY" ||
      order.orderStatus === "DELIVERED"
    ) {
      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled.",
      });
    }

    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Order already cancelled.",
      });
    }

    order.orderStatus = "CANCELLED";

    order.cancelledAt = new Date();

    order.tracking.push({
      status: "Cancelled",
      location: "Online Store",
      message: "Your order has been cancelled.",
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel order",
    });
  }
};