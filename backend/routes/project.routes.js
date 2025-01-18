const express = require('express');
const {body} = require('express-validator')
const {createProjectController, getAllProjectsController,addUserToProjectController, getProjectByIdController} = require('../controllers/project.controller')
const authMiddleware = require('../middleware/auth.middleware')

const router = express.Router();

router.post('/create', 
    authMiddleware,
    body('name').isString().withMessage("name is required"),
    createProjectController
)

router.get('/all', authMiddleware, getAllProjectsController)

router.put('/add_users', authMiddleware, addUserToProjectController)

router.get('/get-project/:projectId', authMiddleware, getProjectByIdController)

module.exports = router;