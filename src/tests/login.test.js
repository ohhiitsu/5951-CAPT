
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { auth } from "../config/firebase";

afterEach(() => {
    cleanup()
})

test('check if by default, user is logged out', () => {
    expect(auth.currentUser).toBe(null)
})