const { Router } = require('express');
const { listCategories, createCategory, getCategoryFilters } = require('../controllers/category.controller');
const { restrictToLoggedinUserOnly, restrictToAdminOnly } = require("../middlewares/authentication");

const router = Router();

router.get('/', listCategories);
router.post('/', restrictToLoggedinUserOnly, restrictToAdminOnly, createCategory);

router.get( "/filter/:slug", getCategoryFilters );

module.exports = router;
