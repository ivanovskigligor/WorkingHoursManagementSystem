import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Register from './Pages/Register';
import EditUser from './Pages/EditUser'
import WorkingHoursTable from './Pages/WorkingHoursTable'
import WorkingHoursInput from './Components/WorkingHoursInput';

const App = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/edit-user/:userId" element={<EditUser />} />
                <Route path="/post-working-hours" element={<WorkingHoursInput />} />
                <Route path="/table-working-hours" element={<WorkingHoursTable />} />
            </Routes>
        </>
    );
};

export default App;