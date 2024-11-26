import React, { useState, useEffect } from 'react';
import './DigitalClock.css';

const DigitalClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatNumber = (number) => {
        return number.toString().padStart(2, '0');
    };

    const hours = formatNumber(time.getHours());
    const minutes = formatNumber(time.getMinutes());
    const seconds = formatNumber(time.getSeconds());

    return (
        <div className="digital-clock">
            <div className="clock-container">
                <div className="time-section">
                    <div className="time-display">
                        <div className="time-segment">{hours[0]}</div>
                        <div className="time-segment">{hours[1]}</div>
                    </div>
                    <span className="time-label">Horas</span>
                </div>
                <div className="separator">:</div>
                <div className="time-section">
                    <div className="time-display">
                        <div className="time-segment">{minutes[0]}</div>
                        <div className="time-segment">{minutes[1]}</div>
                    </div>
                    <span className="time-label">Minutos</span>
                </div>
                <div className="separator">:</div>
                <div className="time-section">
                    <div className="time-display">
                        <div className="time-segment">{seconds[0]}</div>
                        <div className="time-segment">{seconds[1]}</div>
                    </div>
                    <span className="time-label">Segundos</span>
                </div>
            </div>
            <div className="date-display">
                {time.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}
            </div>
        </div>
    );
};

export default DigitalClock;
