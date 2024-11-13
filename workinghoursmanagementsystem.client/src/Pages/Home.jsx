import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import TableData from "../Components/TableData";
function Home() {


    const navigate = useNavigate();

    const token = localStorage.getItem("jwt")

    const logout = () => {
        localStorage.removeItem("jwt");
        navigate("/login");
    }

    console.log(token);

    return (
        <>
            {token === null ? <button><Link to="/login">Login</Link></button> : <button onClick={ logout }>Logout</button>}
        <TableData/> 
        </>
    );
}

export default Home;