const Cart = require("../models/cart");
const Product = require("../models/Product");

// ==============================
// GET USER CART
// ==============================
async function handleGetCart(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }

    const data = await Cart.find({
      user_id: String(id),
    }).lean().sort({ createdAt: -1 });

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch cart",
    });
  }
}

// ==============================
// GET ALL CARTS (ADMIN)
// ==============================
async function handleGetCartForAdmin(req, res) {
  try {
    const data = await Cart.find().lean().sort({
      createdAt: -1,
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch carts",
    });
  }
}

// ==============================
// ADD TO CART
// ==============================
async function handleAddtoCart(req, res) {
  try {
    const {
      user_id,
      product_id,
      customizations,
      salePrice,
      gst,
      title,
      sku,
      image,
    } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const product = await Product.findById(product_id)
      .select("_id");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingItem = await Cart.findOne({
      user_id,
      product_id,

      "customizations.Material":
        customizations?.Material || "",

      "customizations.Purity":
        customizations?.Purity || "",
    });

    if (existingItem) {

      existingItem.quantity += 1;

      await existingItem.save();

    } else {

      await Cart.create({

        user_id,

        product_id,

        title,

        sku,

        image,

        customizations,

        salePrice,

        gst,

        quantity: 1,

      });

    }

    return res.status(201).json({
      success: true,
      message: "Cart updated",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
}

// ==============================
// MERGE CART (After Login)
// ==============================
async function handleMergeCart(req, res) {
  try {
    const { id, carts } = req.body;

    if (!id || !Array.isArray(carts)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    await Cart.deleteMany({
      user_id: String(id),
    });

    if (carts.length) {
      const docs = carts.map((item) => ({
        user_id: String(id),

        product_id: item.product_id,

        title: item.title || item.name || "",

        sku: item.sku || "",

        image: item.image || "",

        quantity: Number(item.quantity) || 1,

        customizations: {
          Material:
            item.customizations?.Material || "",

          Purity:
            item.customizations?.Purity || "",
        },

        salePrice: Number(item.salePrice) || 0,

        gst: Number(item.gst) || 0,
      }));

      await Cart.insertMany(docs);
    }

    const updatedCart = await Cart.find({
      user_id: String(id),
    }).lean();

    return res.status(200).json(updatedCart);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to merge cart",
    });
  }
}

//
// NEW API
// UPDATE QUANTITY
//
async function handleUpdateCartItem(req, res) {
  try {
    const { id } = req.params;

    const { quantity } = req.body;

    const item = await Cart.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    item.quantity = Math.max(
      1,
      Number(quantity) || 1
    );

    await item.save();

    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
    });
  }
}

//
// NEW API
// DELETE CART ITEM
//
async function handleDeleteCartItem(req, res) {
  try {
    const { id } = req.params;

    await Cart.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
    });
  }
}

module.exports = {
  handleAddtoCart,
  handleGetCart,
  handleGetCartForAdmin,
  handleMergeCart,

  // NEW
  handleUpdateCartItem,
  handleDeleteCartItem,
};