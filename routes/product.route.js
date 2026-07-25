const { Router } = require("express");

const {
    handleAddProduct,
    handleDeleteProduct,
    handleProduct,
    handleProductUpdation,
    handleGetAllProducts,
    handleFilterByCategory
} = require("../controllers/product.controller");

const {
    restrictToLoggedinUserOnly,
    restrictToAdminOnly
} = require("../middlewares/authentication");

const Product = require("../models/Product");
const Category = require("../models/category");
const Collection = require("../models/collection");

const router = Router();

/* ======================================================
    ADMIN ROUTES
====================================================== */

router.post(
    "/addproduct",
    restrictToLoggedinUserOnly,
    restrictToAdminOnly,
    handleAddProduct
);

router.get("/:id", handleProduct);

router.patch(
    "/:id",
    restrictToLoggedinUserOnly,
    restrictToAdminOnly,
    handleProductUpdation
);

router.delete(
    "/:id",
    restrictToLoggedinUserOnly,
    restrictToAdminOnly,
    handleDeleteProduct
);

/* ======================================================
    CATEGORY FILTER
====================================================== */

router.get("/category/:slug", handleFilterByCategory);

/* ======================================================
    ALL PRODUCTS
====================================================== */

router.get("/", async (req, res) => {

    try {

        const {

            category,
            collection,
            productType,
            metalType,
            purity,

            minPrice,
            maxPrice,

            featured,

            page = 1,
            limit = 20,

            sort

        } = req.query;

        const filter = {};

        /* ==========================
            CATEGORY
        ========================== */

        if (category) {

            const categories = Array.isArray(category)
                ? category
                : [category];

            const categoryDocs = await Category.find({

                slug: {

                    $in: categories

                }

            }).lean();

            filter.category = {

                $in: categoryDocs.map(item => item._id)

            };

        }

        /* ==========================
            COLLECTION
        ========================== */

        if (collection) {

            const collections = Array.isArray(collection)
                ? collection
                : [collection];

            const collectionDocs = await Collection.find({

                slug: {

                    $in: collections

                }

            }).lean();

            filter.collections = {

                $in: collectionDocs.map(item => item._id)

            };

        }

        /* ==========================
            PRODUCT TYPE
        ========================== */

        if (productType) {

            filter.productType = productType;

        }

        /* ==========================
            METAL
        ========================== */

        if (metalType) {

            filter.metalType = metalType;

        }

        /* ==========================
            PURITY
        ========================== */

        if (purity) {

            filter.purity = purity;

        }

        /* ==========================
            FEATURED
        ========================== */

        if (featured === "true") {

            filter.isFeatured = true;

        }

        /* ==========================
            PRICE
        ========================== */

        if (minPrice || maxPrice) {

            filter.salePrice = {};

            if (minPrice) {

                filter.salePrice.$gte = Number(minPrice);

            }

            if (maxPrice) {

                filter.salePrice.$lte = Number(maxPrice);

            }

        }

        /* ==========================
            QUERY
        ========================== */

        let query = Product.find(filter)

            .populate("category", "name slug")

            .populate("collections", "name slug")

            .lean();

        /* ==========================
            SORTING
        ========================== */

        switch (sort) {

            case "price-low-high":

                query = query.sort({
                    salePrice: 1
                });

                break;

            case "price-high-low":

                query = query.sort({
                    salePrice: -1
                });

                break;

            case "newest":

                query = query.sort({
                    createdAt: -1
                });

                break;

            case "oldest":

                query = query.sort({
                    createdAt: 1
                });

                break;

            case "name":

                query = query.sort({
                    title: 1
                });

                break;

            default:

                query = query.sort({
                    createdAt: -1
                });

        }

        /* ==========================
            PAGINATION
        ========================== */

        const pageNumber = Number(page);

        const limitNumber = Number(limit);

        const skip = (pageNumber - 1) * limitNumber;

        query = query.skip(skip).limit(limitNumber);

        const totalProducts =
            await Product.countDocuments(filter);

        const products = await query.lean();

        return res.json({

            success: true,

            currentPage: pageNumber,

            totalPages:
                Math.ceil(totalProducts / limitNumber),

            totalProducts,

            count: products.length,

            products

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

module.exports = router;