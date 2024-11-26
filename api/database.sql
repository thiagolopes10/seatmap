-- Criação da tabela de assentos
CREATE TABLE IF NOT EXISTS seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seatId VARCHAR(10) NOT NULL UNIQUE,
    status ENUM('good', 'minor', 'urgent') DEFAULT 'good',
    observation TEXT,
    lastUpdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserção das cadeiras (de A1 até E10, total de 50 cadeiras)
INSERT IGNORE INTO seats (seatId, status, observation) VALUES
-- Fileira A
('A1', 'good', ''),
('A2', 'good', ''),
('A3', 'good', ''),
('A4', 'good', ''),
('A5', 'good', ''),
('A6', 'good', ''),
('A7', 'good', ''),
('A8', 'good', ''),
('A9', 'good', ''),
('A10', 'good', ''),
-- Fileira B
('B1', 'good', ''),
('B2', 'good', ''),
('B3', 'good', ''),
('B4', 'good', ''),
('B5', 'good', ''),
('B6', 'good', ''),
('B7', 'good', ''),
('B8', 'good', ''),
('B9', 'good', ''),
('B10', 'good', ''),
-- Fileira C
('C1', 'good', ''),
('C2', 'good', ''),
('C3', 'good', ''),
('C4', 'good', ''),
('C5', 'good', ''),
('C6', 'good', ''),
('C7', 'good', ''),
('C8', 'good', ''),
('C9', 'good', ''),
('C10', 'good', ''),
-- Fileira D
('D1', 'good', ''),
('D2', 'good', ''),
('D3', 'good', ''),
('D4', 'good', ''),
('D5', 'good', ''),
('D6', 'good', ''),
('D7', 'good', ''),
('D8', 'good', ''),
('D9', 'good', ''),
('D10', 'good', ''),
-- Fileira E
('E1', 'good', ''),
('E2', 'good', ''),
('E3', 'good', ''),
('E4', 'good', ''),
('E5', 'good', ''),
('E6', 'good', ''),
('E7', 'good', ''),
('E8', 'good', ''),
('E9', 'good', ''),
('E10', 'good', '');
