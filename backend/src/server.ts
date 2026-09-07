import app from './app';
import { initializeDatabase } from './config/database';
import { AdminModel } from './models/adminModel';

const PORT = Number(process.env.PORT) || 3001;

async function startServer() {
  try {
    // 1. Inicializar e testar conexão com o banco de dados MySQL
    await initializeDatabase();

    // 2. Realizar seed automático do administrador inicial se necessário
    await AdminModel.seedDefaultAdmin();

    // 3. Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
      console.log(`📡 URL da API: http://localhost:${PORT}`);
      console.log(`🎮 Painel Admin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/login`);
    });
  } catch (error: any) {
    console.error('❌ Falha crítica ao iniciar o servidor:', error.message);
    process.exit(1);
  }
}

startServer();
