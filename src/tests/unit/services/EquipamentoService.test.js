import EquipamentoService from "../../../services/EquipamentoService.js";
import EquipamentoRepository from "../../../repositories/EquipamentoRepository.js";
import EquipamentoFilterBuilder from "../../../repositories/filters/EquipamentoFilterBuilder.js";
import { CustomError, HttpStatusCodes, messages } from "../../../utils/helpers/index.js";
import Reserva from '../../../models/Reserva.js';

jest.mock('../../models/Reserva.js', () => ({
  countDocuments: jest.fn(),
}));

jest.mock("../../repositories/EquipamentoRepository.js");
jest.mock("../../repositories/filters/EquipamentoFilterBuilder.js");

const mockCustomError = jest.fn();
jest.mock("../../utils/helpers/index.js", () => {
  const originalHelpers = jest.requireActual("../../utils/helpers/index.js");
  return {
    ...originalHelpers,
    CustomError: jest.fn().mockImplementation(function (args) {
      const instance = new Error(args.customMessage || "Erro Customizado");
      Object.assign(instance, args);
      instance.name = "CustomError";
      mockCustomError(args);
      return instance;
    }),
    HttpStatusCodes: {
      BAD_REQUEST: { code: 400, reason: "Bad Request" },
      NOT_FOUND: { code: 404, reason: "Not Found" },
      FORBIDDEN: { code: 403, reason: "Forbidden" },
      CONFLICT: { code: 409, reason: "Conflict" },
    },
    messages: {
      error: {
        resourceNotFound: jest.fn((resource) => `${resource} não encontrado.`),
      },
    },
  };
});

const makeEquipamento = (props = {}) => ({
  _id: "507f1f77bcf86cd799439011",
  equiNome: "Equipamento Teste",
  equiCategoria: "maquinas",
  equiFotos: ["foto1.jpg"],
  equiStatus: "ativo",
  equiQuantidadeDisponivel: 5,
  equiValorDiaria: 100,
  save: jest.fn(),
  ...props,
});

