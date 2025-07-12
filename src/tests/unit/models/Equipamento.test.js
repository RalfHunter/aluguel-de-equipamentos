import mongoose from 'mongoose';
import Equipamento from '../../../models/Equipamento.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Equipamento.deleteMany(); 
});

describe('Modelo Equipamento', () => {

  const baseEquipamento = {
    equiNome: 'Furadeira',
    equiDescricao: 'Furadeira industrial de alta potência',
    equiValorDiaria: 150,
    equiCategoria: 'Furadeira',
    equiFotos: [
      { url: 'foto1.jpg', largura: 800, altura: 600, tamanhoMb: 1.2 },
    ],
    equiQuantidadeDisponivel: 5,
  };

  it('Deve criar um equipamento com todos os dados válidos', async () => {
    const equipamento = new Equipamento(baseEquipamento);
    const saved = await equipamento.save();

    expect(saved._id).toBeDefined();
    expect(saved.equiNome).toBe(baseEquipamento.equiNome);
    expect(saved.equiDescricao).toBe(baseEquipamento.equiDescricao);
    expect(saved.equiCategoria).toBe(baseEquipamento.equiCategoria);
    expect(saved.equiFotos.length).toBe(1);
    expect(saved.equiStatus).toBe('pendente');
    expect(saved.equiNotaMediaAvaliacao).toBe(0);
    expect(saved.equiAvaliacoes).toEqual([]);
  });

  it('Deve permitir no máximo 5 fotos', async () => {
    const equipamento = new Equipamento({
      ...baseEquipamento,
      equiFotos: new Array(5).fill({
        url: 'foto.jpg',
        largura: 800,
        altura: 600,
        tamanhoMb: 1.0,
      }),
    });

    const saved = await equipamento.save();
    expect(saved.equiFotos.length).toBe(5);
  });

  it('Deve falhar se ultrapassar 5 fotos', async () => {
    const fotosInvalidas = new Array(6).fill({
      url: 'foto.jpg',
      largura: 800,
      altura: 600,
      tamanhoMb: 1.0,
    });

    const equipamento = new Equipamento({
      ...baseEquipamento,
      equiFotos: fotosInvalidas,
    });

    await expect(equipamento.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve falhar ao salvar sem nome', async () => {
    const dados = { ...baseEquipamento };
    delete dados.equiNome;

    await expect(new Equipamento(dados).save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve falhar ao salvar sem descrição', async () => {
    const dados = { ...baseEquipamento };
    delete dados.equiDescricao;

    await expect(new Equipamento(dados).save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve falhar ao salvar sem valor da diária', async () => {
    const dados = { ...baseEquipamento };
    delete dados.equiValorDiaria;

    await expect(new Equipamento(dados).save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve falhar ao salvar sem categoria', async () => {
    const dados = { ...baseEquipamento };
    delete dados.equiCategoria;

    await expect(new Equipamento(dados).save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve falhar ao salvar sem fotos', async () => {
    const dados = { ...baseEquipamento };
    delete dados.equiFotos;

    await expect(new Equipamento(dados).save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve falhar ao salvar com campo faltando em equiFotos', async () => {
    const dados = {
      ...baseEquipamento,
      equiFotos: [{ url: 'img.jpg', largura: 800, altura: 600 }],
    };

    await expect(new Equipamento(dados).save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve falhar ao salvar sem quantidade disponível', async () => {
    const dados = { ...baseEquipamento };
    delete dados.equiQuantidadeDisponivel;

    await expect(new Equipamento(dados).save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve salvar corretamente o status padrão como pendente', async () => {
    const saved = await new Equipamento(baseEquipamento).save();
    expect(saved.equiStatus).toBe('pendente');
  });

  it('Deve retornar todos os equipamentos cadastrados', async () => {
    await Equipamento.insertMany([
      { ...baseEquipamento, equiNome: 'Furadeira' },
      { ...baseEquipamento, equiNome: 'Serra' },
    ]);

    const equipamentos = await Equipamento.find();
    expect(equipamentos.length).toBe(2);
  });
});
