
const {Router} = require("express");
const {handleSignUp, handleLogin, handlelogout, handleAddProduct, handleAddCategoryPage, handleAddCollectionPage} = require('../controllers/static.controller');
const { restrictToLoggedinUserOnly, restrictToAdminOnly, restrictToUserOnly } = require("../middlewares/authentication");
const product = require("../models/Product");
const metalRates = require('../models/metalrate');
const Users = require("../models/users");
const router = Router();

router.get('/signup', handleSignUp);
router.get('/login', handleLogin);
router.get('/logout', handlelogout);
router.get('/addproduct', restrictToLoggedinUserOnly, restrictToAdminOnly, handleAddProduct);
router.get('/addcategory', restrictToLoggedinUserOnly, restrictToAdminOnly, handleAddCategoryPage);
router.get('/addcollection', restrictToLoggedinUserOnly, restrictToAdminOnly, handleAddCollectionPage);


router.get('/profile', restrictToLoggedinUserOnly, async (req, res)=>{
    console.log("PROFILE ROUTE HIT");
    const _id = req.user._id;
    return res.json(req.user);
});

router.get('/', restrictToLoggedinUserOnly, restrictToAdminOnly, async (req, res)=>{
    const products = await product.find().lean();
    const allMetalsRates = await metalRates.find().lean();
    return res.render("home",{products, allMetalsRates})
});

module.exports = router;