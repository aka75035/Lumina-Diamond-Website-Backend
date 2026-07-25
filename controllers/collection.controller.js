const Collection = require('../models/collection');

async function listCollections(req, res) {
  try {
    const collections = await Collection.find().lean();
    return res.json(collections);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createCollection(req, res) {
  try {
    const { name, slug, image } = req.body;
    if (!name || String(name).trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    const collection = await Collection.create({ name, slug, image });
    return res.status(201).json(collection);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  listCollections,
  createCollection,
};
