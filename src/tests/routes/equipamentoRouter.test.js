import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
const fotoPath = path.resolve('uploads/equipamentos/foto1.jpg')

dotenv.config();

let app = 'http://localhost:5011'; 
let tokenAdmin;
let tokenUser;

describe('Rotas de Equipamentos - Integração', () => {
  beforeAll(async () => {
  await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminLoginRes = await request(app)
      .post('/login')
      .send({ email: 'dev@gmail.com', senha: 'Dev@1234' });

    tokenAdmin = adminLoginRes.body?.data?.user?.accessToken;
    expect(tokenAdmin).toBeTruthy();

    const userLoginRes = await request(app)
      .post('/login')
      .send({ email: 'usuario@gmail.com', senha: 'Usuario@1234' });

    tokenUser = userLoginRes.body?.data?.user?.accessToken;
    expect(tokenUser).toBeTruthy();
  }, 20000); // ⬅️ timeout aumentado para 20 segundos

  afterAll(async () => {
    await mongoose.disconnect();
  });


const criarEquipamentoValido = async (token, override = {}) => {
  const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
  const dados = {
    equiNome: `Parafusadeira ${unique}`,
    equiDescricao: 'Descrição da parafusadeira',
    equiValorDiaria: '70',
    equiQuantidadeDisponivel: '3',
    equiCategoria: 'Parafusadeira',
    ...override,
  };

  const res = await request(app)
    .post('/equipamentos')
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'multipart/form-data')
    .field('equiNome', dados.equiNome)
    .field('equiDescricao', dados.equiDescricao)
    .field('equiValorDiaria', dados.equiValorDiaria)
    .field('equiQuantidadeDisponivel', dados.equiQuantidadeDisponivel)
    .field('equiCategoria', dados.equiCategoria)
    // Aqui você anexa uma imagem de teste. Coloque uma imagem pequena dentro da pasta de testes, ex:
    // './tests/assets/fake-image.jpg'
   .attach('equiFotos', path.resolve('uploads/equipamentos/foto1.jpg'))

  if (res.status !== 201) {
    console.error('Falha ao criar equipamento:', res.status, res.body);
    return null;
  }

  return res.body.data;
};



describe('GET /equipamentos', () => {
  it('deve listar equipamentos para usuário comum com filtro válido', async () => {
    const res = await request(app)
      .get('/equipamentos?categoria=Parafusadeira&status=ativo&minValor=10&maxValor=100&page=1&limit=5')
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data.docs || res.body.data)).toBe(true);
  });

  it('deve retornar erro 403 para usuário comum ao filtrar status pendente', async () => {
    const res = await request(app)
      .get('/equipamentos?status=pendente')
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(res.status).toBe(403);

    expect(res.body.message).toMatch(/restrito.*administradores|moderadores/i);
  });

  it('deve permitir admin filtrar status pendente', async () => {
    const res = await request(app)
      .get('/equipamentos?status=pendente')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('deve listar equipamentos sem filtros', async () => {
    const res = await request(app)
      .get('/equipamentos')
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data.docs || res.body.data)).toBe(true);
  });

  it('deve retornar erro 401 sem token', async () => {
    const res = await request(app).get('/equipamentos');

    expect(res.status).toBe(498);
    expect(res.body.message).toMatch(/token não informado/i);

  });
});


