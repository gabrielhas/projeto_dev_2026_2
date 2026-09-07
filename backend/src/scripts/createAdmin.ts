import { initializeDatabase } from '../config/database';
import { AdminModel } from '../models/adminModel';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function runCreateAdmin() {
  console.log('🌱 Executando script de criação/verificação de Administrador...');
  try {
    await initializeDatabase();

    const name = process.env.ADMIN_NAME || 'Administrador Master';
    const email = (process.env.ADMIN_EMAIL || 'admin@gamerequests.com').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existingAdmin = await AdminModel.findByEmail(email);

    if (existingAdmin) {
      console.log(`ℹ️ Administrador já existe com o e-mail: ${email}`);
      console.log('Atualizando credenciais e garantindo status is_active = TRUE...');
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      await pool.query(
        'UPDATE admins SET name = ?, password = ?, is_active = TRUE WHERE id = ?',
        [name, hashedPassword, existingAdmin.id]
      );
      console.log('✅ Administrador atualizado e reativado com sucesso!');
    } else {
      await AdminModel.create(name, email, password, true);
      console.log(`✅ Novo administrador criado com sucesso e ATIVO por padrão! E-mail: ${email}`);
    }

    console.log('🎉 Operação concluída com sucesso!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro durante execução do script createAdmin:', error.message);
    process.exit(1);
  }
}

runCreateAdmin();
