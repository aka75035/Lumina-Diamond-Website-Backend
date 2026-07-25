const Product = require("../models/Product");
const Category = require("../models/category");
const Collection = require("../models/collection");

const slugify = require("slugify");

/* ==========================================================
    HELPER FUNCTIONS
========================================================== */

async function generateUniqueSlug(title) {

    const baseSlug = slugify(title, {
        lower: true,
        strict: true,
        trim: true
    });

    let slug = baseSlug;
    let counter = 1;

    while (await Product.exists({ slug })) {
        slug = `${baseSlug}-${counter++}`;
    }

    return slug;
}

function toArray(value) {

    if (!value) return [];

    return Array.isArray(value) ? value : [value];

}

/* ==========================================================
    BUILD SPECIFICATIONS
========================================================== */

function buildSpecifications(keys, values) {

    const specifications = {};

    if (!keys) return specifications;

    const keyArray = toArray(keys);
    const valueArray = toArray(values);

    keyArray.forEach((key, index) => {

        if (!key || !key.trim()) return;

        specifications[key.trim()] = valueArray[index]
            ? valueArray[index].trim()
            : "";

    });

    return specifications;

}

/* ==========================================================
    BUILD STONE ARRAY
========================================================== */

function buildStoneArray(body) {

    const types = toArray(body.stoneType);
    const shapes = toArray(body.stoneShape);
    const weights = toArray(body.stoneWeight);
    const prices = toArray(body.stonePrice);
    const colors = toArray(body.stoneColor);
    const clarities = toArray(body.stoneClarity);
    const quantities = toArray(body.stoneQuantity);
    const sizeRanges = toArray(body.stoneSizeRange);
    const pricingTypes = toArray(body.stonePricingType);

    return types

        .map((type, index) => ({

            type: type?.trim(),

            shape: shapes[index]?.trim() || "",

            weight: Number(weights[index]) || 0,

            price: Number(prices[index]) || 0,

            color: colors[index]?.trim() || "",

            clarity: clarities[index]?.trim() || "",

            quantity: Number(quantities[index]) || 1,

            sizeRange: sizeRanges[index]?.trim() || "",
            pricingType:
                ["fixed", "perCarat"].includes(pricingTypes[index])
                    ? pricingTypes[index]
                    : "fixed",
            }))

        .filter(stone => stone.type);

}

/* ==========================================================
    FORMAT CUSTOMIZATION FIELDS
========================================================== */

function buildCustomizationFields(customizationFields) {

    if (!customizationFields) return [];

    const fields = Array.isArray(customizationFields)
        ? customizationFields
        : Object.values(customizationFields);

    return fields

        .filter(field => field.name?.trim())

        .map(field => ({

            name: field.name.trim(),

            label: field.label?.trim() || "",

            type: field.type || "text",

            placeholder: field.placeholder?.trim() || "",

            required: field.required === "on" || field.required === true,

            options: field.options
                ? field.options
                    .split(",")
                    .map(option => option.trim())
                    .filter(Boolean)
                : [],

            dependsOn: {

                field: field.dependsOn?.field || "",

                value: field.dependsOn?.value || ""

            }

        }));

}

/* ==========================================================
    FORMAT IMAGE ARRAY
========================================================== */

function buildImageArray(images) {

    return toArray(images)
        .map(img => img.trim())
        .filter(Boolean);

}

/* ==========================================================
    FORMAT VIDEO ARRAY
========================================================== */

function buildVideoArray(videos) {

    return toArray(videos)
        .map(video => video.trim())
        .filter(Boolean);

}

/* ==========================================================
    FORMAT SEO KEYWORDS
========================================================== */

function buildSeoKeywords(seoKeywords) {

    if (!seoKeywords) return [];

    return seoKeywords
        .split(",")
        .map(keyword => keyword.trim())
        .filter(Boolean);

}

/* ==========================================================
    BUILD PRICING
========================================================== */

function buildPricing(body) {

    const allowedModes = [
        "dynamic",
        "manual",
        "fixed"
    ];

    return {

        mode: allowedModes.includes(body.pricingMode)
            ? body.pricingMode
            : "dynamic",

        fixedPrice: Number(body.fixedPrice) || 0,

        dynamicMetal:
            body.dynamicMetal === "on",

        dynamicStone:
            body.dynamicStone === "on",

        dynamicMakingCharges:
            body.dynamicMakingCharges === "on"

    };

}

/* ==========================================================
    BUILD MAKING CHARGES
========================================================== */

function buildMakingCharges(body) {

    const allowedTypes = [
        "fixed",
        "perGram",
        "percentage"
    ];

    return {

        value:
            Number(body.makingChargesValue) || 0,

        type:
            allowedTypes.includes(body.makingChargesType)
                ? body.makingChargesType
                : "fixed"

    };

}

