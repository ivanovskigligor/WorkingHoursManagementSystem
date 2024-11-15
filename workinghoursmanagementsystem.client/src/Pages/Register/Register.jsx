import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import "./Register.css"

function Register() {

    const [formData, setFormData] = useState({
        photo: null,
        name: "",
        jobPosition: "",
        employmentType: "Permanent", 
        employmentOtherComment: null,
        activeStatus: true,
        username: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const employmentTypes = [
        "Permanent",
        "FixedTerm",
        "Student",
        "Contracted",
        "Freelancer",
        "Other"
    ];

    const [passwordErrors, setPasswordErrors] = useState([]);

    const navigate = useNavigate();

    const handleChange = e => {

        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (name === "emplymentType" && value === "Other") {
            setFormData({
                ...formData,
                employmentOtherComment: null
            });
        };

    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const payload = {
                Photo: formData.photo,
                Name: formData.name,
                JobPosition: formData.jobPosition,
                EmploymentType: formData.employmentType,
                EmploymentOtherComment: formData.employmentType === "Other" ? formData.employmentOtherComment : null,
                ActiveStatus: formData.activeStatus,
                UserName: formData.username,
                Email: formData.email,
                PhoneNumber: formData.phoneNumber,
                Password: formData.password,
            };

            const response = await axios.post('https://localhost:7022/api/auth/register', payload, {
                headers: {
                    'Content-Type': 'application/json',
                },

            });


            alert("Registration successful");

            if (localStorage.getItem("userId")) {
                navigate("/");
            } else {
                navigate("/login");

            }

        } catch (error) {

            if (error.response.data) {
                setPasswordErrors(error.response.data.map(err => err.description));
            }
        }
    }


    return (
        <>
            <form onSubmit={handleSubmit} className="register-form">
                <h2 className="form-title">Register</h2>

                <div className="form-group">
                    <label className="form-label">Name:</label>
                    <input
                        className="form-input"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Job Position:</label>
                    <input
                        className="form-input"
                        name="jobPosition"
                        value={formData.jobPosition}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Employment Type:</label>
                    <select
                        className="form-input"
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleChange}
                    >
                        {employmentTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {formData.employmentType === "Other" && (
                    <div className="form-group">
                        <label className="form-label">Employment Other Comment:</label>
                        <input
                            className="form-input"
                            name="employmentOtherComment"
                            value={formData.employmentOtherComment || ""}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Active Status:</label>
                    <select
                        className="form-input"
                        name="activeStatus"
                        value={formData.activeStatus}
                        onChange={handleChange}
                    >
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Username:</label>
                    <input
                        className="form-input"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email:</label>
                    <input
                        className="form-input"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Phone Number:</label>
                    <input
                        className="form-input"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Password:</label>
                    <input
                        className="form-input"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Confirm Password:</label>
                    <input
                        className="form-input"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                {passwordErrors.length > 0 && (
                    <div className="error-message">
                        {passwordErrors.map((error, index) => (
                            <p key={index} className="error-text">{error}</p>
                        ))}
                    </div>
                )}

                {!localStorage.getItem("userId") && (
                    <Link to="/login" className="login-link">
                        Already a user?
                    </Link>
                )}

                <button type="submit" className="submit-btn">Register</button>
            </form>
        </>

  );
}

export default Register;