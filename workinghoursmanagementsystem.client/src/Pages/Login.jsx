import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('https://localhost:7022/api/auth/login', {
                userName,
                password
            });

            const { token, userId, roles } = response.data;
            localStorage.setItem('jwt', token); 
            localStorage.setItem('userId', userId); 
            localStorage.setItem('roles', roles[0]); 


            navigate("/");
        } catch (error) {
            setError('Login failed');
            console.error(error.response);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <Link to = "/register">Not a user?</Link>
            {error && <p>{error}</p>}
        </div>
    );
}

export default Login;
