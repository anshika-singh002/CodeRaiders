import dotenv from 'dotenv';
dotenv.config();

import { DBConnection } from '../database/users.js';
import User from '../models/User.js';
import { Problem } from '../models/Problem.js';

const sampleProblems = [
    {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        difficulty: "Easy",
        tags: ["Array", "Hash Table"],
        testCases: [
            { input: "[2,7,11,15]\n9", output: "[0,1]" },
            { input: "[3,2,4]\n6", output: "[1,2]" },
            { input: "[3,3]\n6", output: "[0,1]" },
            { input: "[-1,-2,-3,-4,-5]\n-8", output: "[2,4]" },
            { input: "[0,4,3,0]\n0", output: "[0,3]" },
            { input: "[10,20,30,40,50]\n90", output: "[3,4]" }
        ]
    },
    {
        title: "Palindrome Number",
        description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise. An integer is a palindrome when it reads the same backward as forward (e.g., 121 is palindrome, while 123 is not).",
        difficulty: "Easy",
        tags: ["Math"],
        testCases: [
            { input: "121", output: "true" },
            { input: "-121", output: "false" },
            { input: "10", output: "false" },
            { input: "0", output: "true" },
            { input: "12321", output: "true" },
            { input: "123321", output: "true" },
            { input: "1000021", output: "false" }
        ]
    },
    {
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters `s`.",
        difficulty: "Easy",
        tags: ["Two Pointers", "String"],
        testCases: [
            { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
            { input: '["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
            { input: '["a"]', output: '["a"]' },
            { input: '["A"," ","b","o","y"]', output: '["y","o","b"," ","A"]' }
        ]
    },
    {
        title: "Fibonacci Number",
        description: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. F(0) = 0, F(1) = 1. Given n, calculate F(n).",
        difficulty: "Easy",
        tags: ["Math", "Dynamic Programming", "Recursion"],
        testCases: [
            { input: "0", output: "0" },
            { input: "1", output: "1" },
            { input: "2", output: "1" },
            { input: "3", output: "2" },
            { input: "4", output: "3" },
            { input: "10", output: "55" },
            { input: "20", output: "6765" }
        ]
    },
    {
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string `s`, find the length of the longest substring without repeating characters.",
        difficulty: "Medium",
        tags: ["Hash Table", "String", "Sliding Window"],
        testCases: [
            { input: '"abcabcbb"', output: "3" },
            { input: '"bbbbb"', output: "1" },
            { input: '"pwwkew"', output: "3" },
            { input: '""', output: "0" },
            { input: '" "', output: "1" },
            { input: '"au"', output: "2" },
            { input: '"dvdf"', output: "3" }
        ]
    },
    {
        title: "Binary Search",
        description: "Given a sorted array of integers `nums` and a target value `target`, return the index of `target` if it is present, otherwise return -1. Implement an efficient binary search algorithm.",
        difficulty: "Easy",
        tags: ["Array", "Binary Search"],
        testCases: [
            { input: "[-1,0,3,5,9,12]\n9", output: "4" },
            { input: "[-1,0,3,5,9,12]\n2", output: "-1" },
            { input: "[5]\n5", output: "0" },
            { input: "[5]\n-5", output: "-1" },
            { input: "[1,2,3,4,5,6,7,8,9,10]\n1", output: "0" },
            { input: "[1,2,3,4,5,6,7,8,9,10]\n10", output: "9" }
        ]
    },
    {
        title: "Merge Intervals",
        description: "Given an array of intervals where each interval is represented as [start, end], merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        difficulty: "Medium",
        tags: ["Array", "Sorting"],
        testCases: [
            { input: "[[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" },
            { input: "[[1,4],[4,5]]", output: "[[1,5]]" },
            { input: "[[1,4],[0,4]]", output: "[[0,4]]" },
            { input: "[[1,4],[2,3]]", output: "[[1,4]]" },
            { input: "[[1,4],[0,2],[3,5]]", output: "[[0,5]]" }
        ]
    },
    {
        title: "Add Two Numbers",
        description: "Given two integers `a` and `b`, return their sum `a + b`. Useful for testing basic input and output execution in the compiler.",
        difficulty: "Easy",
        tags: ["Math", "Basic"],
        testCases: [
            { input: "2 3", output: "5" },
            { input: "10 20", output: "30" },
            { input: "-5 15", output: "10" },
            { input: "0 0", output: "0" },
            { input: "-100 -200", output: "-300" },
            { input: "999999 1", output: "1000000" }
        ]
    },
    {
        title: "Valid Parentheses",
        description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, and open brackets are closed in the correct order.",
        difficulty: "Easy",
        tags: ["String", "Stack"],
        testCases: [
            { input: '"()"', output: "true" },
            { input: '"(]"', output: "false" },
            { input: '"{[]}"', output: "true" },
            { input: '"([)]"', output: "false" },
            { input: '"]"', output: "false" },
            { input: '"(("', output: "false" }
        ]
    }
];

const run = async () => {
    try {
        await DBConnection();
        console.log('Connected to Database');

        // Find or create an author user
        let user = await User.findOne();
        if (!user) {
            console.log('No user found in database. Creating a default admin user first.');
            user = await User.create({
                firstname: 'System',
                lastname: 'Admin',
                email: 'admin@coderaiders.com',
                password: 'password123',
                role: 'admin',
                phoneno: '1234567890'
            });
            console.log(`Created default user: ${user.email}`);
        }

        console.log(`Using user ID: ${user._id} (${user.email}) as problem author`);

        for (const problemData of sampleProblems) {
            const existing = await Problem.findOne({ title: problemData.title });
            if (existing) {
                existing.testCases = problemData.testCases;
                existing.description = problemData.description;
                existing.difficulty = problemData.difficulty;
                existing.tags = problemData.tags;
                await existing.save();
                console.log(`Updated existing problem "${problemData.title}" with new test cases.`);
            } else {
                const newProblem = new Problem({
                    ...problemData,
                    author: user._id
                });
                await newProblem.save();
                console.log(`Successfully added problem: "${problemData.title}"`);
            }
        }

        console.log('Seeding finished successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding problems:', error);
        process.exit(1);
    }
};

run();
