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

  it('Deve criar um equipamento com os dados obrigatórios corretamente', async () => {
    const equipamento = new Equipamento({
      equiNome: 'Furadeira',
      equiDescricao: 'Furadeira industrial de alta potência',
      equiValorDiaria: 150,
      equiCategoria: 'Ferramentas',
      equiFotos: [
        { url: 'foto1.jpg', largura: 800, altura: 600, tamanhoMb: 1.2 },
        { url: 'foto2.jpg', largura: 800, altura: 600, tamanhoMb: 1.4 },
      ],
      equiQuantidadeDisponivel: 5,
    });

    const saved = await equipamento.save();

    expect(saved._id).toBeDefined();
    expect(saved.equiNome).toBe('Furadeira');
    expect(saved.equiDescricao).toBe('Furadeira industrial de alta potência');
    expect(saved.equiValorDiaria).toBe(150);
    expect(saved.equiCategoria).toBe('Ferramentas');
    expect(saved.equiFotos.length).toBe(2);
    expect(saved.equiQuantidadeDisponivel).toBe(5);
    expect(saved.equiStatus).toBe('pendente'); 
    expect(saved.equiNotaMediaAvaliacao).toBe(0); 
    expect(saved.equiAvaliacoes).toEqual([]); 
  });

  it('Deve falhar ao salvar equipamento sem nome', async () => {
    await expect(
      new Equipamento({
        equiDescricao: 'Equipamento sem nome',
        equiValorDiaria: 100,
        equiCategoria: 'Ferramentas',
        equiFotos: [{ url: 'foto.jpg', largura: 800, altura: 600, tamanhoMb: 1.2 }],
        equiQuantidadeDisponivel: 3,
      }).save()
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve falhar ao salvar equipamento sem descrição', async () => {
    await expect(
      new Equipamento({
        equiNome: 'Serra elétrica',
        equiValorDiaria: 90,
        equiCategoria: 'Ferramentas',
        equiFotos: [{ url: 'foto.jpg', largura: 800, altura: 600, tamanhoMb: 1.2 }],
        equiQuantidadeDisponivel: 2,
      }).save()
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve falhar ao salvar equipamento sem valor da diária', async () => {
    await expect(
      new Equipamento({
        equiNome: 'Serra elétrica',
        equiDescricao: 'Serra elétrica potente',
        equiCategoria: 'Ferramentas',
        equiFotos: [{ url: 'foto.jpg', largura: 800, altura: 600, tamanhoMb: 1.2 }],
        equiQuantidadeDisponivel: 2,
      }).save()
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve falhar ao salvar equipamento sem categoria', async () => {
    await expect(
      new Equipamento({
        equiNome: 'Serra elétrica',
        equiDescricao: 'Serra elétrica potente',
        equiValorDiaria: 90,
        equiFotos: [{ url: 'foto.jpg', largura: 800, altura: 600, tamanhoMb: 1.2 }],
        equiQuantidadeDisponivel: 2,
      }).save()
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve falhar ao salvar equipamento sem fotos', async () => {
    await expect(
      new Equipamento({
        equiNome: 'Serra elétrica',
        equiDescricao: 'Serra elétrica potente',
        equiValorDiaria: 90,
        equiCategoria: 'Ferramentas',
        equiQuantidadeDisponivel: 2,
      }).save()
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve falhar ao salvar equipamento sem quantidade disponível', async () => {
    await expect(
      new Equipamento({
        equiNome: 'Serra elétrica',
        equiDescricao: 'Serra elétrica potente',
        equiValorDiaria: 90,
        equiCategoria: 'Ferramentas',
        equiFotos: [{ url: 'foto.jpg', largura: 800, altura: 600, tamanhoMb: 1.2 }],
      }).save()
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('Deve definir status como false por padrão', async () => {
    const equipamento = new Equipamento({
      equiNome: 'Betoneira',
      equiDescricao: 'Betoneira de 400 litros',
      equiValorDiaria: 200,
      equiCategoria: 'Construção',
      equiFotos: [{ url: 'foto.jpg', largura: 800, altura: 600, tamanhoMb: 1.2 }],
      equiQuantidadeDisponivel: 1,
    });

    const saved = await equipamento.save();

    expect(saved.equiStatus).toBe('pendente');
  });

  it('Deve criar equipamento com campo equiNotaMediaAvaliacao como 0 por padrão', async () => {
    const equipamento = new Equipamento({
      equiNome: 'Compressor de Ar',
      equiDescricao: 'Compressor de ar industrial 50L',
      equiValorDiaria: 180,
      equiCategoria: 'Industrial',
      equiFotos: [{ url: 'foto.jpg', largura: 800, altura: 600, tamanhoMb: 1.2 }],
      equiQuantidadeDisponivel: 3,
    });

    const saved = await equipamento.save();

    expect(saved.equiNotaMediaAvaliacao).toBe(0);
  });

  it('Deve retornar todos os equipamentos cadastrados', async () => {
    const e1 = new Equipamento({
      equiNome: 'Furadeira',
      equiDescricao: 'Furadeira de impacto',
      equiValorDiaria: 100,
      equiCategoria: 'Ferramentas',
      equiFotos: [{ url: 'foto1.jpg', largura: 800, altura: 600, tamanhoMb: 1.2 }],
      equiQuantidadeDisponivel: 3,
    });

    const e2 = new Equipamento({
      equiNome: 'Lixadeira',
      equiDescricao: 'Lixadeira orbital',
      equiValorDiaria: 80,
      equiCategoria: 'Ferramentas',
      equiFotos: [{ url: 'foto2.jpg', largura: 800, altura: 600, tamanhoMb: 1.2 }],
      equiQuantidadeDisponivel: 2,
    });

    await e1.save();
    await e2.save();

    const equipamentos = await Equipamento.find();

    expect(equipamentos.length).toBe(2);
    const nomes = equipamentos.map(e => e.equiNome);
    expect(nomes).toContain('Furadeira');
    expect(nomes).toContain('Lixadeira');
  });

});
