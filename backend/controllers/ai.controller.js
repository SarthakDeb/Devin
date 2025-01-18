const ai = require('../services/ai.service')

const getResult = async(req, res) => {
    try{
        const {prompt} = req.query;
        const result = await ai(prompt);
        res.send(result);
    }catch(err){
        res.status(400).send(err.message);
    }
}
module.exports = {getResult};