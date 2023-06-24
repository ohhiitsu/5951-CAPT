import React, { useEffect, useState } from 'react';
import { getDocs, collection, query, addDoc, doc, deleteDoc, getFirestore } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Checkbox } from "@mui/material";

function WindowClosing() {
  const [windowclosing, setWindowClosing] = useState([]);
  const firestore = getFirestore();
  const [inputData, setInputData] = useState({
    Completed: false,
    RoomNumber: ''
  });

  useEffect(() => {
    async function fetchData() {
      const windowClosingCollection = collection(firestore, "windowClosingRequests");
      const windowClosingQuery = query(windowClosingCollection);
      const querySnapshot = await getDocs(windowClosingQuery);
      const fetchWindowClosingData = [];
      querySnapshot.forEach((doc) => {
        fetchWindowClosingData.push({ Id: doc.id, ...doc.data() });
      });
      setWindowClosing(fetchWindowClosingData);
    }
    fetchData();
  }, [firestore]);

  const handleInputChange = (field, value) => {
    setInputData({ ...inputData, [field]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    async function fetchData() {
      const windowClosingCollection = collection(firestore, "windowClosingRequests");
      const windowClosingQuery = query(windowClosingCollection);
      const querySnapshot = await getDocs(windowClosingQuery);
      const fetchWindowClosingData = [];
      querySnapshot.forEach((doc) => {
        fetchWindowClosingData.push({ Id: doc.id, ...doc.data() });
      });
      setWindowClosing(fetchWindowClosingData);
    }
    try {
      const windowClosingCollection = collection(firestore, "windowClosingRequests");
      const newWindowClosingRequest = {
        Completed: false,
        RoomNumber: inputData.RoomNumber
      };
      await addDoc(windowClosingCollection, newWindowClosingRequest);
      toast.success('Window Closing Request Submitted!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
      fetchData();
      setInputData({
        Completed: false,
        RoomNumber: ''
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckboxClick = (id) => {
    async function fetchData() {
      const windowClosingCollection = collection(firestore, "windowClosingRequests");
      const windowClosingQuery = query(windowClosingCollection);
      const querySnapshot = await getDocs(windowClosingQuery);
      const fetchWindowClosingData = [];
      querySnapshot.forEach((doc) => {
        fetchWindowClosingData.push({ Id: doc.id, ...doc.data() });
      });
      setWindowClosing(fetchWindowClosingData);
    }
    const windowClosingCollection = collection(firestore, "windowClosingRequests");
    const requestRef = doc(windowClosingCollection, id);
    deleteDoc(requestRef);
    fetchData();
  };

  return (
    <>
      <div className="hero min-h-screen bg-slate-800">
        <div className='max-w-5xl mx-auto'>
          <form className='flex' onSubmit={handleFormSubmit}>
            <input
              type="text"
              onChange={(e) => handleInputChange('RoomNumber', e.target.value)}
              value={inputData.RoomNumber}
              placeholder='Room Number'
              className='m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg'
            />
            <button type="submit" className='m-4 border border-purple-500 p-5 rounded-lg transition-opacity bg-purple-600 bg-opacity-30 hover:bg-opacity-50 text-slate-50'>
              New Window Closing Request
            </button>
          </form>
          <div className='flex'>
            <p className='m-4 text-slate-50'>Outstanding Requests</p>
          </div>
          <table className='table w-full bg-transparent text-slate-50'>
            <thead>
              <tr>
                <th className='bg-slate-900 border border-slate-700'>Room Number</th>
                <th className='bg-slate-900 border border-slate-700'>Request Completed?</th>
              </tr>
            </thead>
            <tbody>
              {
                windowclosing
                  .filter((wc) => wc.Completed !== true)
                  .map((wc) => (
                    <tr key={wc.Id}>
                      <td className='bg-slate-800 border border-slate-700'>{wc.RoomNumber}</td>
                      <td className='bg-slate-800 border border-slate-700'>
                        <Checkbox checked={wc.Completed} onChange={() => handleCheckboxClick(wc.Id)} />
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default WindowClosing;
