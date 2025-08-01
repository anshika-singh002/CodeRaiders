import express from 'express';
import {Problem}from '../models/Problem.js';
import auth from '../middleware/auth.js'; //auth middleware

const router = express.Router();

//CREATE: Add a new problem (protected route)
router.post('/problems', auth, async(req,res)=>{
    try{
        const pronlem = new  Problem({
            ...req.body,
            author:req.user,id //get the user id from the authenticated token
        });
        await Problem.save();
        res.status(201).send(problem);
    } catch (error){
        res.status(400).send(error);
    }
});

//READ: get all problems
router.get('/problems', async (req, res)=>{
    try{
        const problems=await Problem.find({});
        res.status(200).send(problems);

    }catch (error){
        res.status(500).send(error);
    }
});

//READ: Get a single problem by ID
router.get('/problems/:id', async (req,res)=>{
    try{
        const problem = await Problem.findById(req.params.id);
        if(!problem){
            return res.status(404).send();
        }
        res.status(200).send(problem);
    }catch(error){
        res.status(500).send(error);
    }
});

//UPDATE: Update a problem by ID (Protected route)
router.put('/problems/:id', auth, async (req, res)=>{
    try{
        const problem = await Problem.findOneAndUpdate(
            {_id:req.params.id, author: req.user.id}, //find by ID and author
            req.body,
            {new:true, runValidators:true} //return the updated document and run validation
        );
        if(!problem){
            return res.status(404).send();
        } 
        res.status(200).send(problem);
    } catch (error){
        res.status(400).send(error);
    }
});


//DELETE: Delete a problem by ID (Protected route)
router.delete('/problems/:id',auth, async (req,res)=>{
    try{
        const problem = await Problem.findOneAndDelete({_id: req.params.id, author: req.user.id});
        if(!problem){
            return res.status(404).send();
        }
        res.status(200).send({ message: 'Problem deleted successfully'});
    }catch(error){
        res.status(500).send(error);
    }
});

export default router;