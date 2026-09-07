import request from 'supertest';
import app from '../src/app';

describe('API Health & Basic Routes Test', () => {

  describe('GET /api/health', () => {
    it('deve responder status 200 e retornar JSON com status ok', async () => {
      const res = await request(app)
        .get('/api/health');

      expect(res.status).toBe(200);

      expect(res.headers['content-type'])
        .toMatch(/json/);

      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty(
        'service',
        'game-requests-api'
      );
    });
  });


  describe('GET /api/requests', () => {
    it('deve rejeitar acesso sem token JWT', async () => {
      const res = await request(app)
        .get('/api/requests');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('message');

      expect(res.body.message)
        .toMatch(/não autorizado/i);
    });
  });


  describe('POST /api/requests', () => {
    it('deve rejeitar uma solicitação com dados inválidos', async () => {
      const res = await request(app)
        .post('/api/requests')
        .send({
          name: '',
          email: 'invalid-email',
          gameName: ''
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('message');
    });
  });


  describe('POST /api/auth/login', () => {
    it('deve rejeitar login com body vazio', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('message');
    });
  });

});