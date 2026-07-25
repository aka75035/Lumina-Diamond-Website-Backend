const {Router} = require("express");
const { handleSignUp, handleLogin, handleDetailChange } = require('../controllers/user');
const { restrictToLoggedinUserOnly, restrictToAdminOnly } = require("../middlewares/authentication");
const router = Router();


router.post("/signup", handleSignUp);
router.post("/login", handleLogin);
router.put("/update", restrictToLoggedinUserOnly, handleDetailChange);


module.exports = router;