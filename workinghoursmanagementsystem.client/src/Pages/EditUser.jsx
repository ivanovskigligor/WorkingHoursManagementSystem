import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

function EditUser() {
    const { userId } = useParams();
    const [userData, setUserData] = useState({
        email: '',
        phoneNumber: '',
        jobPosition: '',
        employmentType: '',
        employmentOtherComment: '',
        activeStatus: false,
        name: ''
    });
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {

        axios.get(`https://localhost:7022/api/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
        })
            .then(response => {
                setUserData(response.data)
                setUserRole(localStorage.getItem("roles"))
            })
            .catch(error => console.error(error));
    }, [userId]);


const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "employmentType" && value !== "Other") {
        setUserData(prevData => ({
            ...prevData,
            [name]: value,
            employmentOtherComment: ''  
        }));
    } else {
        setUserData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    }
};

const handleSubmit = (e) => {
    e.preventDefault();

    axios.put(`https://localhost:7022/api/user/${userId}`, userData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
    })
        .then(response => {
            alert('User updated successfully');
        })
        .catch(error => {
            console.error('Error', error);
        });
};
    const handleAssignAdmin = () => {
        axios.post(`https://localhost:7022/api/admin/assign-admin`, { userId: userId }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
        })
            .then(response => {
                alert("Admin has been assigned");
            })
            .catch(error => {
            console.error(error);
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Phone Number:</label>
                <input
                    type="text"
                    name="phoneNumber"
                    value={userData.phoneNumber}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Job Position:</label>
                <input
                    type="text"
                    name="jobPosition"
                    value={userData.jobPosition}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Employment Type:</label>
                <select
                    name="employmentType"
                    value={userData.employmentType}
                    onChange={handleChange}
                >
                    <option value="Permanent">Permanent</option>
                    <option value="FixedTerm">FixedTerm</option>
                    <option value="Student">Student</option>
                    <option value="Contracted">Contracted</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {userData.employmentType === "Other" && (<div>
                <label>Employment Other Comment:</label>
                <input
                    type="text"
                    name="employmentOtherComment"
                    value={userData.employmentOtherComment}
                    onChange={handleChange}
                />
            </div>) 
            }
            
            <div>
                <label>Active Status:</label>
                <input
                    type="checkbox"
                    name="activeStatus"
                    checked={userData.activeStatus}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                />
            </div>

            {userRole === "Admin" && (
                <div>
                    <button type="button" onClick={handleAssignAdmin}>Make this user an admin</button>
                </div>
            )}

            <button type="submit">Update User</button>
        </form>
    );
}

export default EditUser;
