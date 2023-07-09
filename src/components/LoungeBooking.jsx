import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, getFirestore, addDoc, Timestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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

  const firestore = getFirestore();

  useEffect(() => {
    fetchLocations();
    fetchBookings();
  }, []);

  const fetchLocations = async () => {
    try {
      const locationsCollection = collection(firestore, 'LoungeLocations');
      const locationsSnapshot = await getDocs(locationsCollection);
      const fetchedLocations = locationsSnapshot.docs.map((doc) => doc.data());
      fetchedLocations.sort((a, b) => a.Name.localeCompare(b.Name));
      setLocations(fetchedLocations);
    } catch (error) {
      console.log(error);
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
        where('Date', '>=', currentDate),
        where('Date', '<=', threeDaysFromNow)
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedLocation || !selectedStartTime || !selectedEndTime || !selectedDate) {
      return;
    }

    try {
      const bookingsCollection = collection(firestore, 'LoungeBookings');
      const bookingsQuery = query(
        bookingsCollection,
        where('Lounge', '==', selectedLocation),
        where('BookingStart', '==', selectedStartTime),
        where('BookingEnd', '==', selectedEndTime)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);

      if (bookingsSnapshot.empty) {

        const selectedDateTime = Timestamp.fromDate(new Date(selectedDate));

        const bookingData = {
          Lounge: selectedLocation,
          Date: selectedDateTime,
          BookingStart: selectedStartTime,
          BookingEnd: selectedEndTime,
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
        toast.error('Booking clashes with existing booking', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false, draggable: true,
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
      console.log(bookingId)
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

  const handleEditBooking = (bookingId) => {
    setEditingBookingId(bookingId);
  };

  const handleCancelEdit = () => {
    setEditingBookingId(null);
  };

  const handleSaveEdit = async (bookingId, newBookingData) => {
    try {
      const bookingRef = doc(firestore, 'LoungeBookings', bookingId);
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
  };


  return (
    <>
      <div>
        <h1>Lounge Booking Reservation</h1>
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
        <p>Bookings for the next 3 days at {selectedLounge || 'all lounges'}:</p>
        {bookings.length > 0 ? (

          <table>
            <thead>
              <tr>
                <th>Lounge</th>
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
                  <td>{booking.Date.toDate().toLocaleDateString()}</td>
                  <td>{booking.BookingStart}</td>
                  <td>{booking.BookingEnd}</td>
                  <td>
                    {editingBookingId === booking.Id ? (
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
                              BookingStart: editingStartTime,
                              BookingEnd: editingEndTime,
                            })
                          }
                        >
                          <CheckCircleIcon />
                        </button>
                        <button onClick={handleCancelEdit}><CancelIcon /></button>
                      </div>
                    ) : (
                      <button onClick={() => handleEditBooking(booking.Id)}><EditIcon /></button>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteBooking(booking.Id)}><DeleteIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No bookings available.</p>
        )}
        <ToastContainer />
      </div>
    </>
  );
}

export default LoungeBooking;