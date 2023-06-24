import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./components/ProtectedRoutes";
import WindowClosing from "./pages/WindowClosing";

function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route element={<ProtectedRoutes />}>
            <Route path="/WindowClosing" element={<WindowClosing />}></Route>
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
