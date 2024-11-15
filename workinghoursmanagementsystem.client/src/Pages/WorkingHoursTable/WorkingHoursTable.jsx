import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import "./WorkingHoursTable.css"

const MonthlyWorkingHoursTable = () => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [totalMonthlyHours, setTotalMonthlyHours] = useState(0);
    const [averageDailyHours, setAverageDailyHours] = useState(0);
    const [currentMonth, setCurrentMonth] = useState(moment().month() + 1); // Current month (1-12)
    const [currentYear, setCurrentYear] = useState(moment().year()); // Current year

    useEffect(() => {
        const fetchMonthlyData = async () => {
            const userId = localStorage.getItem("userId");

            try {
                const response = await axios.get(`https://localhost:7022/api/workinghours/user/${userId}/month?year=${currentYear}&month=${currentMonth}`);
                setMonthlyData(response.data.workingHours);
                setTotalMonthlyHours(response.data.totalMonthlyHours);
                setAverageDailyHours(response.data.dailyAverageHours);
            } catch (error) {
                console.error("Error", error);
            }
        };

        fetchMonthlyData();

        // generate days in current month workaround
        const daysInCurrentMonth = [];
        const numDays = moment(`${currentYear}-${currentMonth}`, "YYYY-MM").daysInMonth();
        for (let i = 1; i <= numDays; i++) {
            daysInCurrentMonth.push(moment(`${currentYear}-${currentMonth}-${i}`, "YYYY-MM-DD"));
        }
        setDaysInMonth(daysInCurrentMonth);
    }, [currentMonth, currentYear]); 

    const calculateDuration = (startTime, endTime) => {
        const start = moment(startTime, 'HH:mm:ss');
        const end = moment(endTime, 'HH:mm:ss');
        return moment.duration(end.diff(start));
    };

    const exportToExcel = async () => {
        const userId = localStorage.getItem("userId");

        try {
            const response = await axios.get(
                `https://localhost:7022/api/workinghours/user/${userId}/month/export?year=${currentYear}&month=${currentMonth}`,
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `WorkingHours_${userId}_${currentYear}_${currentMonth}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error", error);
        }
    };

    const handlePreviousMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    return (
        <div className="monthly-hours-container">
            <h2>Month average daily hours: {averageDailyHours}</h2>
            <h2>Total month hours: {totalMonthlyHours}</h2>
            <button onClick={exportToExcel}>Export to Excel</button>

            <div className="button-group">
                <button onClick={handlePreviousMonth}>Previous Month</button>
                <span className="date-section">{moment(`${currentYear}-${currentMonth}`, 'YYYY-MM').format('MMMM YYYY')}</span>
                <button onClick={handleNextMonth} disabled={currentYear === moment().year() && currentMonth === moment().month() + 1}>Next Month</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Status</th>
                        <th>Arrival Time</th>
                        <th>Departure Time</th>
                        <th>Total Time</th>
                        <th>Lunch Start Time</th>
                        <th>Lunch End Time</th>
                        <th>Lunch Duration</th>
                        <th>Lunch Overtime</th>
                    </tr>
                </thead>
                <tbody>
                    {daysInMonth.map((date, index) => {
                        const dateString = date.format('YYYY-MM-DD');
                        const entry = monthlyData.find(entry => moment(entry.date).isSame(date, 'day'));

                        const isAbsence = entry && entry.absenceTypeName;

                        const arrivalTime = isAbsence ? '' : (entry ? entry.arrivalTime : '');
                        const departureTime = isAbsence ? '' : (entry ? entry.departureTime : '');
                        const lunchStartTime = isAbsence ? '' : (entry ? entry.lunchStartTime : '');
                        const lunchEndTime = isAbsence ? '' : (entry ? entry.lunchEndTime : '');

                        const totalTime = isAbsence ? moment.duration(0) : (entry ? calculateDuration(arrivalTime, departureTime) : moment.duration(0));
                        const lunchDuration = isAbsence ? moment.duration(0) : (entry ? calculateDuration(lunchStartTime, lunchEndTime) : moment.duration(0));
                        const lunchOvertime = isAbsence ? 0 : (entry ? Math.max(0, lunchDuration.asMinutes() - 30) : 0);

                        return (
                            <tr
                                key={index}
                                className={`regular-row ${isAbsence ? 'absence-row' : ''}`}
                            >
                                <td>{index + 1}</td>
                                <td><Link to={`/post-working-hours?date=${dateString}`}>{dateString}</Link></td>
                                <td>{date.format('dddd')}</td>
                                <td>{date.day() === 0 || date.day() === 6 ? 'Weekend' : 'Weekday'}</td>
                                <td>{arrivalTime}</td>
                                <td>{departureTime}</td>
                                <td>{totalTime.hours() > 0 ? `${totalTime.hours()}h ${totalTime.minutes()}m` : ''}</td>
                                <td>{lunchStartTime}</td>
                                <td>{lunchEndTime}</td>
                                <td>{lunchDuration.hours() > 0 ? `${lunchDuration.hours()}h ${lunchDuration.minutes()}m` : ''}</td>
                                <td>{lunchOvertime > 0 ? `${Math.floor(lunchOvertime)} mins` : ''}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

    );
};

export default MonthlyWorkingHoursTable;
