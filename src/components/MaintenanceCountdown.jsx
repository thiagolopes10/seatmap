import React, { useState, useEffect } from 'react';

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

    return (
        <div className="maintenance-countdown">
            <h2>Próxima Manutenção Geral</h2>
            <div className="countdown-container">
                <div className="countdown-item">
                    <span className="countdown-value">{timeLeft.days}</span>
                    <span className="countdown-label">Dias</span>
                </div>
                <div className="countdown-item">
                    <span className="countdown-value">{timeLeft.hours}</span>
                    <span className="countdown-label">Horas</span>
                </div>
                <div className="countdown-item">
                    <span className="countdown-value">{timeLeft.minutes}</span>
                    <span className="countdown-label">Minutos</span>
                </div>
                <div className="countdown-item">
                    <span className="countdown-value">{timeLeft.seconds}</span>
                    <span className="countdown-label">Segundos</span>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceCountdown;
