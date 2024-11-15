import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import TableData from "../Components/TableData/TableData";


function Home() {

    return (
        <>
            <TableData/> 
        </>
    );
}

export default Home;