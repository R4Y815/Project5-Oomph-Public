/* eslint-disable import/prefer-default-export */
/* eslint-disable import/extensions */
import React from 'react';
import {
  BrowserRouter, Redirect, Route, Switch,
} from 'react-router-dom';
import Navbar from './components/Navbar.js';
import Home from './pages/home/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Capture from './pages/capture/Capture';
import Login from './pages/login/Login';
import Signup from './pages/signup/Signup';
import Notfound from './pages/notfound/Notfound';
import { useAuthContext } from './hooks/useAuthContext';

export default function App() {
  const { authIsReady, user } = useAuthContext();

  return (
    <div className="App">
      {authIsReady && (
        <BrowserRouter>
          <Navbar />
          <Switch>
            <Route exact path="/">
              {!user && <Redirect to="/login" />}
              {user && <Home />}
            </Route>
            <Route path="/capture">
              {!user && <Redirect to="/login" />}
              {user && <Capture />}
            </Route>
            <Route path="/dashboard">
              {!user && <Redirect to="/login" />}
              {user && <Dashboard />}
            </Route>
            <Route path="/login">
              {user && <Redirect to="/" />}
              {!user && <Login />}
            </Route>
            <Route path="/signup">
              {user && <Redirect to="/" />}
              {!user && <Signup />}
            </Route>
            <Route path="*">
              <Notfound />
            </Route>
          </Switch>
        </BrowserRouter>
      )}
    </div>
  );
}
