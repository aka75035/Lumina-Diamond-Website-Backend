const Category = require('../models/category');

async function listCategories(req, res) {
  try {
    const categories = await Category.find().lean();
    return res.json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createCategory(req, res) {
  try {
    const { name, slug, image, category:parentCategory, collections } = req.body;
    if (!name || String(name).trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    const category = await Category.create({ name, slug, image, parentCategory: parentCategory || null, collections });
    return res.status(201).json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}


async function getCategoryFilters(req, res) {
  try {

    const { slug } = req.params;

    const category = await Category.findOne({ slug }).populate("collections", "name slug");
    console.log(category);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const filterData = {
      collections: category.collections.map(collection => collection)
    };

    return res.status(200).json({
      success: true,
      category: category.name,
      filterData
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  listCategories,
  createCategory,
  getCategoryFilters,
};
