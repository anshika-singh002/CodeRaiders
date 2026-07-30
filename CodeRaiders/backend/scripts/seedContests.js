import dotenv from 'dotenv';
dotenv.config();

import { DBConnection } from '../database/users.js';
import User from '../models/User.js';
import { Problem } from '../models/Problem.js';
import { Contest } from '../models/Contest.js';

const run = async () => {
    try {
        await DBConnection();
        console.log('Connected to Database');

        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            adminUser = await User.findOne();
        }

        if (!adminUser) {
            console.error('No user found in database to set as contest creator.');
            process.exit(1);
        }

        const allProblems = await Problem.find().limit(6);
        if (allProblems.length === 0) {
            console.error('No problems found in database. Seed problems first using seedProblems.js');
            process.exit(1);
        }

        const problemIds = allProblems.map(p => p._id);
        const now = new Date();

        const sampleContests = [
            {
                title: "Code Raiders Weekly Challenge 1",
                description: "Test your speed and problem-solving skills across algorithmic challenges including array manipulations and dynamic programming.",
                startTime: new Date(now.getTime() - 30 * 60 * 1000), // Started 30 mins ago
                endTime: new Date(now.getTime() + 90 * 60 * 1000),   // Ends in 90 mins
                problems: problemIds.slice(0, 3),
                createdBy: adminUser._id
            },
            {
                title: "Raider Cup - Speed Edition",
                description: "An intense 2-hour sprint focused on quick execution, string processing, and search algorithms.",
                startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Starts in 2 days
                endTime: new Date(now.getTime() + (2 * 24 + 2) * 60 * 60 * 1000), // 2 hours long
                problems: problemIds.slice(1, 4),
                createdBy: adminUser._id
            },
            {
                title: "Beginner Battlegrounds 2026",
                description: "A friendly competition designed for newcomers to practice arrays, math logic, and basic string operations.",
                startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                endTime: new Date(now.getTime() - (7 * 24 - 3) * 60 * 60 * 1000), // Ended 6 days, 21 hours ago
                problems: problemIds.slice(0, 4),
                createdBy: adminUser._id
            }
        ];

        for (const contestData of sampleContests) {
            const existing = await Contest.findOne({ title: contestData.title });
            if (existing) {
                existing.startTime = contestData.startTime;
                existing.endTime = contestData.endTime;
                existing.problems = contestData.problems;
                existing.description = contestData.description;
                await existing.save();
                console.log(`Updated contest "${contestData.title}".`);
            } else {
                await Contest.create(contestData);
                console.log(`Created contest "${contestData.title}".`);
            }
        }

        console.log('Contest seeding finished successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding contests:', err);
        process.exit(1);
    }
};

run();
