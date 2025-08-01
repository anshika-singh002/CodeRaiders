import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
firstname:{
    type:String,
    default:null,
    required:true,
},
lastname:{
    type:String,
    default:null,
    required:true,
},
email:{
    type:String,
    default:null,
    required:true,
    unique:true,
},
password:{
    type:String,
    required:true,
},
phoneno:{
    type:String,
    unique:true,
},
role:{
    type:String,
    enum:['user','admin'],//enforce that role can only be "user" or "admin"
    default:'user', // default role for new uers
    required:true
},
token: {
     type: String
} // For storing the JWT token
},{timestamps:true});

export default mongoose.model('User', userSchema);//always write singular here as mongo d itslef wil make it plural afterwaards