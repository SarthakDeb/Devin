// auth.middleware.js
const jwt = require('jsonwebtoken');
const redisClient = require('../services/redis.service');

const authUser = async (req, res, next) => {
    try {
        let token;

        // Extract token from cookies
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
            console.log('Token retrieved from cookies:', token);
        }
        // Extract token from Authorization header
        else if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            console.log('Authorization Header:', authHeader);
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
                console.log('Token retrieved from Authorization header:', token);
            } else {
                console.warn('Authorization header is malformed.');
            }
        }

        // If no token found
        if (!token) {
            console.warn('No token provided');
            return res.status(401).send({ error: "Please authenticate" });
        }

        // Check if token is blacklisted
        const isBlackListed = await redisClient.get(token);
        console.log('Is token blacklisted:', isBlackListed);

        if (isBlackListed) {
            res.cookie('token', '');
            console.warn('Token is blacklisted');
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error('Authentication Error:', err.message);
        res.status(401).send({ error: "Please authenticate" });
    }
}

module.exports = authUser;