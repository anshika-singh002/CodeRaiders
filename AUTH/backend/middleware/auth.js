import pkg from 'jsonwebtoken';
const { verify } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const auth = (req, res, next) => {
    console.log(`\n--- AUTH MIDDLEWARE CHECK for ${req.method} ${req.path} ---`);
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ Auth failed: Header is missing or doesn\'t start with "Bearer ".');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Received Token:', token.substring(0, 20) + '...'); // Log first 20 chars

    try {
        console.log('Verifying with Secret:', process.env.ACCESS_TOKEN_SECRET ? `"${process.env.ACCESS_TOKEN_SECRET.substring(0, 10)}..."` : '!!! SECRET IS UNDEFINED !!!');
        
        const decoded = verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('✅ Token verified successfully. Payload:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        // THIS IS THE MOST IMPORTANT LOG
        console.error('❌ TOKEN VERIFICATION FAILED:', err.message); 
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export default auth;

