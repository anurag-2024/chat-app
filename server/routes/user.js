const express = require('express');
const router = express.Router();
const {getUser,getUsers} = require('../controllers/userControllers');

router.post('/user',getUser);
router.get('/users',getUsers);


module.exports = router;