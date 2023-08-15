import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import LoungeBooking from '../pages/LoungeBooking';

const renderBookingTime = (bookingTime) => {
  const hours = Math.floor(bookingTime / 60)
    .toString()
    .padStart(2, "0"); // Calculate hours from the booking time
  const minutes = (bookingTime % 60).toString().padStart(2, "0"); // Calculate minutes from the booking time
  const formattedTime = `${hours}:${minutes}`;
  return formattedTime; // Return the formatted time
};

// Mock the react-toastify module to prevent toast notifications from being displayed
jest.mock('react-toastify', () => ({
  ToastContainer: jest.fn(() => null),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('LoungeBooking Component', () => {

  it('should handle date change', () => {
    render(<LoungeBooking />);
    const dateInput = screen.getByLabelText('Date:');
    fireEvent.change(dateInput, { target: { value: '2023-07-25' } });
    expect(dateInput.value).toBe('07/25/2023');
  });

  // Add more test cases for other event handlers as needed

  it('should render booking time correctly', () => {
    const bookingTime = 780; // 13:00 (13 hours * 60 + 0 minutes)
    // Access and call the helper function from the component instance
    const result = renderBookingTime(bookingTime);
    expect(result).toBe('13:00');
  });

  // Add more test cases for other helper functions as needed
});
