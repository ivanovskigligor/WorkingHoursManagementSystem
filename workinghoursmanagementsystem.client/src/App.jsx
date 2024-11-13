import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Register from './Pages/Register';
import EditUser from './Pages/EditUser'

const App = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/edit-user/:userId" element={<EditUser />} />
            </Routes>
        </>
    );
};

export default App;