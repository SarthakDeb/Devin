const mongoose = require('mongoose');

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.DB_URI);
        console.log("DB is connected");
    }
    catch(err){
        console.log(err, "Error while connecting the DB")
    }
}
module.exports = connectDB;