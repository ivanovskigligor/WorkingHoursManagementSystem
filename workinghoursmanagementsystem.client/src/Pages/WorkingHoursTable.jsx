import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const MonthlyWorkingHoursTable = () => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [totalMonthlyHours, setTotalMonthlyHours] = useState(0);
    const [averageDailyHours, setAverageDailyHours] = useState(0);


    useEffect(() => {
        // Get current year and month
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        // Fetch data for the entire month (assuming userId is stored in localStorage)
        const userId = localStorage.getItem("userId");

        const fetchMonthlyData = async () => {
            try {
                const response = await axios.get(`https://localhost:7022/api/workinghours/user/${userId}/month?year=${currentYear}&month=${currentMonth}`);
                setMonthlyData(response.data.workingHours);

                setTotalMonthlyHours(response.data.totalMonthlyHours);
                setAverageDailyHours(response.data.dailyAverageHours);

            } catch (error) {
                console.error("Error fetching monthly data", error);
            }
        };

        fetchMonthlyData();

        // Generate all the dates for the current month
        const daysInCurrentMonth = [];
        const numDays = moment(`${currentYear}-${currentMonth}`, "YYYY-MM").daysInMonth();
        for (let i = 1; i <= numDays; i++) {
            daysInCurrentMonth.push(moment(`${currentYear}-${currentMonth}-${i}`, "YYYY-MM-DD"));
        }
        setDaysInMonth(daysInCurrentMonth);
    }, []);

    const calculateDuration = (startTime, endTime) => {
        const start = moment(startTime, 'HH:mm:ss');
        const end = moment(endTime, 'HH:mm:ss');
        return moment.duration(end.diff(start));
    };

    return (
        <div>

            <h2>AVERAGE: {averageDailyHours}</h2>
            <h2>TOTAL: {totalMonthlyHours}</h2>
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

                        const isAbsence = entry && entry.absenceTypeName; // Check for absence

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
                                style={{ backgroundColor: isAbsence ? 'red' : 'transparent' }} // Apply red background if absence
                            >
                                <td>{index + 1}</td>
                                <td>{dateString}</td>
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
