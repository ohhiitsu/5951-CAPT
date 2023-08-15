import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getFirestore, orderBy } from 'firebase/firestore';
import { auth } from "../config/firebase";
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';

function Home() {
  const [bookings, setBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [windowClosing, setWindowClosing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUserBooking, setUserBookingLoading] = useState(false);
  const [loadingBookings, setBookingLoading] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    setLoading(true);
    setUserBookingLoading(true);
    setBookingLoading(true);
    fetchBookings();
    fetchUserBookings();
    fetchWindowClosingRequests();
  }, []);

  const fetchBookings = async () => {
    try {
      const firestore = getFirestore();
      const bookingsCollection = collection(firestore, 'LoungeBookings');
      const currentDate = new Date();
      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(currentDate.getDate() + 1);

      const bookingsQuery = query(
        bookingsCollection,
        where('DateFilter', '>=', currentDate),
        where('DateFilter', '<=', oneDayFromNow)
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const fetchedBookings = [];
      bookingsSnapshot.forEach((doc) => {
        fetchedBookings.push({ Id: doc.id, ...doc.data() });
      });
      setBookings(fetchedBookings);
      setBookingLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const firestore = getFirestore();
      const bookingsCollection = collection(firestore, 'LoungeBookings');
      const currentDate = new Date();

      const bookingsQuery = query(
        bookingsCollection,
        where('DateFilter', '>=', currentDate),
        where('User', '==', currentUser.email)
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const fetchedBookings = [];
      bookingsSnapshot.forEach((doc) => {
        fetchedBookings.push({ Id: doc.id, ...doc.data() });
      });
      setUserBookings(fetchedBookings);
      setUserBookingLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const renderBookingTime = (bookingTime) => {
    const hours = Math.floor(bookingTime / 60).toString().padStart(2, '0'); // Calculate hours from the booking time
    const minutes = (bookingTime % 60).toString().padStart(2, '0'); // Calculate minutes from the booking time
    const formattedTime = `${hours}:${minutes}`;
    return formattedTime; // Return the formatted time
  };

  const fetchWindowClosingRequests = async () => {
    try {
      const firestore = getFirestore();
      const windowClosingCollection = collection(firestore, 'windowClosingRequests');
      const windowClosingQuery = query(
        windowClosingCollection,
        orderBy('RequestDateTime', 'desc')
      );

      const querySnapshot = await getDocs(windowClosingQuery);
      const fetchWindowClosingData = [];
      querySnapshot.forEach((doc) => {
        fetchWindowClosingData.push({ Id: doc.id, ...doc.data() });
      });
      setWindowClosing(fetchWindowClosingData);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const currentDate = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString(undefined, options);

  return (
    <div className="home-container">
      {currentUser && (
        <div className="welcome-message">Welcome back, {currentUser.email}</div>
      )}
      <hr />
      <div className="date">{formattedDate}</div>
      <hr />
      {currentUser && (
        <div className="booking-section">
          <h3>Your Upcoming Bookings:</h3>
          {loadingUserBooking ? (
            <div className="loading">
              <p>Loading Bookings...</p>
              <CircularProgress disableShrink />
            </div>
          ) : userBookings.length === 0 ? (
            <div className="no-bookings">
              <p>No bookings yet, <Link to="/loungebooking">Book Now</Link></p>
            </div>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Lounge</th>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                </tr>
              </thead>
              <tbody>
                {userBookings.map((booking) => (
                  <tr key={booking.Id}>
                    <td>{booking.Lounge}</td>
                    <td>{booking.Date.toDate().toLocaleDateString()}</td>
                    <td>{renderBookingTime(booking.BookingStart)}</td>
                    <td>{renderBookingTime(booking.BookingEnd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <div className="booking-section">
        <h3>Lounge Bookings in the next 24H:</h3>
        {loadingBookings ? (
          <div className="loading">
            <p>Loading Bookings...</p>
            <CircularProgress disableShrink />
          </div>
        ) : bookings.length === 0 ? (
          <div className="no-bookings">
            <p>No bookings yet, <Link to="/loungebooking">Book Now</Link></p>
          </div>
        ) : (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Lounge</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.Id}>
                  <td>{booking.Lounge}</td>
                  <td>{booking.Date.toDate().toLocaleDateString()}</td>
                  <td>{renderBookingTime(booking.BookingStart)}</td>
                  <td>{renderBookingTime(booking.BookingEnd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="window-closing-section">
        <h3>Window Closing Requests:</h3>
        {loading ? (
          <div className="loading">
            <p>Loading requests...</p>
            <CircularProgress disableShrink />
          </div>
        ) : (
          <ul className="window-closing-list">
            {windowClosing.map((request) => (
              <li key={request.Id}>
                <Link to="/windowclosing">{request.RoomNumber}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Home;
