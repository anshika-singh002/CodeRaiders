import pkg from 'jsonwebtoken';
const {verify} = pkg;
import dotenv from 'dotenv';
dotenv.config(); //this is called because we depend on .env for secret key

const auth = (req, res, next)=>{
    //get token from header( usually "bearer token ")

    const token = req.header('Authorization')?.replace('Bearer','');

    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied'});
    }

    try{
        //verify token 
        const decoded =verify(token, process.env.SECRET_KEY);

        //Attach user information from the token payload to the required object
        req.user = decoded;
        next(); //call next middleware/route handler
    } catch(err){
        //log the error for debugging purposes (optional in production, user a logger)
        console.error('Token verification failed:',err);
        res.status(401),json({message: 'Token is not valid'});
    }
};

export default auth;