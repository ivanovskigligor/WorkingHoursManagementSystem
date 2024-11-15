import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Pages/Login/Login';
import Home from './Pages/Home';
import Register from './Pages/Register/Register';
import EditUser from './Pages/EditUser/EditUser'
import WorkingHoursTable from './Pages/WorkingHoursTable/WorkingHoursTable'
import WorkingHoursInput from './Components/WorkingHoursInput/WorkingHoursInput';

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