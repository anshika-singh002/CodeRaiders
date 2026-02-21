import express from "express"; //cuz express server using so this is the module setup, imported exress, experess is a medium to communicate etween client and server means frontend and backend
const app = express(); //made an instance of the module express called app
import { DBConnection } from './database/users.js';
import bcrypt from 'bcryptjs';
import pkg from 'jsonwebtoken';
import User from './models/User.js';
import auth from './middleware/auth.js';
import authorize from "./middleware/authorize.js";
import usersRouter from './routes/users.js';
const { sign, verify } = pkg;
import dotenv from 'dotenv';
import cors from 'cors';
import problemsRouter from './routes/problems.js';
import submissionsRouter from './routes/submissions.js';
import cookieParser from 'cookie-parser';
import executeRouter from './routes/execute.js';

dotenv.config();
DBConnection();



app.use(cors({
    origin: 'http://localhost:5173', // Must match your frontend's address
    credentials: true                  // This is essential for cookies
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/problems', problemsRouter); //Mount the router under the '/api' base path
app.use('/api/submissions', submissionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/execute', executeRouter); 


//always make a "/" route and get route its god for production
// All of your app.get() and app.post() routes come AFTER the middleware
app.get("/", (req, res) => { //http method 'get' "/" is the request and response is hello world
    res.send("Hello, world!, is coming from backend from main.js! ");
});



app.post("/register", async (req, res) => {
    try { //http method 'get' "/" is the request and response is hello world
        //get all the the data from frontend 
        const { firstname, lastname, email, password, phoneno } = req.body;//as bodyy is the frontend form of register

        //check that all the data should exist

        if (!(firstname && lastname && email && password && phoneno)) {
            return res.status(404).json("Please enter all the information");
        }
        //check if the user already exists
        //add more validations -TODO
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json("User with same email already exists");
        }

        //hashing/encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //save user in the db with default role 'user' role
        const newUser = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            phoneno,
            role: 'user' //Assignin default role
        });
        //generate a token for user and send it to the backend
        // 1. Create Access Token (short-lived)
        const accessToken = sign(
            { id: newUser._id, email: newUser.email, role: newUser.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
        );

        // 2. Create Refresh Token (long-lived)
        const refreshToken = sign(
            { id: newUser._id }, // Keep payload minimal
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
        );

        // 3. Send the Refresh Token as a secure, httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // 4. Send the Access Token and user info in the JSON response
        newUser.password = undefined; // Don't send the password hash
        res.status(201).json({ // Use 201 for resource creation
            message: 'You are successfully registered',
            accessToken: accessToken, // Send the access token
            user: {
                id: newUser._id,
                firstname: newUser.firstname,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            // Check if the error is a duplicate key error
            // The error message from MongoDB will tell you which field caused the issue.
            const field = Object.keys(error.keyValue)[0];
            const message = `A user with that ${field} already exists.`;
            return res.status(409).json({ message });
        }
        // For all other errors, send a generic internal server error.
        console.error("Registration error:", error); // Log the full error for debugging
        res.status(500).json({ message: " Internal server error during registration." });
    }
});

// Login route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please enter both email and password." });
        }

        const existingUser = await User.findOne({ email }).select('+password');
        console.log('User found:', existingUser); 
        //its better todo a combined check for userexistence and password match from generic error message

        if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }
21  


        //generate jwt token on suxxessful login 
        // ... inside your /login route, after finding the user

        // 1. Create Access Token (short-lived) using the new environment variable
        const accessToken = sign(
            { id: existingUser._id, email: existingUser.email, role: existingUser.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
        );

        // 2. Create Refresh Token (long-lived)
        const refreshToken = sign(
            { id: existingUser._id }, // Keep payload minimal for refresh token
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
        );

        // 3. Send the Refresh Token as a secure, httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // Prevents client-side JS from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            sameSite: 'strict', // Helps prevent CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        // 4. Send the Access Token and user info in the JSON response
        existingUser.password = undefined; // Don't send the password hash
        res.status(200).json({
            messae: "Login successful!",
            accessToken: accessToken, // Send the access token
            user: {
                id: existingUser._id,
                firstname: existingUser.firstname,
                email: existingUser.email,
                role: existingUser.role
            }
        });

    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
});
// REFRESH TOKEN ROUTE
// ✅ REPLACE your old /refresh-token route with this one

// REFRESH TOKEN ROUTE
// ... inside main.js

// REFRESH TOKEN ROUTE
app.post("/refresh-token", async (req, res) => { // 👈 Make the function async
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token, authorization denied." });
    }

    try {
        // Verify the refresh token to get the user's ID
        const decoded = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // 👇 THIS IS THE CRITICAL FIX: Look up the user in the database
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(403).json({ message: "User not found." });
        }

        // Create a new, COMPLETE access token with the full user payload
        const newAccessToken = sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
        );

        res.json({ accessToken: newAccessToken });

    } catch (err) {
        // This will catch errors from verify() or other issues
        console.error("Refresh token error:", err);
        return res.status(403).json({ message: "Invalid Refresh Token." });
    }
});

// ... rest of your main.js file


// If we reach here, the user is authenticated, and req.user contains their id and email
app.get("/dashboard", auth, (req, res) => {
    res.status(200).json({
        message: ` Welcome to the dshboard, ${req.user.email}!`,
        userId: req.user.id
    });
});

//protected adminonly route
app.get("/admin/users", auth, authorize(['admin']), async (req, res) => {
    try {
        //reaches here only if the user is authenticated and has the admin role
        const allUsers = await User.find().select('-password');//fetch all users but exclude their hashed passwords
        res.status(200).json({
            message: "Admin access granted: Here are all users!",
            users: allUsers
        });

    } catch (error) {
        console.error("Admin user fetch error:", error);
        res.status(500).json({ message: "Internal server error fetching users." });

    }

});







app.listen(process.env.PORT || 4000, () => { //adding default port 4000
    console.log(`Server is listening on port ${process.env.PORT || 4000}!`);
});