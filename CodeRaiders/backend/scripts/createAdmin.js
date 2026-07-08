import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { DBConnection } from '../database/users.js';
import User from '../models/User.js';

const args = process.argv.slice(2);

if (args.length < 2) {
    console.log('Usage: node backend/scripts/createAdmin.js <email> <password> [firstname] [lastname] [phoneno]');
    process.exit(1);
}

const [email, password, firstname = 'Admin', lastname = 'User', phoneno] = args;

const run = async () => {
    try {
        await DBConnection();
        console.log('Connected to DB');

        const hashed = await bcrypt.hash(password, 10);

        const existing = await User.findOne({ email }).select('+password');
        if (existing) {
            existing.role = 'admin';
            existing.password = hashed;
            if (phoneno) {
                existing.phoneno = phoneno;
            }
            await existing.save();
            console.log(`Promoted existing user ${email} to admin and updated password.`);
        } else {
            const newUser = await User.create({
                firstname,
                lastname,
                email,
                password: hashed,
                phoneno,
                role: 'admin'
            });
            console.log(`Created new admin user: ${email} (id: ${newUser._id})`);
        }

        console.log('Done. You can now login with the provided credentials.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating/promoting admin:', err);
        process.exit(1);
    }
};

run();
