import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
    const [formData, setFormData] = useState({
        firstname:'',
        lastname:'',
        email:'',
        password:'',
        phoneno:''
    });
    const navigate = useNavigate();

    const handleChange=(e)=>{
        setFormData({...formData,[e.target.name]:e.target.value});

    };

    const handleSubmit = async (e)=> {
        e.preventDefault();
        try{
            await authService.register(
                formData.firstname,
                formData.lastname,
                formData.email,
                formData.password,
                formData.phoneno
                
            );
            console.log("Registration successful!");
            alert("Registration successful! You can now log in.");
            navigate('/login');
        }catch(error){
            console.error("Registration failed:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            alert("Registration failed:" + errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} placeholder="First Name" required />
            <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} placeholder="Last Name" required />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
            <input type="text" name="phoneno" value={formData.phoneno} onChange={handleChange} placeholder="Phone Number" required />
            <button type="submit">Register</button>
        </form>
    );
};

export default Register;