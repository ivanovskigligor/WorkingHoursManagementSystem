import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {

    const navigate = useNavigate();

    const token = localStorage.getItem("jwt")
    const userId = localStorage.getItem("userId")

    const logout = () => {
        localStorage.removeItem("jwt");
        localStorage.removeItem("userId");
        localStorage.removeItem("roles");

        navigate("/login");
    }

    return (
        <nav>
            <div>
                <button><Link to = "/">Home</Link></button>
                {userId && (
                    <div>
                        <button>
                            <Link to="/table-working-hours">My Hours</Link>
                        </button>
                        <button>
                            <Link to="/post-working-hours">Log Hours</Link>
                        </button>
                    </div>
                )}

                {token === null ? (
                    <button>
                        <Link to="/login">Login</Link>
                    </button>
                ) : (
                    <button onClick={logout}>Logout</button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
