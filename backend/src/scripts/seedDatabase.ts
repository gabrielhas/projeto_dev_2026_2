import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function runDatabaseSeed() {
  console.log('🚀 Iniciando configuração e seed do banco de dados...');

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = Number(process.env.DB_PORT) || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'game_requests';

  let connection;

  try {
    // Conecta ao servidor MySQL (sem especificar banco para garantir que pode criar se não existir)
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true
    });

    console.log(`🔌 Conectado ao MySQL em ${dbHost}:${dbPort} como usuário '${dbUser}'.`);

    // 1. Executar schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('📄 Executando schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await connection.query(schemaSql);
      console.log('✅ Schema aplicado com sucesso (banco e tabelas prontos)!');
    } else {
      console.warn(`⚠️ Arquivo schema.sql não encontrado em: ${schemaPath}`);
    }

    // 2. Executar seed.sql
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('🌱 Executando seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf-8');
      await connection.query(seedSql);
      console.log('✅ Seed executada com sucesso (dados de teste e admin inseridos)!');
    } else {
      console.warn(`⚠️ Arquivo seed.sql não encontrado em: ${seedPath}`);
    }

    console.log('🎉 Banco de dados configurado e populado com sucesso!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Falha ao configurar/popular banco de dados:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error(`👉 Verifique se o MySQL (XAMPP, Laragon, Docker, etc.) está iniciado na porta ${dbPort}.`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 Verifique o usuário e senha configurados no arquivo backend/.env.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runDatabaseSeed();
