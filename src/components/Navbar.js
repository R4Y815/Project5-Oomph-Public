/* eslint-disable react/button-has-type */
import React from 'react';
import { Link } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout.js';
import { useAuthContext } from '../hooks/useAuthContext.js';

// styles
import './Navbar.css';

function Navbar() {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  return (
    <nav className="navbar">
      <h1>oomph!</h1>
      <div className="links">
        {!user && (
          <li>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </li>
        )}
        {user && (
          <li>
            <Link to="/dashboard">My Dashboard</Link>
            <Link to="/">Exercises</Link>
            <button className="btn" onClick={logout}>Logout</button>
          </li>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
