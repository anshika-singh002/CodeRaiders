import express from "express"; //cuz express server using so this is the module setup, imported exress, experess is a medium to communicate etween client and server means frontend and backend
const app = express(); //made an instance of the module express called app
import { DBConnection } from './database/users.js';
import bcrypt from 'bcryptjs';
import pkg from 'jsonwebtoken';
import User from './models/User.js';
import auth from './middleware/auth.js';
import authorize from "./middleware/authorize.js";
const { sign, verify } = pkg;
import dotenv from 'dotenv';
dotenv.config();

DBConnection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//always make a "/" route and get route its god for production
app.get("/", (req, res) => { //http method 'get' "/" is the request and response is hello world
    res.send("Hello, world!, is coming from backend from main.js! ");
});

// app.get("/register", (req,res)=>{ //http method 'get' "/" is the request and response is hello world
//     res.send("<h1>register page!</h1>");
// });


app.post("/register", async (req, res) => {
    try { //http method 'get' "/" is the request and response is hello world
        //get all the the data from frontend 
        const { firstname, lastname, email, password, phoneno } = req.body;//as bodyy is the frontend form of register

        //check that all the data should exist

        if (!(firstname && lastname && email && password && phoneno)) {
            return res.status(404).send("Please enter all the information");
        }
        //check if the user already exists
        //add more validations -TODO
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User with same email already exists");
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
        const token = sign(
            { id: newUser._id, email },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );
        newUser.token = token;
        newUser.password = undefined; //notseding pasword hashback

        res.status(201).json({ // Use 201 for resource creation
            message: 'You are successfully registered',
            token: token,
            user: {
                id: newUser._id,
                firstname: newUser.firstname,
                email: newUser.email,
                role: newUser.role // Send the role back
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error during registration." });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Please enter both email and password.");
        }

        const existingUser = await User.findOne({ email });

        //its better todo a combined check for userexistence and password match from generic error message

        if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }



        //generate jwt token on suxxessful login 
        const token = sign(
            { id: existingUser._id, email: existingUser.email },//ERROR POTENTIAL
            process.env.SECRET_KEY, //ensuring this env variable is set
            { expiresIn: '2h' } // token expires in 2 hrs
        );

        existingUser.password = undefined; //not sending the password hashback
        // Successful login – redirect or show dashboard
        res.status(200).json({
            messae: "Login successful!",
            token: token,
            user: { // send some user details back (excluding sesitive info)}
                id: existingUser._id,
                firstname: existingUser.firstname,
                lastname: existingUser.lastname,
                email: existingUser.email,
                role: existingUser.role
            }
        });

    } catch (error) {
        console.error("Login error:", error); //logging the detiled error on server sidde
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
});

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