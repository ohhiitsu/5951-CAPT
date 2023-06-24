import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignIn = (e) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const signIn = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            toast.success('Sign In Successfully!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                });
            console.log(userCredential)
        }).catch((error) => {
            console.log(error)
        })
    }

    return (
        <div className="sign-in-container">
            <form onSubmit={signIn}>
            <h1>Log In Using NUS Email to Continue</h1>
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
            <button type="submit">Log In</button>
            </form>
            <ToastContainer />
        </div>
        ); 
    };
export default SignIn;