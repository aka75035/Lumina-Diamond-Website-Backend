
const category = require('../models/category');
const Category = require('../models/category');
const Collection = require('../models/collection');

async function handleSignUp(req, res) {
    return res.render('signUp');
}

async function handleLogin(req, res) {
    return res.render('login');
}

async function handlelogout(req, res){
    res.clearCookie("token",{
        httpOnly: true,
        secure: true,
        sameSite: "none",
    }).status(200).json({
        success: true,
        message: "Logout successful",
    });
}

async function handleAddProduct(req, res) {
    try {
        const categories = await Category.find().lean();
        const collections = await Collection.find().lean();
        return res.render('addproduct', { categories, collections });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
}

async function handleAddCategoryPage(req, res) {
    const categories = await category.find().lean();
    const collections = await Collection.find().lean();
    
    return res.render('addcategory',{categories, collections});
}

async function handleAddCollectionPage(req, res) {
    return res.render('addcollection');
}



module.exports = {
    handleSignUp,
    handleLogin,
    handlelogout,
    handleAddProduct,
    handleAddCategoryPage,
    handleAddCollectionPage,
}