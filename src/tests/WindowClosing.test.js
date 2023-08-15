// WindowClosing.test.js

const validateRoomNumber = (roomNumber) => {
    const regex = /^#1[5-7]-\d{2}$/;
    return regex.test(roomNumber);
  };

describe('validateRoomNumber function', () => {
  it('should return true for a valid room number', () => {
    // Set a valid room number
    const validRoomNumber = '#16-63';

    // Call the validateRoomNumber function
    const isValidRoomNumber = validateRoomNumber(validRoomNumber);

    // Check if the function returns true for a valid room number
    expect(isValidRoomNumber).toBeTruthy();
  });

  it('should return false for an invalid room number', () => {
    // Set an invalid room number
    const invalidRoomNumber = 'InvalidRoomNumber';

    // Call the validateRoomNumber function
    const isValidRoomNumber = validateRoomNumber(invalidRoomNumber);

    // Check if the function returns false for an invalid room number
    expect(isValidRoomNumber).toBeFalsy();
  });
});
