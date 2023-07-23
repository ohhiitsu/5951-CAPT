import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./components/ProtectedRoutes";
import WindowClosing from "./pages/WindowClosing";
import LoungeBooking from "./pages/LoungeBooking";
import EBlackMarket from "./pages/eBlackMarket";
import EBlackMarketAdmin from "./pages/eBlackMarketAdmin";

function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route element={<ProtectedRoutes />}>
            <Route path="/windowclosing" element={<WindowClosing />}></Route>
            <Route path="/eblackmarket" element={<EBlackMarket />}></Route>
            <Route
              path="/eblackmarketadmin"
              element={<EBlackMarketAdmin />}
            ></Route>
            <Route path="/loungebooking" element={<LoungeBooking />}></Route>
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
