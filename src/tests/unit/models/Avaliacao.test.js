import mongoose from "mongoose";
import Avaliacao from "../../../models/Avaliacao.js";
import Equipamento from "../../../models/Equipamento.js";
import Usuario from "../../../models/Usuario.js";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await mongoose.model('usuarios').createIndexes();
  await mongoose.model('equipamentos').createIndexes();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Modelo Avaliacao", () => {
  let equipamentoId, usuarioId;

  beforeAll(async () => {
    const equipamento = await new Equipamento({
      equiNome: "Kensei",
      equiDescricao: "Voluptas fugiat veritatis maiores cum culpa.",
      equiValorDiaria: 43,
      equiCategoria: "Soldador",
      equiQuantidadeDisponivel: 2,
      valor: 100,
      equiFotos: [
        {
          url: `https://exemplo.com/fotos/kensei.jpg`,
          largura: 800,
          altura: 600,
          tamanhoMb: 1
        }
      ],
    }).save();
    equipamentoId = equipamento._id;

    const usuario = await new Usuario({
      nome: "João",
      sobrenome: "Silva",
      email: "joao.silva@example.com",
      telefone: "11987654321",
      senha: "senhaSegura123",
      dataNascimento: new Date("1990-05-15"),
      CPF: "12345678900",
      status: "ativo",
      tipoUsuario: "cliente"
    }).save();
    usuarioId = usuario._id;
  });

  it("Deve criar uma avaliação com os dados corretos", async () => {
    const avaliacao = new Avaliacao({
      nota: 4,
      descricao: "Ótimo equipamento, fácil de usar.",
      usuarios: usuarioId,
      equipamentos: equipamentoId,
    });

    const savedAvaliacao = await avaliacao.save();

    expect(savedAvaliacao._id).toBeDefined();
    expect(savedAvaliacao.nota).toBe(4);
    expect(savedAvaliacao.descricao).toBe("Ótimo equipamento, fácil de usar.");
    expect(savedAvaliacao.usuarios.toString()).toBe(usuarioId.toString());
    expect(savedAvaliacao.equipamentos.toString()).toBe(equipamentoId.toString());
    expect(savedAvaliacao.createdAt).toBeDefined();
    expect(savedAvaliacao.updatedAt).toBeDefined();
  });

  it("Deve retornar erro ao criar avaliação sem nota", async () => {
    const avaliacao = new Avaliacao({
      descricao: "Ótimo equipamento, fácil de usar.",
      usuarios: usuarioId,
      equipamentos: equipamentoId,
    });

    await expect(avaliacao.validate()).rejects.toThrow(mongoose.Error.ValidationError);
    await expect(avaliacao.validate()).rejects.toHaveProperty('errors.nota');
    await expect(avaliacao.validate()).rejects.toHaveProperty('errors.nota.message', "Path `nota` is required.");
  });

  it("Deve retornar erro ao criar avaliação sem descricao", async () => {
    const avaliacao = new Avaliacao({
      nota: 4,
      usuarios: usuarioId,
      equipamentos: equipamentoId,
    });

    await expect(avaliacao.validate()).rejects.toThrow(mongoose.Error.ValidationError);
    await expect(avaliacao.validate()).rejects.toHaveProperty('errors.descricao');
    await expect(avaliacao.validate()).rejects.toHaveProperty('errors.descricao.message', "Path `descricao` is required.");
  });

  it("Deve retornar erro ao criar avaliação sem usuario", async () => {
    const avaliacao = new Avaliacao({
      nota: 4,
      descricao: "Ótimo equipamento, fácil de usar.",
      equipamentos: equipamentoId,
    });

    await expect(avaliacao.validate()).rejects.toThrow(mongoose.Error.ValidationError);
    await expect(avaliacao.validate()).rejects.toHaveProperty('errors.usuarios');
    await expect(avaliacao.validate()).rejects.toHaveProperty('errors.usuarios.message', "Path `usuarios` is required.");
  });

  it("Deve retornar erro ao criar avaliação sem equipamento", async () => {
    const avaliacao = new Avaliacao({
      nota: 4,
      descricao: "Ótimo equipamento, fácil de usar.",
      usuarios: usuarioId,
    });

    await expect(avaliacao.validate()).rejects.toThrow(mongoose.Error.ValidationError);
    await expect(avaliacao.validate()).rejects.toHaveProperty('errors.equipamentos');
    await expect(avaliacao.validate()).rejects.toHaveProperty('errors.equipamentos.message', "Path `equipamentos` is required.");
  });

  it("Deve registrar timestamps automaticamente", async () => {
    const avaliacao = new Avaliacao({
      nota: 4,
      descricao: "Ótimo equipamento, fácil de usar.",
      usuarios: usuarioId,
      equipamentos: equipamentoId,
    });

    const savedAvaliacao = await avaliacao.save();

    expect(savedAvaliacao.createdAt).toBeDefined();
    expect(savedAvaliacao.updatedAt).toBeDefined();
    expect(savedAvaliacao.createdAt).toBeInstanceOf(Date);
    expect(savedAvaliacao.updatedAt).toBeInstanceOf(Date);
  });

  it("Deve suportar paginação com mongoose-paginate-v2", async () => {
    await Promise.all([
      new Avaliacao({
        nota: 5,
        descricao: "Excelente!",
        usuarios: usuarioId,
        equipamentos: equipamentoId,
      }).save(),
      
      new Avaliacao({
        nota: 3,
        descricao: "Bom, mas poderia melhorar.",
        usuarios: usuarioId,
        equipamentos: equipamentoId,
      }).save(),
    ]);

    const options = { page: 1, limit: 2 };
    const result = await Avaliacao.paginate({}, options);

    expect(result.docs).toHaveLength(2);
    expect(result.totalDocs).toBeGreaterThanOrEqual(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
  });
});