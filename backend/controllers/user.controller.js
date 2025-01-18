const { validationResult } = require('express-validator');
const userModel = require('../models/user.model')
const {createUser, getAllUsers} = require('../services/user.service');
const redisClient = require('../services/redis.service')
// const validationResult = require('express-validator');

const createUserController = async (req, res) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try{
        const user = await createUser(req.body);
        const token = await user.generateJWT();
        res.status(201).json({user, token});
    }
    catch(error){
        res.status(400).send(error.message);
    }
}

const loginUserController = async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try{
        const {email, password} = req.body;
        const user = await userModel.findOne({email});

        if(!user){
            res.status(400).json({message: "User is not found"});
        }
        const isMatch = await user.isValidPassword(password);

        if(!isMatch) {
            return res.status(400).json({errors: "Invalid Credentials"});
        }
        const token = await user.generateJWT();

        res.status(200).json({user, token});

    }
    catch(err){
        return res.status(400).send(err.message);

    }
}

const profileController = async(req, res)=>{
    console.log(req.user);
    
    res.status(200).json({user: req.user})
}

const logoutController = async(req,res)=>{
    try {

        const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];

        redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

        res.status(200).json({
            message: 'Logged out successfully'
        });


    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }

}

const getAllUsersController = async (req, res) => {
    try {

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUsers = await getAllUsers({ userId: loggedInUser._id });

        return res.status(200).json({
            users: allUsers
        })

    } catch (err) {

        console.log(err)

        res.status(400).json({ error: err.message })

    }
}

module.exports = { createUserController, loginUserController, profileController, logoutController, getAllUsersController };