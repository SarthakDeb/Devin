const projectModel = require('../models/project.model');
const userModel = require('../models/user.model');
const {createProject, getAllProjectByUserId, addUsersToProject, getProjectById} = require('../services/project.service');
const {validationResult} = require('express-validator');

const createProjectController = async (req, res) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.status(400).json({errors: errors.array()});
    }
    try{
        const {name} = req.body;
        const loggedInUser = await userModel.findOne({email: req.user.email});
        const userId = loggedInUser._id;

        const newProject = await createProject({name, userId});

        res.status(201).json(newProject);
    }catch(err){
        res.status(400).send(err.message);
    }
}

const getAllProjectsController = async (req,res) =>{
    try{
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUserProjects = await 
        getAllProjectByUserId({userId: loggedInUser._id})

        res.status(200).json({projects: allUserProjects})

    }catch(err){
        res.status(404).send(err.message);
    }
}
const addUserToProjectController = async (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try{
        const{projectId, users} = req.body
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const project = await addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })
        return res.status(200).json({project})

    }catch(err){
        res.status(400).json({error: err.message})
    }
}
const getProjectByIdController = async (req, res) =>{
    const {projectId} = req.params;
    try{
    const project = await getProjectById({projectId});
    return res.status(200).json({project});
    }catch(err){
        res.status(400).send(err.message);
    }
}

module.exports = {createProjectController, getAllProjectsController, addUserToProjectController, getProjectByIdController};
