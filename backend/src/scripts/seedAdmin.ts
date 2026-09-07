import { initializeDatabase } from '../config/database';
import { AdminModel } from '../models/adminModel';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function runSeed() {
  console.log('🌱 Iniciando script de seed de administrador...');
  try {
    await initializeDatabase();

    const name = process.env.ADMIN_NAME || 'Administrador Master';
    const email = (process.env.ADMIN_EMAIL || 'admin@gamerequests.com').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existingAdmin = await AdminModel.findByEmail(email);

    if (existingAdmin) {
      console.log(`ℹ️ Administrador já existe com o e-mail: ${email}`);
      console.log('Atualizando senha conforme variável de ambiente ADMIN_PASSWORD...');
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      await pool.query(
        'UPDATE admins SET name = ?, password = ? WHERE id = ?',
        [name, hashedPassword, existingAdmin.id]
      );
      console.log('✅ Senha do administrador atualizada com sucesso!');
    } else {
      await AdminModel.create(name, email, password);
      console.log(`✅ Novo administrador criado com sucesso! E-mail: ${email}`);
    }

    console.log('🎉 Processo de seed finalizado com sucesso!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro durante execução do seed:', error.message);
    process.exit(1);
  }
}

runSeed();
