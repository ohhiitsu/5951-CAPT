import { render, screen, cleanup, waitFor } from "@testing-library/react";
import AuthDetails from "../components/AuthDetails";
import SignIn from "../components/Auth/SignIn";
import userEvent from "@testing-library/user-event";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

afterEach(() => {
    cleanup()
})

test('check if by default, user is logged out', () => {
    expect(auth.currentUser).toBe(null)
})

test('check if user is logged in', () => {
    render(<AuthDetails/>)
    render(<SignIn />)
    
    // TODO
})