import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Login from "./pages/Login";
import { Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./components/ProtectedRoutes";

function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route element={<ProtectedRoutes />}>
            <Route path="/pricing" element={<Pricing />}></Route>
            <Route path="/about" element={<About />}></Route>
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
