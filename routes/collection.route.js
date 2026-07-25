const { Router } = require('express');
const { listCollections, createCollection } = require('../controllers/collection.controller');
const { restrictToLoggedinUserOnly, restrictToAdminOnly } = require("../middlewares/authentication");

const router = Router();

router.get('/', listCollections);
router.post('/', restrictToLoggedinUserOnly, restrictToAdminOnly, createCollection);

module.exports = router;
