import axios from 'axios';

// Cria instância Axios configurada para enviar cookies HttpOnly
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para injetar token JWT do localStorage se estiver disponível (fallback de redundância)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta para tratar expiração de sessão
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 e não estiver na tela de login, limpa credenciais locais
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/admin/login')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_admin');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
