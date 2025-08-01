import mongoose from 'mongoose';

const problemSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim: true //this removes white spaces fro starting nd ending of a string
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum:['Easy','Medium','Hard'],
        default:'Easy'
    },
    testCases:[{
        input:{type:String,required:true},
        output:{type:String,required:true}
    }],
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User', //creates a reationship to user model
        required: true
    },
    createdAt: {
        type:Date,
        default:Date.now
    }

});

export const Problem = mongoose.model('Problem',problemSchema);