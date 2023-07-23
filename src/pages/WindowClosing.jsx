import React, { useEffect, useState } from "react";
import {
  getDocs,
  collection,
  query,
  addDoc,
  doc,
  deleteDoc,
  getFirestore,
  orderBy,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Checkbox } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { Button, TextField } from "@mui/material";

function WindowClosing() {
  const [windowclosing, setWindowClosing] = useState([]);
  const firestore = getFirestore();
  const [inputData, setInputData] = useState({
    Completed: false,
    RoomNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const windowClosingCollection = collection(
      firestore,
      "windowClosingRequests"
    );
    const windowClosingQuery = query(
      windowClosingCollection,
      orderBy("RequestDateTime", "desc")
    );
    const querySnapshot = await getDocs(windowClosingQuery);
    const fetchWindowClosingData = [];
    querySnapshot.forEach((doc) => {
      fetchWindowClosingData.push({ Id: doc.id, ...doc.data() });
    });
    setWindowClosing(fetchWindowClosingData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [firestore]);

  const handleInputChange = (field, value) => {
    setInputData({ ...inputData, [field]: value });
  };

  const validateRoomNumber = () => {
    const regex = /^#1[5-7]-\d{2}$/;
    return regex.test(inputData.RoomNumber);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!inputData.RoomNumber) {
      toast.error("Please enter a room number.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    } else if (!validateRoomNumber()) {
      toast.error(
        "Invalid room number. Please use a valid Tulpar room Number eg. #16-63",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
      return;
    }

    const existingRequest = windowclosing.find(
      (wc) => wc.RoomNumber === inputData.RoomNumber && !wc.Completed
    );
    if (existingRequest) {
      toast.error("There is already an open request for this room number.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    try {
      const windowClosingCollection = collection(
        firestore,
        "windowClosingRequests"
      );
      const newWindowClosingRequest = {
        Completed: false,
        RoomNumber: inputData.RoomNumber,
        RequestDateTime: new Date(),
      };
      await addDoc(windowClosingCollection, newWindowClosingRequest);
      toast.success("Window Closing Request Submitted!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      fetchData();
      setInputData({
        Completed: false,
        RoomNumber: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckboxClick = (id, roomNumber) => {
    const windowClosingCollection = collection(
      firestore,
      "windowClosingRequests"
    );
    const requestRef = doc(windowClosingCollection, id);
    deleteDoc(requestRef);
    fetchData();
    toast.success("Thank you for closing the window for " + roomNumber, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  return (
    <>
      <div>
        {loading && (
          <div>
            <p>Loading Requests...</p>
            <CircularProgress disableShrink />
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <form onSubmit={handleFormSubmit}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <TextField
                style={{ flex: 1, marginRight: "15px" }}
                type="text"
                id="outlined-basic"
                label="Fill in a Room Number"
                variant="outlined"
                onChange={(e) =>
                  handleInputChange("RoomNumber", e.target.value)
                }
              />
              <Button
                variant="contained"
                type="submit"
                style={{ marginBottom: "11px" }}
              >
                Place Request
              </Button>
            </div>
          </form>
        </div>
        <div>
          <p>Outstanding Requests</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Request Completed?</th>
            </tr>
          </thead>
          <tbody>
            {windowclosing
              .filter((wc) => wc.Completed !== true)
              .map((wc) => (
                <tr key={wc.Id}>
                  <td>{wc.RoomNumber}</td>
                  <td>
                    <Checkbox
                      checked={wc.Completed}
                      onChange={() => handleCheckboxClick(wc.Id, wc.RoomNumber)}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </>
  );
}

export default WindowClosing;
