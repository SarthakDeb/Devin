const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength:[6, 'Email must be 6 Characters long'],
    },
    password: {
        type: String,
    }

})

userSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password, 10)
}

userSchema.methods.isValidPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT = function(){
    return jwt.sign({email: this.email}, process.env.JWT_SECRET, {expiresIn: '24h'});
}

const User = mongoose.model('user', userSchema);

module.exports = User;