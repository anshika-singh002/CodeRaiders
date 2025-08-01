import mongoose from 'mongoose'; //layer b/wmongodb and express
import dotenv from 'dotenv'; // as mongodb.url is sensitiveso we need to secure it a lil
dotenv.config();

const DBConnection = async () => {
    const MONGOO_URL = process.env.MONGODB_URL; //mongodburl is sensitvive to secure it we use process.env


    try {
        await mongoose.connect(MONGOO_URL); //mongoose is helping us to connect to mongodb
    } catch (error) {
        console.log("Error while conecting the DB", error);
    }

};

export { DBConnection};