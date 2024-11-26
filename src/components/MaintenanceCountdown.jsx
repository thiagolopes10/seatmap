import React, { useState, useEffect } from 'react';
import './MaintenanceCountdown.css';

const MaintenanceCountdown = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const currentYear = now.getFullYear();
            // Define o próximo junho (dia 1 às 00:00)
            let maintenanceDate = new Date(currentYear, 5, 1); // Mês 5 = Junho (0-based)
            
            // Se junho já passou este ano, use junho do próximo ano
            if (now > maintenanceDate) {
                maintenanceDate = new Date(currentYear + 1, 5, 1);
            }

            const difference = maintenanceDate - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
            }
        };

        // Atualiza a cada segundo
        const timer = setInterval(calculateTimeLeft, 1000);

        // Cleanup
        return () => clearInterval(timer);
    }, []);

    const formatNumber = (num) => {
        return num.toString().padStart(2, '0');
    };

    return (
        <div className="maintenance-countdown">
            <div className="countdown-title">Próxima Manutenção Geral</div>
            <div className="digital-countdown">
                <div className="countdown-section">
                    <div className="digit-group">
                        <div className="digit">{formatNumber(timeLeft.days)}</div>
                        <div className="digit-label">dias</div>
                    </div>
                    <div className="separator">:</div>
                    <div className="digit-group">
                        <div className="digit">{formatNumber(timeLeft.hours)}</div>
                        <div className="digit-label">horas</div>
                    </div>
                    <div className="separator">:</div>
                    <div className="digit-group">
                        <div className="digit">{formatNumber(timeLeft.minutes)}</div>
                        <div className="digit-label">min</div>
                    </div>
                    <div className="separator">:</div>
                    <div className="digit-group">
                        <div className="digit">{formatNumber(timeLeft.seconds)}</div>
                        <div className="digit-label">seg</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceCountdown;
