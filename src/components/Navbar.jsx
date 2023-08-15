import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { auth } from "../config/firebase";

function Navbar() {

  return (
    <nav className="nav">
      <Link to="/" className="site-title">
        CAPT CL-APP
      </Link>
      <ul>
        <CustomLink to="/windowclosing">Window Closing</CustomLink>
        <CustomLink to="/eblackmarket">E-Black Market</CustomLink>
        {<CustomLink to="/eblackmarketadmin">E-Black Market Admin</CustomLink>}
        <CustomLink to="/loungebooking">Lounge Booking</CustomLink>
        <CustomLink to="/login">Log In</CustomLink>
      </ul>
    </nav>
  );
}

export default Navbar;

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });
  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}
