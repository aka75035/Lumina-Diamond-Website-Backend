const crypto = require("crypto");

const razorpay = require("../config/razorpay");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/Product");

const getUserId = (req) => req.user?._id || req.user?.id;

const safeEqual = (first, second) => {
  if (!first || !second || first.length !== second.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(first, "utf8"),
    Buffer.from(second, "utf8")
  );
};

// ==============================
// CREATE ORDER
// ==============================
exports.createOrder = async (req, res) => {
  try {
    if (!razorpay || !process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured",
      });
    }

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in first",
      });
    }

    const { shippingAddress } = req.body;

    if (!shippingAddress?.firstName || !shippingAddress?.mobile) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const cartItems = await Cart.find({
      user_id: String(userId),
    }).lean();

    if (!cartItems.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // ----------------------------------
    // Fetch all products in one query
    // ----------------------------------

    const productIds = cartItems.map((item) => item.product_id);

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    })
      .select("title images")
      .lean();

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    let subtotal = 0;
    let gstTotal = 0;

    const items = [];

    for (const item of cartItems) {
      const product = productMap.get(
        String(item.product_id)
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message:
            "A product in your cart no longer exists.",
        });
      }

      const quantity =
        Math.max(1, Number(item.quantity) || 1);

      const price =
        Number(item.salePrice) || 0;

      const gst =
        Number(item.gst) || 0;

      const itemSubtotal =
        price * quantity;

      const itemGST =
        gst * quantity;

      const itemTotal =
        itemSubtotal + itemGST;

      subtotal += itemSubtotal;
      gstTotal += Math.round(itemGST);

      items.push({
        product: item.product_id,

        title:
          item.title ||
          product.title ||
          "Product",

        image:
          item.image ||
          product.images?.[0] ||
          "",

        quantity,

        price,

        gst,

        total: itemTotal,
      });
    }

    const amount = Math.round(subtotal + gstTotal);

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart amount",
      });
    }

    const receipt = `receipt_${Date.now()}_${String(
      userId
    ).slice(-6)}`;

    const razorpayOrder =
      await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt,
      });
    
    const orderNumber = `MIA${Date.now()}`;

    const order = await Order.create({
    orderNumber,

    user: userId,

    items,

    shippingAddress,

    subtotal,

    gstTotal,

    amount,

    currency: "INR",

    receipt,

    razorpayOrderId: razorpayOrder.id,

    paymentStatus: "PENDING",

    orderStatus: "PLACED",

    tracking: [
        {
        status: "Order Placed",
        location: "Online Store",
        message: "Your order has been placed successfully.",
        },
    ],
    });

    return res.status(201).json({
      success: true,

      orderId: razorpayOrder.id,

      amount: razorpayOrder.amount,

      currency:
        razorpayOrder.currency,

      key: process.env.RAZORPAY_KEY_ID,

      dbOrderId: order._id,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create order",
    });
  }
};

// ==============================
// VERIFY PAYMENT
// ==============================
exports.verifyPayment = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured",
      });
    }

    const userId = getUserId(req);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !dbOrderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    const order = await Order.findById(dbOrderId);

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

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay order",
      });
    }

    // Prevent duplicate callback
    if (order.paymentStatus === "SUCCESS") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order,
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (
      !safeEqual(
        generatedSignature,
        razorpay_signature
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // ----------------------------
    // Update Order
    // ----------------------------

    order.paymentStatus = "SUCCESS";

    order.orderStatus = "CONFIRMED";

    order.razorpayPaymentId = razorpay_payment_id;

    order.razorpaySignature = razorpay_signature;

    order.paidAt = new Date();

    const hasPaymentSuccess = order.tracking.some(
    t => t.status === "Payment Successful"
    );

    if (!hasPaymentSuccess) {

    order.tracking.push({
        status: "Payment Successful",
        location: "Online Payment",
        message: "Payment received successfully."
    });

    order.tracking.push({
        status: "Order Confirmed",
        location: "Warehouse",
        message: "Your order has been confirmed."
    });

    }

    await order.save();

    // ----------------------------
    // Update Product Stock
    // ----------------------------

    if (order.items.length) {
      await Product.bulkWrite(
        order.items.map((item) => ({
          updateOne: {
            filter: {
              _id: item.product,
            },
            update: {
              $inc: {
                stock: -item.quantity,
              },
            },
          },
        }))
      );
    }

    // ----------------------------
    // Clear Cart
    // ----------------------------

    await Cart.deleteMany({
      user_id: String(order.user),
    });

    return res.status(200).json({
      success: true,
      message: "Payment successful",
      order,
    });
  } catch (error) {
    console.error(
      "Verify payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};

// ==============================
// PAYMENT FAILED
// ==============================
exports.paymentFailed = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { dbOrderId } = req.body;

    if (!dbOrderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findById(dbOrderId);

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

    // Don't overwrite successful payment
    if (order.paymentStatus === "PENDING") {

        order.paymentStatus = "FAILED";

        order.orderStatus = "CANCELLED";

        order.tracking.push({
            status: "Payment Failed",
            location: "Online Payment",
            message: "Payment could not be completed."
        });

        await order.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment marked as failed",
    });
  } catch (error) {
    console.error("Payment failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update payment status",
    });
  }
};

exports.razorpayWebhook = async (req, res) => {
  try {
    console.log("Webhook received");

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
    });
  }
};