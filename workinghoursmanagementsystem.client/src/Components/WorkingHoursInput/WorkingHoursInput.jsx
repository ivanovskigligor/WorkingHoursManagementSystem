import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import {useLocation} from 'react-router-dom';
import "./WorkingHoursInput.css"

const localizer = momentLocalizer(moment);

const WorkingHoursInput = () => {

    const location = useLocation();

    const [formData, setFormData] = useState({
        UserId: localStorage.getItem("userId"),
        Date: new Date(), 
        ArrivalTime: '',
        DepartureTime: '',
        LunchStartTime: '',
        LunchEndTime: '',
        AbsenceTypeId: null,
    });

    const fetchWorkingHours = async (date) => {
        try {
            const response = await axios.get(`https://localhost:7022/api/workinghours/user/${formData.UserId}?date=${date}`);
            if (response.data[0]) {
                setFormData((prevData) => ({
                    ...prevData,
                    ArrivalTime: response.data[0].arrivalTime,
                    DepartureTime: response.data[0].departureTime,
                    LunchStartTime: response.data[0].lunchStartTime,
                    LunchEndTime: response.data[0].lunchEndTime,
                    AbsenceTypeId: response.data[0].absenceTypeId || null,
                }));
                console.log(date);
            }
        } catch (error) {
            console.error("Error", error);
        }
    };

    // use for WorkingHoursTable date link
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const selectedDate = queryParams.get("date");

        if (selectedDate) {
            const selectedDateObj = new Date(selectedDate);
            if (selectedDateObj.toISOString().split('T')[0] !== formData.Date.toISOString().split('T')[0]) {
                setFormData((prevData) => ({
                    ...prevData,
                    Date: selectedDateObj,
                }));
            }
        } else {
            const today = new Date();
            if (today.toISOString().split('T')[0] !== formData.Date.toISOString().split('T')[0]) {
                setFormData((prevData) => ({
                    ...prevData,
                    Date: today,
                }));
            }
        }
    }, [location.search]); 

    // use for date selection
    useEffect(() => {
        const formattedDate =
            formData.Date instanceof Date
                ? formData.Date.toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
        fetchWorkingHours(formattedDate);
    }, [formData.Date]); 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const fixTime = (time) => {
        if (time.length === 5) {
            return time + ":00";
        }
        return time;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        let payload = { ...formData };

        if (!payload.AbsenceTypeId) {
            payload = {
                ...payload,
                ArrivalTime: fixTime(payload.ArrivalTime),
                DepartureTime: fixTime(payload.DepartureTime),
                LunchStartTime: fixTime(payload.LunchStartTime),
                LunchEndTime: fixTime(payload.LunchEndTime),
            };
            delete payload.AbsenceTypeId;
        } else {
            payload = {
                ...payload,
                ArrivalTime: "00:00:00.0000000",
                DepartureTime: "00:00:00.0000000",
                LunchStartTime: "00:00:00.0000000",
                LunchEndTime: "00:00:00.0000000",
            };
        }


        try {
            await axios.put('https://localhost:7022/api/workinghours/', payload);
            alert('Working hours logged successfully!');
        } catch (error) {
            console.error(error);
            alert('Error logging working hours.');
        }
    };

 
    const handleDateSelect = (date) => {

        const day = date.getDay();
        if (day !== 0 && day !== 6) {
            const selectedDateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            setFormData((prevData) => ({ ...prevData, Date: selectedDateUTC }));
        }
    };

  
    return (
        <div className="working-hours-container">
            <h2>Log Working Hours</h2>

            <Calendar
                localizer={localizer}
                defaultDate={new Date()}
                onSelectSlot={(slotInfo) => handleDateSelect(slotInfo.start)} 
                selectable
                views={{ month: true }}
                style={{ height: '500px', width: '1000px', marginBottom: '20px' }}
            />

            <form onSubmit={handleSubmit}>

                <span>Date Selected: {formData.Date.toISOString().split('T')[0]} <br/></span>
                <label>Arrival Time</label>
                <input type="time" name="ArrivalTime" value={formData.ArrivalTime} onChange={handleInputChange} required disabled={formData.AbsenceTypeId !== null && formData.AbsenceTypeId !== ''} />
                <br />

                <label>Departure Time</label>
                <input type="time" name="DepartureTime" value={formData.DepartureTime} onChange={handleInputChange} required disabled={formData.AbsenceTypeId !== null && formData.AbsenceTypeId !== ''} />
                <br />

                <label>Lunch Start Time</label>
                <input type="time" name="LunchStartTime" value={formData.LunchStartTime} onChange={handleInputChange} disabled={formData.AbsenceTypeId !== null && formData.AbsenceTypeId !== ''} />
                <br />

                <label>Lunch End Time</label>
                <input type="time" name="LunchEndTime" value={formData.LunchEndTime} onChange={handleInputChange} disabled={formData.AbsenceTypeId !== null && formData.AbsenceTypeId !== ''} />
                <br />

                <label>Absence Type</label>
                <select name="AbsenceTypeId" value={formData.AbsenceTypeId || ''} onChange={handleInputChange}>
                    <option value="">Select Absence Type</option>
                    <option value="1">Leave</option>
                    <option value="2">Sick Leave</option>
                    <option value="3">Child Care</option>
                    <option value="4">Personal Leave</option>
                </select>
                <br />

                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default WorkingHoursInput;
