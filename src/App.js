// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Register from './components/register';
import Login from './components/login';
import Dashboard from './components/dashboard';
import Transactions from './components/transations';
import { UserProvider } from './context/userContext';

const App = () => {
    return (
      <UserProvider>
        {/* <div> */}
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transaction" element={<Transactions />} />
            </Routes>
        {/* </div> */}
        </UserProvider>
    );
};

export default App;