describe('GET /equipamentos/:id', () => {
  it('deve retornar equipamento por ID válido', async () => {
   const equipamento = await criarEquipamentoValido(tokenUser);
console.log('Equipamento criado:', equipamento);
expect(equipamento).not.toBeNull();


    const res = await request(app)
      .get(`/equipamentos/${equipamento._id}`)
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(equipamento._id);
    expect(res.body.data.equiNome).toMatch(/Parafusadeira/);
  });

  it('deve retornar 404 para ID inexistente', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/equipamentos/${id}`)
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/não encontrado/i);
  });

  it('deve retornar 401 sem token', async () => {
    const equipamento = await criarEquipamentoValido(tokenUser);
    expect(equipamento).not.toBeNull();
    expect(equipamento).toHaveProperty('_id');

    const res = await request(app)
      .get(`/equipamentos/${equipamento._id}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/não autorizado|token/i);
  });
});

  describe('POST /equipamentos', () => {
    it('deve criar equipamento com dados válidos', async () => {
      const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
      const dados = {
        equiNome: `Parafusadeira ${unique}`,
        equiDescricao: 'Descrição da parafusadeira',
        equiValorDiaria: '70',
        equiQuantidadeDisponivel: '3',
        equiCategoria: 'Parafusadeira',
      };

      const res = await request(app)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .set('Content-Type', 'multipart/form-data')
        .field('equiNome', dados.equiNome)
        .field('equiDescricao', dados.equiDescricao)
        .field('equiValorDiaria', dados.equiValorDiaria)
        .field('equiQuantidadeDisponivel', dados.equiQuantidadeDisponivel)
        .field('equiCategoria', dados.equiCategoria);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.equiNome).toBe(dados.equiNome);
    });
it('deve retornar 400 com dados obrigatórios ausentes', async () => {
  const res = await request(app)
    .post('/equipamentos')
    .set('Authorization', `Bearer ${tokenUser}`)
    .set('Content-Type', 'multipart/form-data');

  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/campo obrigatório|validação falhou/i);



});


    it('deve retornar 401 sem token', async () => {
      const res = await request(app)
        .post('/equipamentos')
        .set('Content-Type', 'multipart/form-data');

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/não autorizado|token/i);
    });
  });

  describe('PATCH /equipamentos/:id', () => {
    it('deve atualizar equipamento com dados válidos', async () => {
     const equipamento = await criarEquipamentoValido(tokenUser);
expect(equipamento).not.toBeNull();
expect(equipamento).toHaveProperty('_id');


      const dadosAtualizados = {
        equiNome: `${equipamento.equiNome} Atualizado`,
        equiValorDiaria: '80',
      };

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(dadosAtualizados);

      expect(res.status).toBe(200);
      expect(res.body.data.equiNome).toBe(dadosAtualizados.equiNome);
      expect(res.body.data.equiValorDiaria).toBe(80);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/equipamentos/${id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ equiNome: 'Parafusadeira' });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });

    it('deve retornar 401 sem token', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
expect(equipamento).not.toBeNull();
expect(equipamento).toHaveProperty('_id');


      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}`)
        .send({ equiNome: 'Parafusadeira' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/não autorizado|token/i);
    });
  });

  describe('PATCH /equipamentos/:id/aprovar', () => {
    it('deve aprovar equipamento como admin', async () => {
     const equipamento = await criarEquipamentoValido(tokenUser);
expect(equipamento).not.toBeNull();
expect(equipamento).toHaveProperty('_id');


      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/aprovado/i);
    });

    it('deve retornar 403 para usuário comum', async () => {
     const equipamento = await criarEquipamentoValido(tokenUser);
expect(equipamento).not.toBeNull();
expect(equipamento).toHaveProperty('_id');


      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/restrito a administradores/i);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/equipamentos/${id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });
  });

  describe('PATCH /equipamentos/:id/reprovar', () => {
    it('deve reprovar equipamento como admin', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
expect(equipamento).not.toBeNull();
expect(equipamento).toHaveProperty('_id');

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/reprovado|excluído/i);
    });

    it('deve retornar 403 para usuário comum', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
expect(equipamento).not.toBeNull();
expect(equipamento).toHaveProperty('_id');


      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/reprovar`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/restrito a administradores/i);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/equipamentos/${id}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });

    it('deve retornar 403 para equipamento já aprovado', async () => {
     const equipamento = await criarEquipamentoValido(tokenUser);
expect(equipamento).not.toBeNull();
expect(equipamento).toHaveProperty('_id');


      await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/pendentes/i);
    });
  });
  describe('PATCH /equipamentos/:id/status', () => {
  it('deve atualizar o status para "inativo" como admin', async () => {
    const equipamento = await criarEquipamentoValido(tokenUser);
    expect(equipamento).not.toBeNull();
    expect(equipamento).toHaveProperty('_id');

    const res = await request(app)
      .patch(`/equipamentos/${equipamento._id}/status`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ status: 'inativo' });

    expect(res.status).toBe(200);
    expect(res.body.data.equiStatus).toBe('inativo');
  });

  it('deve atualizar o status para "ativo" como admin', async () => {
    const equipamento = await criarEquipamentoValido(tokenUser);
    expect(equipamento).not.toBeNull();

    // Primeiro, inativa
    await request(app)
      .patch(`/equipamentos/${equipamento._id}/status`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ status: 'inativo' });

    // Depois ativa novamente
    const res = await request(app)
      .patch(`/equipamentos/${equipamento._id}/status`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ status: 'ativo' });

    expect(res.status).toBe(200);
    expect(res.body.data.equiStatus).toBe('ativo');
  });

  it('deve retornar 400 com status inválido', async () => {
    const equipamento = await criarEquipamentoValido(tokenUser);
    expect(equipamento).not.toBeNull();

    const res = await request(app)
      .patch(`/equipamentos/${equipamento._id}/status`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ status: 'desconhecido' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/status.*ativo.*inativo/i);
  });

  it('deve retornar 404 para ID inexistente', async () => {
    const idInexistente = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .patch(`/equipamentos/${idInexistente}/status`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ status: 'ativo' });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/não encontrado/i);
  });

  it('deve retornar 401 sem token', async () => {
    const equipamento = await criarEquipamentoValido(tokenUser);
    const res = await request(app)
      .patch(`/equipamentos/${equipamento._id}/status`)
      .send({ status: 'inativo' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/não autorizado|token/i);
  });

  it('deve retornar 403 para usuário comum', async () => {
    const equipamento = await criarEquipamentoValido(tokenUser);
    const res = await request(app)
      .patch(`/equipamentos/${equipamento._id}/status`)
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ status: 'inativo' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/restrito a administradores/i);
  });
});
});
