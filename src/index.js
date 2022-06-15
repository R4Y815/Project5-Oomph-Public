import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.js';
import { AuthContextProvider } from './context/AuthContext.js';

ReactDOM.render(
  <React.StrictMode>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
