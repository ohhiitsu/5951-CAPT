import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, getFirestore, addDoc, Timestamp, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { auth } from "../config/firebase";
import CircularProgress from '@mui/material/CircularProgress';

function LoungeBooking() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [bookings, setBookings] = useState([]);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editingStartTime, setEditingStartTime] = useState('');
  const [editingEndTime, setEditingEndTime] = useState('');
  const [selectedLounge, setSelectedLounge] = useState('');
  const [filterApplied, setFilterApplied] = useState(false);
  const currentUserEmail = auth.currentUser ? auth.currentUser.email : '';
  const firestore = getFirestore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
    fetchBookings();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const locationsCollection = collection(firestore, 'LoungeLocations');
      const locationsSnapshot = await getDocs(locationsCollection);
      const fetchedLocations = locationsSnapshot.docs.map((doc) => doc.data());
      fetchedLocations.sort((a, b) => a.Name.localeCompare(b.Name));
      setLocations(fetchedLocations);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const bookingsCollection = collection(firestore, 'LoungeBookings');
      const currentDate = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(currentDate.getDate() + 3);

      let bookingsQuery = query(
        bookingsCollection,
        where('DateFilter', '>=', currentDate),
        where('DateFilter', '<=', threeDaysFromNow)
      );
      if (filterApplied) {
        if (selectedLounge !== '') {
          bookingsQuery = query(bookingsQuery, where('Lounge', '==', selectedLounge));
        }
      }

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const fetchedBookings = [];
      bookingsSnapshot.forEach((doc) => {
        fetchedBookings.push({ Id: doc.id, ...doc.data() });
      });
      setBookings(fetchedBookings);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleStartTimeChange = (event) => {
    setSelectedStartTime(event.target.value);
  };

  const handleEndTimeChange = (event) => {
    setSelectedEndTime(event.target.value);
  };

  const convertTimeToNumber = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  };
  
  const convertTimeStringToDate = (dateString, timeString) => {
    const date = new Date(dateString);
    const [hours, minutes] = timeString.split(':');
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };
  
  const isValidBooking = async (lounge, selectedDate, selectedStartTime, selectedEndTime) => {
    const selectedStartTimeNumber = convertTimeToNumber(selectedStartTime);
    const selectedEndTimeNumber = convertTimeToNumber(selectedEndTime);
  
    // Check if end time is earlier or equal to start time
    if (selectedEndTimeNumber <= selectedStartTimeNumber) {
      return false;
    }
  
    try {
      const bookingsCollection = collection(firestore, 'LoungeBookings');
      const selectedTimestamp = Timestamp.fromDate(selectedDate);

      const bookingsQuery = query(
        bookingsCollection,
        where('Lounge', '==', lounge),
        where('Date', '==', selectedTimestamp)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      // Check for clashes with existing bookings
      const isValid = bookingsSnapshot.docs.every((doc) => {
        const booking = doc.data();
        console.log(booking);
        const existingStartTime = booking.BookingStart;
        const existingEndTime = booking.BookingEnd;
  
        // Check if the selected start and end times clash with existing bookings
        return (
          (selectedStartTimeNumber >= existingEndTime) ||
          (selectedEndTimeNumber <= existingStartTime)
        );
      });
  
      return isValid;
    } catch (error) {
      console.log(error);
      return false;
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!selectedLocation || !selectedStartTime || !selectedEndTime || !selectedDate) {
      toast.error('Please ensure all fileds are filled before submitting', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
      return;
    }

    const selectedValidDateTimeCheck = convertTimeStringToDate(selectedDate, selectedStartTime);

    if (new Date() > selectedValidDateTimeCheck) {
      toast.error('Reservation date and time has passed', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
      return;
    }
  
    try {
      const isValid = await isValidBooking(selectedLocation, selectedDate, selectedStartTime, selectedEndTime);
  
      if (isValid) {
        const bookingsCollection = collection(firestore, 'LoungeBookings');
        const selectedDateTime = convertTimeStringToDate(selectedDate, selectedEndTime);
  
        const bookingData = {
          Lounge: selectedLocation,
          Date: Timestamp.fromDate(selectedDate),
          DateFilter: Timestamp.fromDate(selectedDateTime),
          BookingStart: convertTimeToNumber(selectedStartTime),
          BookingEnd: convertTimeToNumber(selectedEndTime),
          User: auth.currentUser.email
        };
  
        // Add the new booking to the "LoungeBookings" collection
        await addDoc(bookingsCollection, bookingData);
  
        toast.success('Booking confirmed!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light"
        });
  
        fetchBookings();
      } else {
        toast.error('Invalid booking. Please check the timing or select a different time slot.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light"
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  

  const handleDeleteBooking = async (bookingId) => {
    try {
      const bookingRef = doc(firestore, 'LoungeBookings', bookingId);
      await deleteDoc(bookingRef);
      toast.success('Booking deleted successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      fetchBookings();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditBooking = (bookingId, bookingUser) => {
    if (bookingUser === currentUserEmail) {
      setEditingBookingId(bookingId);
    } else {
      notUserBookingError();
    }
  };

  const handleCancelEdit = () => {
    setEditingBookingId(null);
  };

  const notUserBookingError = () => {
    toast.error('Contact user to amend booking', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light"
    });
  };


  const isValidEditedBooking = async (lounge, selectedDate, selectedStartTime, selectedEndTime, id) => {
    // Check if end time is earlier or equal to start time
    if (selectedEndTime <= selectedStartTime) {
      return false;
    }

    try {
      const bookingsCollection = collection(firestore, 'LoungeBookings');
      const selectedDateTime = Timestamp.fromDate(selectedDate);

      const bookingsQuery = query(
        bookingsCollection,
        where('Lounge', '==', lounge),
        where('Date', '==', selectedDateTime),
        where('__name__', '!=', id)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);

      // Check for clashes with existing bookings
      const isValid = bookingsSnapshot.docs.every((doc) => {
        const booking = doc.data();
        const existingStartTime = booking.BookingStart;
        const existingEndTime = booking.BookingEnd;

        // Check if the selected start and end times clash with existing bookings
        return (
          (selectedStartTime >= existingEndTime) ||
          (selectedEndTime <= existingStartTime)
        );
      });

      return isValid;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const handleSaveEdit = async (bookingId, newBookingData) => {
    try {
      const bookingRef = doc(firestore, 'LoungeBookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      const bookingData = bookingDoc.data();

      const isValid = await isValidEditedBooking(
        bookingData.Lounge,
        bookingData.Date.toDate(),
        newBookingData.BookingStart,
        newBookingData.BookingEnd,
        bookingId
      );

      if (isValid) {
        await updateDoc(bookingRef, newBookingData);
        toast.success('Booking updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
        setEditingBookingId(null);
        fetchBookings();
      } else {
        toast.error('Invalid booking. Please check the timing or select a different time slot.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };


  const handleLoungeChange = (event) => {
    setSelectedLounge(event.target.value);
  };

  const handleFilter = () => {
    setFilterApplied(true);
    fetchBookings();
    toast.success('Filter Applied!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light"
    });
  };

  const renderBookingTime = (bookingTime) => {
    const hours = Math.floor(bookingTime / 60).toString().padStart(2, '0'); // Calculate hours from the booking time
    const minutes = (bookingTime % 60).toString().padStart(2, '0'); // Calculate minutes from the booking time
    const formattedTime = `${hours}:${minutes}`;
    return formattedTime; // Return the formatted time
  };

  return (
    <>
      <div className="booking-container">
        <h1>Lounge Booking Reservation</h1>
        <div>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="location">Location:</label>
              <select id="location" value={selectedLocation} onChange={handleLocationChange}>
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.Id} value={location.Name}>
                    {location.Name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date">Date:</label>
              <DatePicker
                id="date"
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select a date"
              />
            </div>
            <div>
              <label htmlFor="startTime">Start Time:</label>
              <select id="startTime" value={selectedStartTime} onChange={handleStartTimeChange}>
                <option value="">Select a start time</option>
                {Array.from({ length: 24 * 4 }).map((_, index) => {
                  const time = `${Math.floor(index / 4)
                    .toString()
                    .padStart(2, '0')}:${((index % 4) * 15).toString().padEnd(2, '0')}`;
                  return (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label htmlFor="endTime">End Time:</label>
              <select id="endTime" value={selectedEndTime} onChange={handleEndTimeChange}>
                <option value="">Select an end time</option>
                {Array.from({ length: 24 * 4 }).map((_, index) => {
                  const time = `${Math.floor(index / 4)
                    .toString()
                    .padStart(2, '0')}:${((index % 4) * 15).toString().padEnd(2, '0')}`;
                  return (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  );
                })}
              </select>
            </div>
            <button type="submit">Book Now</button>
          </form>
        </div>
        <div>
          <label htmlFor="lounge">Filter by Lounge:</label>
          <select id="lounge" value={selectedLounge} onChange={handleLoungeChange}>
            <option value="">All Lounges</option>
            {locations.map((location) => (
              <option key={location.Id} value={location.Name}>
                {location.Name}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={handleFilter}>
          Filter
        </button>
        <div>
          <p>Bookings for the next 3 days at {selectedLounge || 'all lounges'}:</p>
          {loading && (
            <div className="loading">
              <p>Loading Bookings...</p>
              <CircularProgress disableShrink />
            </div>
          )}
          {bookings.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Lounge</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.Id}>
                    <td>{booking.Lounge}</td>
                    <td>{booking.User.split("@")[0]}</td>
                    <td>{booking.Date.toDate().toLocaleDateString()}</td>
                    <td>{renderBookingTime(booking.BookingStart)}</td>
                    <td>{renderBookingTime(booking.BookingEnd)}</td>
                    <td>
                      {editingBookingId === booking.Id && booking.User === auth.currentUser.email ? (
                        <div>
                          <select
                            value={editingStartTime}
                            onChange={(e) => setEditingStartTime(e.target.value)}
                          >
                            {Array.from({ length: 24 * 4 }).map((_, index) => {
                              const time = `${Math.floor(index / 4)
                                .toString()
                                .padStart(2, '0')}:${((index % 4) * 15).toString().padEnd(2, '0')}`;
                              return (
                                <option key={index} value={time}>
                                  {time}
                                </option>
                              );
                            })}
                          </select>
                          <select
                            value={editingEndTime}
                            onChange={(e) => setEditingEndTime(e.target.value)}
                          >
                            {Array.from({ length: 24 * 4 }).map((_, index) => {
                              const time = `${Math.floor(index / 4)
                                .toString()
                                .padStart(2, '0')}:${((index % 4) * 15).toString().padEnd(2, '0')}`;
                              return (
                                <option key={index} value={time}>
                                  {time}
                                </option>
                              );
                            })}
                          </select>
                          <button
                            onClick={() =>
                              handleSaveEdit(booking.Id, {
                                BookingStart: convertTimeToNumber(editingStartTime),
                                BookingEnd: convertTimeToNumber(editingEndTime),
                              })
                            }
                          >
                            <CheckCircleIcon />
                          </button>
                          <button onClick={handleCancelEdit}><CancelIcon /></button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditBooking(booking.Id, booking.User)}><EditIcon /></button>
                      )}
                    </td>
                    <td>
                      {booking.User === auth.currentUser.email ? (
                        <button onClick={() => handleDeleteBooking(booking.Id)}>
                          <DeleteIcon />
                        </button>
                      ) : (
                        <button onClick={() => notUserBookingError()}>
                          <DeleteIcon />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-bookings">
              No bookings available.
            </p>
          )}
        </div>
        <ToastContainer />
      </div>
    </>
  );
          }
export default LoungeBooking;