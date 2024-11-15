import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import "./TableData.css"
function TableData() {

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState(false);
    const [userId, setUserId] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('active')

    useEffect(() => {
        
        const token = localStorage.getItem("jwt");
        const admins = localStorage.getItem("roles");
        const usersId = localStorage.getItem("userId");

        axios.get("https://localhost:7022/api/table", {

            withCredentials: true,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(response => {
            setTableData(response.data);
            setUserId(usersId);
            if (admins == "Admin") {
                setAdmin(true);
            }
            
            setLoading(false);
        })
            .catch(error => {
                console.error('Error fetching table data:', error);
                setLoading(true);
            });
    }, []);

    const filterData = tableData.filter((user) => {
        const searchLowerCase = searchQuery.toLowerCase();

        const searchFilter = (

            user.name.toLowerCase().includes(searchLowerCase) ||
            user.phoneNumber.toLowerCase().includes(searchLowerCase) ||
            user.email.toLowerCase().includes(searchLowerCase) ||
            user.employmentType.toLowerCase().includes(searchLowerCase) ||
            (user.employmentOtherComment && user.employmentOtherComment.toLowerCase().includes(searchLowerCase)) ||
            user.jobPosition.toLowerCase().includes(searchLowerCase)
        )

        const matchesFilter = (
            filter === "all" ||
            (filter === "active" && user.activeStatus) ||
            (filter === "inactive" && !user.activeStatus)
        );

        return searchFilter && matchesFilter

    });

    if (loading) {
        return <div>Loading...</div>
    }


  return (
      <>
          
          <div className="search-container">
              <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
              {admin && <Link to="/register"><button>Add User</button></Link>}
          </div>

          <div className="filter-container">
              <label>
                  <input
                      type="radio"
                      value="all"
                      checked={filter === 'all'}
                      onChange={() => setFilter('all')}
                  />
                  All
              </label>
              <label>
                  <input
                      type="radio"
                      value="active"
                      checked={filter === 'active'}
                      onChange={() => setFilter('active')}
                  />
                  Active Only
              </label>
              <label>
                  <input
                      type="radio"
                      value="inactive"
                      checked={filter === 'inactive'}
                      onChange={() => setFilter('inactive')}
                  />
                  Inactive Only
              </label>
          </div>
            
          <table className="table-container">
              <thead>
                  <tr>
                      <th>Ime uporabnika</th>
                      <th>Telefon</th>
                      <th>e - mail</th>
                      <th>Vrsta zaposlitve</th>
                      <th>Delovno mesto</th>
                      <th>Aktiven</th>
                  </tr>
              </thead>
              <tbody>
                  {filterData.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.email}</td>
                    <td>{(user.employmentOtherComment !== null && user.employmentOtherComment !== '') ? user.employmentOtherComment : user.employmentType}</td>
                    <td>{user.jobPosition}</td>
                    <td>{user.activeStatus ? "DA" : "NE"}</td>
                    <td>
                        {(admin || userId === user.id) ? (
                            <Link to={`/edit-user/${user.id}`}>Edit User</Link>
                        ) : ("Edit User")}
                    </td>
                  </tr>
                  ))}
              </tbody>
          </table>
      </>
  );
}

export default TableData;