/* ==========================================================
    HANDLE ADD PRODUCT
========================================================== */



async function handleAddProduct(req, res) {

    try {

        const {

            title,
            sku,
            productType,

            mrp,
            salePrice,
            stock,

            productWeight,
            metalWeight,
            metalType,
            purity,

            shortDescription,
            description,

            category,
            collections,

            images,
            videos,

            specificationKey,
            specificationValue,

            seoTitle,
            seoDescription,
            seoKeywords,

            isFeatured,
            isActive,

            customizationFields

        } = req.body;

        /* ==========================================
            GENERATE SLUG
        ========================================== */

        const slug = await generateUniqueSlug(title);

        /* ==========================================
            FORMAT DATA
        ========================================== */

        const formattedImages = buildImageArray(images);

        const formattedVideos = buildVideoArray(videos);

        const stones = buildStoneArray(req.body);

        const specifications = buildSpecifications(
            specificationKey,
            specificationValue
        );

        const formattedCustomizationFields =
            buildCustomizationFields(customizationFields);

        const formattedSeoKeywords =
            buildSeoKeywords(seoKeywords);

        const pricing =
            buildPricing(req.body);

        const makingCharges =
            buildMakingCharges(req.body);

        /* ==========================================
            CREATE PRODUCT
        ========================================== */

        const product = await Product.create({

            // Basic

            title: title.trim(),

            slug,

            sku: sku.trim(),

            productType,

            // Pricing

            pricing,

            mrp: Number(mrp) || 0,

            salePrice: Number(salePrice) || 0,

            stock: Number(stock) || 0,

            makingCharges,

            // Metal

            metalType,

            purity,

            metalWeight: Number(metalWeight) || 0,

            productWeight: Number(productWeight) || 0,

            // Description

            shortDescription: shortDescription?.trim() || "",

            description: description?.trim() || "",

            // Media

            images: formattedImages,

            videos: formattedVideos,

            // Category

            category,

            collections: toArray(collections),

            // Stones

            stones,

            // Specifications

            specifications,

            // Customization

            customizationFields: formattedCustomizationFields,

            // SEO

            seoTitle: seoTitle?.trim() || "",

            seoDescription: seoDescription?.trim() || "",

            seoKeywords: formattedSeoKeywords,

            // Status

            isFeatured: isFeatured === "on",

            isActive:
                isActive === undefined
                    ? true
                    : isActive === "on"

        });

        console.log(
            `Product created successfully: ${product.title}`
        );

        return res.redirect("/");

    }

    catch (error) {

        console.error("Error creating product:", error);

        return res.status(500).send(error.message);

    }

}

/* ==========================================================
    DELETE PRODUCT
========================================================== */

