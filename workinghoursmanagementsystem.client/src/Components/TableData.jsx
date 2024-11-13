import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function TableData() {

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("jwt");

        axios.get("https://localhost:7022/api/table", {
            withCredentials: true,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(response => {
            setTableData(response.data);
            setLoading(false);
            console.log(response.data);
            console.log("table data fetched")
        })
            .catch(error => {
                console.error('Error fetching table data:', error);
                setLoading(true);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>
    }
  return (
      <>
          <table>
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
                  {tableData.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.email}</td>
                    <td>{(user.employmentOtherComment !== null && user.employmentOtherComment !== '') ? user.employmentOtherComment : user.employmentType}</td>
                    <td>{user.jobPosition}</td>
                    <td>{user.activeStatus ? "DA" : "NE"}</td>
                    <td>
                        <Link to={`/edit-user/${user.id}`}>Edit User</Link>
                    </td>
                  </tr>
                  ))}
              </tbody>
          </table>
      </>
  );
}

export default TableData;