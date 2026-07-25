const { Router } = require('express');
const { handleMetalDetailAddition, handleGetMetal } = require('../controllers/metalrate.controller');
const { restrictToLoggedinUserOnly } = require('../middlewares/authentication');

const router = Router();

// router.post('/insert', handleMetalDetailAddition);


router.get('/', handleGetMetal);



module.exports = router;