async function handleDeleteProduct(req, res) {

    try {

        console.log("DELETE ROUTE HIT");

        const product = await Product.findById(req.params.id);

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }

        await Product.findByIdAndDelete(req.params.id);

        return res.json({
            success: true,
            message: "Product deleted successfully"
        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

/* ==========================================================
    UPDATE PRODUCT
========================================================== */

async function handleProductUpdation(req, res) {

    try {

        const {

            title,
            sku,
            productType,

            mrp,
            salePrice,
            stock,

            productWeight,
            metalWeight,
            metalType,
            purity,

            shortDescription,
            description,

            category,
            collections,

            images,
            videos,

            specificationKey,
            specificationValue,

            seoTitle,
            seoDescription,
            seoKeywords,

            isFeatured,
            isActive,

            customizationFields

        } = req.body;

        const existingProduct = await Product.findById(req.params.id);

        if (!existingProduct) {

            return res.status(404).send("Product not found");

        }

        /* ==========================================
            GENERATE NEW SLUG IF TITLE CHANGED
        ========================================== */

        let slug = existingProduct.slug;

        if (title.trim() !== existingProduct.title) {

            slug = await generateUniqueSlug(title);

        }

        /* ==========================================
            FORMAT DATA
        ========================================== */

        const formattedImages = buildImageArray(images);

        const formattedVideos = buildVideoArray(videos);

        const stones = buildStoneArray(req.body);

        const specifications = buildSpecifications(
            specificationKey,
            specificationValue
        );

        const formattedCustomizationFields =
            buildCustomizationFields(customizationFields);

        const formattedSeoKeywords =
            buildSeoKeywords(seoKeywords);

        const pricing =
            buildPricing(req.body);

        const makingCharges =
            buildMakingCharges(req.body);

        /* ==========================================
            UPDATE PRODUCT
        ========================================== */

        const updatedProduct = await Product.findByIdAndUpdate(

            req.params.id,

            {

                // Basic

                title: title.trim(),

                slug,

                sku: sku.trim(),

                productType,

                // Pricing

                pricing,

                mrp: Number(mrp) || 0,

                salePrice: Number(salePrice) || 0,

                stock: Number(stock) || 0,

                makingCharges,

                // Metal

                metalType,

                purity,

                metalWeight: Number(metalWeight) || 0,

                productWeight: Number(productWeight) || 0,

                // Description

                shortDescription: shortDescription?.trim() || "",

                description: description?.trim() || "",

                // Media

                images: formattedImages,

                videos: formattedVideos,

                // Category

                category,

                collections: toArray(collections),

                // Stones

                stones,

                // Specifications

                specifications,

                // Customization

                customizationFields: formattedCustomizationFields,

                // SEO

                seoTitle: seoTitle?.trim() || "",

                seoDescription: seoDescription?.trim() || "",

                seoKeywords: formattedSeoKeywords,

                // Status

                isFeatured: isFeatured === "on",

                isActive:
                    isActive === undefined
                        ? true
                        : isActive === "on"

            },

            {

                new: true,

                runValidators: true

            }

        );

        console.log(
            `Product updated successfully: ${updatedProduct.title}`
        );

        return res.redirect("/");

    }

    catch (error) {

        console.error("Error updating product:", error);

        return res.status(500).send(error.message);

    }

}

/* ==========================================================
    EDIT PRODUCT PAGE
========================================================== */

async function handleProduct(req, res) {

    try {

        const categories = await Category.find().lean();

        const collections = await Collection.find().lean();

        const product = await Product.findById(req.params.id)
            .populate("category")
            .populate("collections")
            .lean();

        if (!product) {

            return res.status(404).send("Product not found");

        }

        return res.render("editproduct", {

            product,
            categories,
            collections

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).send(error.message);

    }

}

/* ==========================================================
    GET ALL PRODUCTS
========================================================== */

async function handleGetAllProducts(req, res) {

    try {

        const products = await Product.find()
            .populate("category", "name slug")
            .populate("collections", "name slug")
            .lean();

        return res.json(products);

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

/* ==========================================================
    FILTER PRODUCTS
========================================================== */

async function handleFilterByCategory(req, res) {

    try {

        const { slug } = req.params;

        const category = await Category.findOne({ slug });

        if (!category) {

            return res.status(404).json({

                success: false,

                message: "Category not found"

            });

        }

        const filter = {

            category: category._id,

            isActive: true

        };

        /* -----------------------------
            Collections
        ------------------------------ */

        const collections = toArray(req.query.collections);

        if (collections.length > 0) {

            const collectionDocs = await Collection.find({

                slug: { $in: collections }

            }).lean();

            filter.collections = {

                $in: collectionDocs.map(item => item._id)

            };

        }

        /* -----------------------------
            Purity
        ------------------------------ */

        const purity = toArray(req.query.purity);

        if (purity.length > 0) {

            filter.purity = {

                $in: purity

            };

        }

        /* -----------------------------
            Metal Type
        ------------------------------ */

        const metalTypes = toArray(req.query.metalType);

        if (metalTypes.length > 0) {

            filter.metalType = {

                $in: metalTypes

            };

        }

        /* -----------------------------
            Product Type
        ------------------------------ */

        const productTypes = toArray(req.query.productType);

        if (productTypes.length > 0) {

            filter.productType = {

                $in: productTypes

            };

        }

        /* -----------------------------
            Featured
        ------------------------------ */

        if (req.query.featured === "true") {

            filter.isFeatured = true;

        }

        /* -----------------------------
            Price
        ------------------------------ */

        if (req.query.minPrice || req.query.maxPrice) {

            filter.salePrice = {};

            if (req.query.minPrice) {

                filter.salePrice.$gte =
                    Number(req.query.minPrice);

            }

            if (req.query.maxPrice) {

                filter.salePrice.$lte =
                    Number(req.query.maxPrice);

            }

        }

        /* -----------------------------
            Sorting
        ------------------------------ */

        let sort = {};

        switch (req.query.sort) {

            case "price_low":

                sort.salePrice = 1;

                break;

            case "price_high":

                sort.salePrice = -1;

                break;

            case "latest":

                sort.createdAt = -1;

                break;

            case "oldest":

                sort.createdAt = 1;

                break;

            case "name":

                sort.title = 1;

                break;

            default:

                sort.createdAt = -1;

        }

        /* -----------------------------
            Pagination
        ------------------------------ */

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 20;

        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments(filter);

        const products = await Product.find(filter)

            .populate("category")

            .populate("collections")

            .sort(sort)

            .skip(skip)

            .limit(limit)

            .lean();

        return res.status(200).json({

            success: true,

            count: products.length,

            totalProducts,

            totalPages: Math.ceil(totalProducts / limit),

            currentPage: page,

            products

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

/* ==========================================================
    EXPORTS
========================================================== */

module.exports = {

    handleAddProduct,

    handleDeleteProduct,

    handleProductUpdation,

    handleProduct,

    handleGetAllProducts,

    handleFilterByCategory

};