describe("EquipamentoService", () => {
  let equipamentoService;
  let mockEquipamentoRepositoryInstance;
  let mockEquipamentoFilterBuilderInstance;

  beforeEach(() => {
    mockEquipamentoRepositoryInstance = {
      listar: jest.fn(),
      listarPorId: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      excluir: jest.fn(),
      listarPendentes: jest.fn(),
    };

    mockEquipamentoFilterBuilderInstance = {
      comCategoria: jest.fn().mockReturnThis(),
      comStatus: jest.fn().mockReturnThis(),
      comFaixaDeValor: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    };

    EquipamentoRepository.mockImplementation(() => mockEquipamentoRepositoryInstance);
    EquipamentoFilterBuilder.mockImplementation(() => mockEquipamentoFilterBuilderInstance);

    equipamentoService = new EquipamentoService();
    mockCustomError.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("criar", () => {
    const mockDados = {
      equiNome: "Equipamento Teste",
      equiDescricao: "Descrição teste",
      equiCategoria: "maquinas",
      equiValorDiaria: 100,
      equiQuantidadeDisponivel: 5,
      equiFotos: ["foto1.jpg"],
    };

    it("deve criar um equipamento com sucesso, com status inativo", async () => {
      const mockEquipamentoCriado = makeEquipamento();
      mockEquipamentoRepositoryInstance.criar.mockResolvedValue(mockEquipamentoCriado);

      const resultado = await equipamentoService.criar(mockDados);

      expect(mockEquipamentoRepositoryInstance.criar).toHaveBeenCalledWith(mockDados);
      expect(resultado).toEqual(mockEquipamentoCriado);
    });

    it("deve lançar erro se equiNome não for fornecido", async () => {
      const dadosSemNome = { ...mockDados, equiNome: undefined };
      await expect(equipamentoService.criar(dadosSemNome)).rejects.toThrow(Error);
    });

    it("deve lançar erro se equiCategoria não for fornecida", async () => {
      const dadosSemCategoria = { ...mockDados, equiCategoria: undefined };
      await expect(equipamentoService.criar(dadosSemCategoria)).rejects.toThrow(Error);
    });

    it("deve lançar erro se equiFotos não for fornecida", async () => {
      const dadosSemFoto = { ...mockDados, equiFotos: [] };
      await expect(equipamentoService.criar(dadosSemFoto)).rejects.toThrow(Error);
    });
  });

  describe("listar", () => {
    it("deve chamar repository.listar com os filtros processados e retornar os dados", async () => {
      const mockFiltros = { page: "1", limit: "10", categoria: "maquinas", status: "true", minValor: "100", maxValor: "500" };
      const mockResponseData = [makeEquipamento()];
      mockEquipamentoRepositoryInstance.listar.mockResolvedValue(mockResponseData);

      const resultado = await equipamentoService.listar(mockFiltros);

      expect(mockEquipamentoFilterBuilderInstance.comCategoria).toHaveBeenCalledWith("maquinas");
      expect(mockEquipamentoFilterBuilderInstance.comStatus).toHaveBeenCalledWith("ativo");
      expect(mockEquipamentoFilterBuilderInstance.comFaixaDeValor).toHaveBeenCalledWith("100", "500");
      expect(mockEquipamentoFilterBuilderInstance.build).toHaveBeenCalled();
      expect(mockEquipamentoRepositoryInstance.listar).toHaveBeenCalledWith({}, 1, 10);
      expect(resultado).toEqual(mockResponseData);
    });

    it("deve chamar listarPendentes se filtro status for pendente", async () => {
      const mockPendentes = [makeEquipamento({ equiStatus: "pendente" })];
      mockEquipamentoRepositoryInstance.listarPendentes.mockResolvedValue(mockPendentes);

      const resultado = await equipamentoService.listar({ status: "pendente" });

      expect(mockEquipamentoRepositoryInstance.listarPendentes).toHaveBeenCalled();
      expect(resultado).toEqual(mockPendentes);
    });
  });

  describe("listarPendentes", () => {
    it("deve chamar repository.listarPendentes e retornar resultado", async () => {
      const mockPendentes = [makeEquipamento({ equiStatus: "pendente" })];
      mockEquipamentoRepositoryInstance.listarPendentes.mockResolvedValue(mockPendentes);

      const resultado = await equipamentoService.listarPendentes();

      expect(mockEquipamentoRepositoryInstance.listarPendentes).toHaveBeenCalled();
      expect(resultado).toEqual(mockPendentes);
    });
  });

  describe("listarPorId", () => {
    it("deve retornar equipamento se encontrado", async () => {
      const mockEquipamento = makeEquipamento();
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquipamento);

      const resultado = await equipamentoService.listarPorId("507f1f77bcf86cd799439011");

      expect(mockEquipamentoRepositoryInstance.listarPorId).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
      expect(resultado).toEqual(mockEquipamento);
    });

    it("deve lançar erro se equipamento não for encontrado", async () => {
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(null);

      await expect(equipamentoService.listarPorId("507f1f77bcf86cd799439011")).rejects.toThrow(Error);
    });
  });

  describe("atualizar", () => {
    const mockEquipamento = makeEquipamento({ equiStatus: "ativo" });
    const mockDadosAtualizados = { equiValorDiaria: 150, equiQuantidadeDisponivel: 10 };

    beforeEach(() => {
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquipamento);
      mockEquipamentoRepositoryInstance.atualizar.mockResolvedValue({ ...mockEquipamento, ...mockDadosAtualizados });
    });

    it("deve atualizar equipamento com dados válidos", async () => {
      const resultado = await equipamentoService.atualizar("507f1f77bcf86cd799439011", mockDadosAtualizados);

      expect(mockEquipamentoRepositoryInstance.listarPorId).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
      expect(mockEquipamentoRepositoryInstance.atualizar).toHaveBeenCalledWith("507f1f77bcf86cd799439011", mockDadosAtualizados);
      expect(resultado).toEqual({ ...mockEquipamento, ...mockDadosAtualizados });
    });

    it("deve lançar erro se equipamento não for encontrado", async () => {
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(null);

      await expect(equipamentoService.atualizar("id-invalido", {})).rejects.toThrow();
    });

    it("deve lançar erro se equipamento estiver pendente", async () => {
      const equipamentoPendente = makeEquipamento({ equiStatus: "pendente" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(equipamentoPendente);

      const dadosInvalidos = { equiValorDiaria: 100 };
      await expect(equipamentoService.atualizar("507f1f77bcf86cd799439011", dadosInvalidos)).rejects.toThrow(
        'Não é possível atualizar! Equipamento pendente, espere por uma aprovação.'
      );
    });

    it("deve lançar erro se campos inválidos forem passados", async () => {
      const equipamentoAtivo = makeEquipamento({ equiStatus: "ativo" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(equipamentoAtivo);

      const dadosInvalidos = { equiNome: "Novo Nome" };

      await expect(equipamentoService.atualizar("507f1f77bcf86cd799439011", dadosInvalidos)).rejects.toThrow(
        'Não é permitido alterar os seguintes campos: equiNome'
      );
    });
  });

  describe("aprovar", () => {
    it("deve aprovar um equipamento pendente", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "pendente" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);

      const res = await equipamentoService.aprovar("507f1f77bcf86cd799439011");

      expect(mockEquip.equiStatus).toBe("ativo");
      expect(mockEquip.save).toHaveBeenCalled();
      expect(res).toBe(mockEquip);
    });

    it("deve lançar erro se equipamento não estiver pendente", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "ativo" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);

      await expect(equipamentoService.aprovar("507f1f77bcf86cd799439011")).rejects.toThrow(
        "Apenas equipamentos pendentes podem ser aprovados."
      );
    });
  });

  describe("reprovar", () => {
    const validObjectId = "507f1f77bcf86cd799439011";

    it("deve excluir equipamento pendente sem reservas ativas", async () => {
      const mockEquip = makeEquipamento({ _id: validObjectId, equiStatus: "pendente" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      Reserva.countDocuments.mockResolvedValue(0);

      const res = await equipamentoService.reprovar(validObjectId);

      expect(mockEquipamentoRepositoryInstance.excluir).toHaveBeenCalledWith(validObjectId);
      expect(res).toEqual({ id: validObjectId, mensagem: "Equipamento excluído com sucesso." });
    });

    it("deve lançar erro se equipamento não estiver pendente", async () => {
      const mockEquip = makeEquipamento({ _id: validObjectId, equiStatus: "ativo" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);

      await expect(equipamentoService.reprovar(validObjectId)).rejects.toThrow(
        "Apenas equipamentos pendentes podem ser reprovados."
      );
    });

    it("deve lançar erro se houver reservas ativas", async () => {
      const mockEquip = makeEquipamento({ _id: validObjectId, equiStatus: "pendente" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      Reserva.countDocuments.mockResolvedValue(2);

      await expect(equipamentoService.reprovar(validObjectId)).rejects.toThrow(
        "Não é possível excluir equipamento com reservas ativas."
      );
    });
  });

  describe("adicionarFoto", () => {
    it("deve adicionar foto a equipamento existente", async () => {
      const mockEquip = makeEquipamento();
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);

      const res = await equipamentoService.adicionarFoto("507f1f77bcf86cd799439011", "nova.jpg");

      expect(mockEquip.equiFotos).toContain("nova.jpg");
      expect(mockEquip.save).toHaveBeenCalled();
      expect(res).toBe(mockEquip);
    });

    it("deve lançar erro se equipamento não encontrado", async () => {
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(null);

      await expect(equipamentoService.adicionarFoto("id-invalido", "nova.jpg")).rejects.toThrow();
    });
  });

  describe("_processarFiltros", () => {
    it('deve retornar status ativo quando status é "true"', () => {
      const filtros = { status: 'true' };
      equipamentoService._processarFiltros(filtros);
      expect(mockEquipamentoFilterBuilderInstance.comStatus).toHaveBeenCalledWith('ativo');
    });

    it('deve retornar status pendente quando status é "false"', () => {
      const filtros = { status: 'false' };
      equipamentoService._processarFiltros(filtros);
      expect(mockEquipamentoFilterBuilderInstance.comStatus).toHaveBeenCalledWith('pendente');
    });

    it('deve retornar status personalizado quando status é outro valor', () => {
      const filtros = { status: 'custom' };
      equipamentoService._processarFiltros(filtros);
      expect(mockEquipamentoFilterBuilderInstance.comStatus).toHaveBeenCalledWith('custom');
    });

    it('deve retornar status ativo padrão quando status não definido', () => {
      const filtros = {};
      equipamentoService._processarFiltros(filtros);
      expect(mockEquipamentoFilterBuilderInstance.comStatus).toHaveBeenCalledWith('ativo');
    });
  });

  describe("_verificarAtualizacaoPermitida", () => {
    it('deve lançar erro se equipamento estiver pendente', () => {
      const equipamento = makeEquipamento({ equiStatus: 'pendente' });
      const dados = { equiValorDiaria: 100 };
      expect(() => equipamentoService._verificarAtualizacaoPermitida(equipamento, dados))
        .toThrow('Não é possível atualizar! Equipamento pendente, espere por uma aprovação.');
    });

    it('deve lançar erro se campos inválidos forem passados', () => {
      const equipamento = makeEquipamento({ equiStatus: 'ativo' });
      const dados = { equiNome: 'Novo nome', equiValorDiaria: 100 };
      expect(() => equipamentoService._verificarAtualizacaoPermitida(equipamento, dados))
        .toThrow('Não é permitido alterar os seguintes campos: equiNome');
    });

    it('não deve lançar erro se apenas campos permitidos forem atualizados', () => {
      const equipamento = makeEquipamento({ equiStatus: 'ativo' });
      const dados = { equiValorDiaria: 100, equiQuantidadeDisponivel: 5 };
      expect(() => equipamentoService._verificarAtualizacaoPermitida(equipamento, dados))
        .not.toThrow();
    });
  });

  describe("_validarCamposObrigatorios", () => {
    it('deve lançar erro se equiNome não informado', () => {
      expect(() => equipamentoService._validarCamposObrigatorios({ equiCategoria: 'cat' }))
        .toThrow('Campos obrigatórios não preenchidos.');
    });

    it('deve lançar erro se equiCategoria não informado', () => {
      expect(() => equipamentoService._validarCamposObrigatorios({ equiNome: 'nome' }))
        .toThrow('Campos obrigatórios não preenchidos.');
    });

    it('não deve lançar erro se campos preenchidos', () => {
      expect(() => equipamentoService._validarCamposObrigatorios({ equiNome: 'nome', equiCategoria: 'cat' }))
        .not.toThrow();
    });
  });

  describe("_validarFotosObrigatorias", () => {
    it('deve lançar erro se equiFotos vazio ou não array', () => {
      expect(() => equipamentoService._validarFotosObrigatorias({ equiFotos: [] }))
        .toThrow('Pelo menos uma foto é obrigatória');

      expect(() => equipamentoService._validarFotosObrigatorias({}))
        .toThrow('Pelo menos uma foto é obrigatória');
    });

    it('não deve lançar erro se fotos presentes', () => {
      expect(() => equipamentoService._validarFotosObrigatorias({ equiFotos: ['foto.jpg'] }))
        .not.toThrow();
    });
  });
});
