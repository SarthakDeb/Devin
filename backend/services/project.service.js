const projectModel = require('../models/project.model');

const createProject = async({name, userId}) =>{
    if(!name){
        throw new Error('Name is required');
    }
    if(!userId){
        throw new Error('User id required');
    }

    const project = await projectModel.create({
        name,
        users: [userId]
    })
    return project;
}

const getAllProjectByUserId = async ({userId})=>{
    if(!userId){
        throw new Error('UserId is required')
    }
    const allUserProjects = await projectModel.find({users: userId})
    return allUserProjects;
}

const addUsersToProject = async ({projectId, users, userId}) =>{
    if(!projectId){
        throw new Error('ProjectId is required')
    }
    if(!users){
        throw new Error('Users is required')
    }
    if(!userId){
        throw new Error('UserId is required')
    }
    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })
    if(!project){
        throw new Error('User does not belong to the project')
    }
    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId},{
            $addToSet: {
                users:{
                    $each:users
                }
            }
        },{
        new: true 
    })
    return updatedProject;

}
const getProjectById = async ({projectId}) =>{
    if(!projectId){
        throw new Error('ProjectId is required')
    }
    const project = await projectModel.findOne({_id: projectId}).populate('users')
    return project;
}

module.exports = {createProject, getAllProjectByUserId, addUsersToProject, getProjectById};