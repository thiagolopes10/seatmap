CREATE TABLE seats (
    id VARCHAR(10) PRIMARY KEY,
    seatId VARCHAR(10) NOT NULL,
    status ENUM('good', 'minor', 'urgent') NOT NULL,
    observation TEXT,
    lastUpdate TIMESTAMP NOT NULL
);