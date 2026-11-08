// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import DarkModeToggler from "./DarkModeToggler";

const Navbar = () => (
  <nav
    className=" bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-950  /* Light mode gradient */
  dark:bg-gradient-to-r dark:from-slate-950 dark:via-blue-600 dark:to-yellow-200 /* Dark mode gradient */
  text-white p-4 relative z-50" 
  >
    <ul className="flex space-x-4">
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/about">About</Link>
      </li>
      <li>
        <Link to="/contact">Contact</Link>
      </li>
      <div className="absolute right-0">
        {" "}
        <DarkModeToggler />
      </div>
    </ul>
  </nav>
);

export default Navbar;
