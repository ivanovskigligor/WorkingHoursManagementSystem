import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
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

            console.log(response.data);
            console.log(formData);
            alert("Registration successful");
            navigate("/login");
        } catch (error) {

            if (error.response.data) {
                setPasswordErrors(error.response.data.map(err => err.description));
            }
        }
    }


    return (
        <>
            <form onSubmit={handleSubmit}>
                <h2>Register</h2>

                <div>
                    <label>Name:</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Job Position:</label>
                    <input
                        name="jobPosition"
                        value={formData.jobPosition}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Employment Type:</label>
                    <select
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
                    <div>
                        <label>Employment Other Comment:</label>
                        <input
                            name="employmentOtherComment"
                            value={formData.employmentOtherComment || ""}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div>
                    <label>Active Status:</label>
                    <select
                        name="activeStatus"
                        value={formData.activeStatus}
                        onChange={handleChange}
                    >
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                    </select>
                </div>

                <div>
                    <label>Username:</label>
                    <input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Phone Number:</label>
                    <input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                {passwordErrors.length > 0 && (
                    <div style={{
                        border: "1px solid red",
                        padding: "10px",
                        backgroundColor: "#ffe6e6",
                        borderRadius: "5px",
                        marginTop: "10px",
                    }}>
                        {passwordErrors.map((error, index) => (
                            <p key={index} style={{ color: "red", margin: "0" }}>{error}</p>
                        ))}
                    </div>
                )}
                {!localStorage.getItem("userId") &&

                    <Link to={"/login"}>
                    Already a user?
                </Link>}

                
                <br />
                <button type="submit">Register</button>
            </form>
        </>
  );
}

export default Register;