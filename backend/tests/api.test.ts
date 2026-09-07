import request from 'supertest';
import app from '../src/app';

describe('API Health & Basic Routes Test', () => {
  it('GET /api/health deve responder status 200 e json', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'game-requests-api');
  });

  it('GET /api/requests deve rejeitar acesso sem token JWT (401)', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/não autorizado/i);
  });

  it('POST /api/requests com payload inválido deve retornar 400', async () => {
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

  it('POST /api/auth/login com body vazio deve retornar 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
