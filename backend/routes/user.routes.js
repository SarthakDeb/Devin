const express = require('express')
const {createUserController, loginUserController, profileController, logoutController, getAllUsersController} = require('../controllers/user.controller')
const { body } = require('express-validator')
const authUser = require('../middleware/auth.middleware')

const router = express.Router();

router.post('/register',
    body('email').isEmail().withMessage("Email must be a valid email"),
    body('password').isLength({min:6}).withMessage("Password must be 6 characters long"),
    createUserController);

router.post('/login',
    body('email').isEmail().withMessage("Email must be a valid email"),
    body('password').isLength({min:6}).withMessage("Password must be 6 characters long"),
    loginUserController);

router.get('/profile', authUser, profileController);

router.get('/logout', authUser, logoutController );

router.get('/all', authUser, getAllUsersController);

module.exports = router;