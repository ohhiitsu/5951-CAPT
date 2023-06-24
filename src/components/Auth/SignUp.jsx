import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignUp = (e) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const signUp = (e) => {
        e.preventDefault();
        email.toLowerCase().includes('nus.edu.sg')  ? 
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log(userCredential)
            toast.success('Sign Up Successfully!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                });
        }).catch((error) => {
            console.log("Sign up error")
        }) : 
        toast.error('Please use NUS email', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
        console.log("Please use NUS email")
    }

    return (
        <div className="sign-in-container">
            <form onSubmit={signUp}>
            <h1>Create Account Using NUS Email</h1>
            <input 
                type= "email" 
                placeholder = "Enter your email" 
                value = {email} 
                onChange = {(e) => setEmail(e.target.value)}
            ></input> 
            <input 
                type= "password" 
                placeholder = "Enter your password" 
                value = {password}
                onChange={(e) => setPassword(e.target.value)}
            ></input>
            <button type="submit">Create</button>
            </form>
            <ToastContainer />
        </div>
        
        ); 
    };
export default SignUp;