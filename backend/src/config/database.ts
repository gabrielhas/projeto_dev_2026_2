import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'game_requests',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Inicializa e verifica as tabelas no banco de dados automaticamente se não existirem.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    
    // 1. Criar tabela admins se não existir
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`last_login\` TIMESTAMP NULL,
        INDEX \`idx_admins_email\` (\`email\`),
        INDEX \`idx_admins_is_active\` (\`is_active\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Criar tabela requests se não existir
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`requests\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL,
        \`game_name\` VARCHAR(200) NOT NULL,
        \`platform\` ENUM('PS4', 'PS5', 'Xbox Series', 'Nintendo') NOT NULL,
        \`status\` ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_requests_platform\` (\`platform\`),
        INDEX \`idx_requests_status\` (\`status\`),
        INDEX \`idx_requests_created_at\` (\`created_at\`),
        INDEX \`idx_requests_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Migrações seguras idempotentes para adicionar colunas se a tabela foi criada numa versão anterior
    try {
      await connection.query(`
        ALTER TABLE \`requests\` 
        ADD COLUMN IF NOT EXISTS \`platform\` ENUM('PS4', 'PS5', 'Xbox Series', 'Nintendo') NOT NULL DEFAULT 'PS5' AFTER \`game_name\`;
      `);
    } catch {
      // Ignora se já existe ou versão do MySQL não suporta IF NOT EXISTS em ALTER
    }

    try {
      await connection.query(`
        ALTER TABLE \`requests\` 
        MODIFY COLUMN \`status\` ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending';
      `);
    } catch {
      // Ignora erro se já estiver modificado
    }

    try {
      await connection.query(`
        ALTER TABLE \`admins\` 
        ADD COLUMN IF NOT EXISTS \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE AFTER \`password\`,
        ADD COLUMN IF NOT EXISTS \`last_login\` TIMESTAMP NULL AFTER \`updated_at\`;
      `);
    } catch {
      // Ignora erro de coluna existente
    }

    connection.release();
    console.log('✅ Banco de dados MySQL conectado e esquemas verificados com sucesso.');
  } catch (error: any) {
    console.error('❌ Erro ao conectar ou inicializar banco de dados:', error.message);
    throw error;
  }
}

export default pool;
