import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

function Navbar() {
  return (
    <nav className="nav">
      <Link to="/" className="site-title">
        CAPT CL-APP
      </Link>
      <ul>
        <CustomLink to="/WindowClosing">Window Closing</CustomLink>
        <CustomLink to="/pricing">E-Black Market</CustomLink>
        <CustomLink to="/about">Lounge Booking</CustomLink>
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