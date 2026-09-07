-- ==========================================================
-- Seed: game_requests
-- Dados iniciais para ambiente de desenvolvimento/teste
-- ==========================================================

USE `game_requests`;

-- Inserir administrador padrão ativo
-- Senha padrão de desenvolvimento: "Admin@123"
-- O hash abaixo foi gerado com bcrypt (10 rounds) para a senha "Admin@123".
INSERT INTO `admins` (`name`, `email`, `password`, `is_active`)
VALUES (
    'Administrador Master',
    'admin@gamerequests.com',
    '$2b$10$bYk9jVdEreE2K0G3rZ6KDejI7m50p0OqZ1qC4Xy9F1s5D6e7P8y3u',
    TRUE
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `is_active` = VALUES(`is_active`);

-- Inserir solicitações iniciais de exemplo com plataformas
INSERT INTO `requests` (`name`, `email`, `game_name`, `platform`, `status`, `created_at`)
VALUES
    ('Lucas Alcantara', 'lucas.alcantara@email.com', 'Elden Ring: Shadow of the Erdtree', 'PS5', 'pending', NOW() - INTERVAL 5 HOUR),
    ('Beatriz Lima', 'beatriz.lima@email.com', 'Cyberpunk 2077: Phantom Liberty', 'Xbox Series', 'approved', NOW() - INTERVAL 1 DAY),
    ('Rodrigo Santos', 'rodrigo.santos@email.com', 'Grand Theft Auto VI', 'PS5', 'pending', NOW() - INTERVAL 2 DAY),
    ('Mariana Costa', 'mariana.costa@email.com', 'The Legend of Zelda: Tears of the Kingdom', 'Nintendo', 'completed', NOW() - INTERVAL 3 DAY),
    ('Felipe Oliveira', 'felipe.oliveira@email.com', 'Super Mario Bros. Wonder', 'Nintendo', 'pending', NOW() - INTERVAL 4 DAY),
    ('Camila Souza', 'camila.souza@email.com', 'Black Myth: Wukong', 'PS5', 'rejected', NOW() - INTERVAL 5 DAY),
    ('Gabriel Ferreira', 'gabriel.ferreira@email.com', 'Forza Horizon 5', 'Xbox Series', 'completed', NOW() - INTERVAL 6 DAY),
    ('Juliana Martins', 'juliana.martins@email.com', 'God of War Ragnarök', 'PS4', 'approved', NOW() - INTERVAL 7 DAY),
    ('Thiago Mendes', 'thiago.mendes@email.com', 'Monster Hunter Wilds', 'PS5', 'pending', NOW() - INTERVAL 8 DAY),
    ('Larissa Rocha', 'larissa.rocha@email.com', 'Halo Infinite', 'Xbox Series', 'approved', NOW() - INTERVAL 9 DAY),
    ('Mateus Barbosa', 'mateus.barbosa@email.com', 'Pokemon Scarlet/Violet', 'Nintendo', 'pending', NOW() - INTERVAL 10 DAY),
    ('Amanda Pereira', 'amanda.pereira@email.com', 'Bloodborne', 'PS4', 'rejected', NOW() - INTERVAL 11 DAY);
