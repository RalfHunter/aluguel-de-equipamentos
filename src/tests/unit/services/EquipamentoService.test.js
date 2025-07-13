import EquipamentoService from "../../../services/EquipamentoService.js";
import EquipamentoRepository from "../../../repositories/EquipamentoRepository.js";
import EquipamentoFilterBuilder from "../../../repositories/filters/EquipamentoFilterBuilder.js";
import { CustomError, HttpStatusCodes, messages } from "../../../utils/helpers/index.js";
import Reserva from '../../../models/Reserva.js';
import Usuario from '../../../models/Usuario.js';
import mongoose from 'mongoose';

jest.mock('../../../models/Reserva.js', () => ({
  countDocuments: jest.fn(),
}));
jest.mock('../../../models/Usuario.js');
jest.mock("../../../repositories/EquipamentoRepository.js");
jest.mock("../../../repositories/filters/EquipamentoFilterBuilder.js");

const mockCustomError = jest.fn();
jest.mock("../../../utils/helpers/index.js", () => {
  const originalHelpers = jest.requireActual("../../../utils/helpers/index.js");
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

const makeEquipamento = (props = {}) => {
  const mockEquip = {
    _id: "507f1f77bcf86cd799439011",
    equiNome: "Equipamento Teste",
    equiCategoria: "maquinas",
    equiFotos: ["foto1.jpg"],
    equiStatus: "ativo",
    equiQuantidadeDisponivel: 5,
    equiValorDiaria: 100,
    equiUsuario: "userId",
    save: jest.fn(),
    ...props,
  };
  mockEquip.save.mockResolvedValue(mockEquip);
  return mockEquip;
};

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
      buscarFotoPorId: jest.fn(),
    };

    mockEquipamentoFilterBuilderInstance = {
      comCategoria: jest.fn().mockReturnThis(),
      comStatus: jest.fn().mockReturnThis(),
      comFaixaDeValor: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    };

    EquipamentoRepository.mockImplementation(() => mockEquipamentoRepositoryInstance);
    EquipamentoFilterBuilder.mockImplementation(() => mockEquipamentoFilterBuilderInstance);
    Usuario.findById.mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 10 }] }),
    }));

    equipamentoService = new EquipamentoService();
    mockCustomError.mockClear();
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

    it("deve criar um equipamento com sucesso, com status pendente", async () => {
      const mockEquipamentoCriado = makeEquipamento({ equiStatus: "pendente" });
      mockEquipamentoRepositoryInstance.criar.mockResolvedValue(mockEquipamentoCriado);

      const resultado = await equipamentoService.criar(mockDados);

      expect(mockEquipamentoRepositoryInstance.criar).toHaveBeenCalledWith({
        ...mockDados,
        equiStatus: "pendente",
      });
      expect(resultado).toEqual(mockEquipamentoCriado);
    });

    it("deve lançar erro se equiNome não for fornecido", async () => {
      const dadosSemNome = { ...mockDados, equiNome: undefined };
      await expect(equipamentoService.criar(dadosSemNome)).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: "Campos obrigatórios não preenchidos.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: "Campos obrigatórios não preenchidos.",
      });
    });

    it("deve lançar erro se equiCategoria não for fornecida", async () => {
      const dadosSemCategoria = { ...mockDados, equiCategoria: undefined };
      await expect(equipamentoService.criar(dadosSemCategoria)).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: "Campos obrigatórios não preenchidos.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: "Campos obrigatórios não preenchidos.",
      });
    });

    it("deve lançar erro se equiFotos não for fornecida", async () => {
      const dadosSemFoto = { ...mockDados, equiFotos: [] };
      await expect(equipamentoService.criar(dadosSemFoto)).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: "Pelo menos uma foto é obrigatória.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: "Pelo menos uma foto é obrigatória.",
      });
    });
  });

  describe("listar", () => {
    it("deve chamar repository.listar com os filtros processados e retornar os dados", async () => {
      const mockFiltros = { page: "1", limit: "10", categoria: "maquinas", status: "ativo", minValor: "100", maxValor: "500", usuarioId: "userId" };
      const mockResponseData = [makeEquipamento()];
      mockEquipamentoRepositoryInstance.listar.mockResolvedValue(mockResponseData);
      mockEquipamentoFilterBuilderInstance.build.mockReturnValue({ equiCategoria: "maquinas", equiValorDiaria: { $gte: 100, $lte: 500 } });

      const resultado = await equipamentoService.listar(mockFiltros, "userId");

      expect(mockEquipamentoFilterBuilderInstance.comCategoria).toHaveBeenCalledWith("maquinas");
      expect(mockEquipamentoFilterBuilderInstance.comFaixaDeValor).toHaveBeenCalledWith("100", "500");
      expect(mockEquipamentoRepositoryInstance.listar).toHaveBeenCalledWith(
        {
          equiCategoria: "maquinas",
          equiValorDiaria: { $gte: 100, $lte: 500 },
          equiStatus: 'ativo',
          equiUsuario: "userId",
        },
        1,
        10
      );
      expect(resultado).toEqual(mockResponseData);
    });

    it("deve chamar listarPendentes se filtro status for pendente", async () => {
      const mockFiltros = { status: "pendente", usuarioId: "userId", page: "1", limit: "10" };
      const mockPendentes = [makeEquipamento({ equiStatus: "pendente" })];
      mockEquipamentoRepositoryInstance.listar.mockResolvedValue(mockPendentes);
      mockEquipamentoFilterBuilderInstance.build.mockReturnValue({});
      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
      });

      const resultado = await equipamentoService.listar(mockFiltros, "userId", true);

      expect(mockEquipamentoRepositoryInstance.listar).toHaveBeenCalledWith({ equiStatus: "pendente" }, 1, 10);
      expect(resultado).toEqual(mockPendentes);
    });

    it("deve processar filtros sem status definido para usuário autenticado", async () => {
      const mockFiltros = { page: "1", limit: "10", usuarioId: "userId" };
      const mockResponseData = [makeEquipamento()];
      mockEquipamentoRepositoryInstance.listar.mockResolvedValue(mockResponseData);
      mockEquipamentoFilterBuilderInstance.build.mockReturnValue({});

      const resultado = await equipamentoService.listar(mockFiltros, "userId");

      expect(mockEquipamentoRepositoryInstance.listar).toHaveBeenCalledWith(
        { equiStatus: 'ativo' },
        1,
        10
      );
      expect(resultado).toEqual(mockResponseData);
    });

    it("deve processar filtros sem usuário autenticado", async () => {
      const mockFiltros = { page: "1", limit: "10" };
      const mockResponseData = [makeEquipamento()];
      mockEquipamentoRepositoryInstance.listar.mockResolvedValue(mockResponseData);
      mockEquipamentoFilterBuilderInstance.build.mockReturnValue({});

      const resultado = await equipamentoService.listar(mockFiltros);

      expect(mockEquipamentoRepositoryInstance.listar).toHaveBeenCalledWith(
        { equiStatus: "ativo" },
        1,
        10
      );
      expect(resultado).toEqual(mockResponseData);
    });
  });

  describe("listarPendentes", () => {
    it("deve chamar repository.listar com status pendente para admin e retornar resultado", async () => {
      const mockFiltros = { status: "pendente", page: "1", limit: "10" };
      const mockPendentes = [makeEquipamento({ equiStatus: "pendente" })];
      mockEquipamentoRepositoryInstance.listar.mockResolvedValue(mockPendentes);
      mockEquipamentoFilterBuilderInstance.build.mockReturnValue({});
      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
      });

      const resultado = await equipamentoService.listar(mockFiltros, "userId", true);

      expect(mockEquipamentoRepositoryInstance.listar).toHaveBeenCalledWith({ equiStatus: "pendente" }, 1, 10);
      expect(resultado).toEqual(mockPendentes);
    });
  });

  describe("listarPorId", () => {
    it("deve retornar equipamento se encontrado", async () => {
      const mockEquipamento = makeEquipamento();
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquipamento);

      const resultado = await equipamentoService.listarPorId("507f1f77bcf86cd799439011", "userId");

      expect(mockEquipamentoRepositoryInstance.listarPorId).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
      expect(resultado).toEqual(mockEquipamento);
    });

    it("deve lançar erro se equipamento não for encontrado", async () => {
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(null);
      messages.error.resourceNotFound.mockReturnValue("Equipamento não encontrado.");

      await expect(equipamentoService.listarPorId("507f1f77bcf86cd799439011", "userId")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
    });

    it("deve permitir admin/moderador ver qualquer equipamento", async () => {
      const mockEquipamento = makeEquipamento({ equiUsuario: "outroUserId" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquipamento);

      const resultado = await equipamentoService.listarPorId("507f1f77bcf86cd799439011", "userId", true);

      expect(mockEquipamentoRepositoryInstance.listarPorId).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
      expect(resultado).toEqual(mockEquipamento);
    });

    it("deve lançar erro FORBIDDEN quando usuário comum tenta ver equipamento de outro", async () => {
      const mockEquipamento = makeEquipamento({ equiUsuario: "outroUserId" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquipamento);

      await expect(equipamentoService.listarPorId("507f1f77bcf86cd799439011", "userId", false)).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Equipamento não encontrado.",
      });
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
      messages.error.resourceNotFound.mockReturnValue("Equipamento não encontrado.");

      await expect(equipamentoService.atualizar("507f1f77bcf86cd799439011", mockDadosAtualizados)).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
    });

    it("deve lançar erro se equipamento estiver pendente", async () => {
      const equipamentoPendente = makeEquipamento({ equiStatus: "pendente" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(equipamentoPendente);

      await expect(equipamentoService.atualizar("507f1f77bcf86cd799439011", mockDadosAtualizados)).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Não é possível atualizar! Equipamento pendente, espere por uma aprovação.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Não é possível atualizar! Equipamento pendente, espere por uma aprovação.",
      });
    });

    it("deve lançar erro se equipamento estiver inativo", async () => {
      const equipamentoInativo = makeEquipamento({ equiStatus: "inativo" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(equipamentoInativo);

      await expect(equipamentoService.atualizar("507f1f77bcf86cd799439011", mockDadosAtualizados)).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Não é possível atualizar! Equipamento inativo.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Não é possível atualizar! Equipamento inativo.",
      });
    });

    it("deve lançar erro se campos inválidos forem passados", async () => {
      const dadosInvalidos = { equiNome: "Novo Nome" };

      await expect(equipamentoService.atualizar("507f1f77bcf86cd799439011", dadosInvalidos)).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: "Não é permitido alterar os seguintes campos: equiNome",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: "Não é permitido alterar os seguintes campos: equiNome",
      });
    });
  });

  describe("aprovar", () => {
    const validObjectId = "507f1f77bcf86cd799439011";

    it("deve aprovar um equipamento pendente com usuário admin", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "pendente" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
      });

      const resultado = await equipamentoService.aprovar(validObjectId, "userId");

      expect(mockEquipamentoRepositoryInstance.listarPorId).toHaveBeenCalledWith(validObjectId);
      expect(mockEquip.equiStatus).toBe("ativo");
      expect(mockEquip.save).toHaveBeenCalled();
      expect(resultado).toBe(mockEquip);
    });

    it("deve lançar erro se usuário não for admin ou moderador", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "pendente" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);

      await expect(equipamentoService.aprovar(validObjectId, "userId")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Você não tem permissão para aprovar equipamentos.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Você não tem permissão para aprovar equipamentos.",
      });
    });

    it("deve lançar erro se equipamento não estiver pendente", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "ativo" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
      });

      await expect(equipamentoService.aprovar(validObjectId, "userId")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Apenas equipamentos pendentes podem ser aprovados.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Apenas equipamentos pendentes podem ser aprovados.",
      });
    });

    it("deve lançar erro se equipamento não for encontrado", async () => {
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(null);
      messages.error.resourceNotFound.mockReturnValue("Equipamento não encontrado.");
      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
      });

      await expect(equipamentoService.aprovar(validObjectId, "userId")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
    });
  });

  describe("reprovar", () => {
    const validObjectId = "507f1f77bcf86cd799439011";

    it("deve excluir equipamento pendente com usuário admin", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "pendente" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      mockEquipamentoRepositoryInstance.excluir.mockResolvedValue();
      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
      });

      const resultado = await equipamentoService.reprovar(validObjectId, "userId");

      expect(mockEquipamentoRepositoryInstance.listarPorId).toHaveBeenCalledWith(validObjectId);
      expect(mockEquipamentoRepositoryInstance.excluir).toHaveBeenCalledWith(validObjectId);
      expect(resultado).toEqual({ id: validObjectId, mensagem: "Equipamento excluído com sucesso." });
    });

    it("deve lançar erro se usuário não for admin ou moderador", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "pendente" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);

      await expect(equipamentoService.reprovar(validObjectId, "userId")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Você não tem permissão para reprovar equipamentos.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Você não tem permissão para reprovar equipamentos.",
      });
    });

    it("deve lançar erro se equipamento não estiver pendente", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "ativo" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
      });

      await expect(equipamentoService.reprovar(validObjectId, "userId")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Apenas equipamentos pendentes podem ser reprovados.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Apenas equipamentos pendentes podem ser reprovados.",
      });
    });

    it("deve lançar erro se equipamento não for encontrado", async () => {
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(null);
      messages.error.resourceNotFound.mockReturnValue("Equipamento não encontrado.");
      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
      });

      await expect(equipamentoService.reprovar(validObjectId, "userId")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
    });
  });

  describe("atualizarStatus", () => {
    const validObjectId = "507f1f77bcf86cd799439011";
    const userId = "userId";

    it("deve atualizar status para ativo com sucesso", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "inativo", equiUsuario: userId });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      Reserva.countDocuments.mockResolvedValue(0);

      const resultado = await equipamentoService.atualizarStatus(validObjectId, userId, "ativo");

      expect(mockEquipamentoRepositoryInstance.listarPorId).toHaveBeenCalledWith(validObjectId);
      expect(mockEquip.equiStatus).toBe("ativo");
      expect(mockEquip.save).toHaveBeenCalled();
      expect(resultado).toBe(mockEquip);
    });

    it("deve atualizar status para inativo com sucesso", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "ativo", equiUsuario: userId });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      Reserva.countDocuments.mockResolvedValue(0);

      const resultado = await equipamentoService.atualizarStatus(validObjectId, userId, "inativo");

      expect(mockEquipamentoRepositoryInstance.listarPorId).toHaveBeenCalledWith(validObjectId);
      expect(mockEquip.equiStatus).toBe("inativo");
      expect(mockEquip.save).toHaveBeenCalled();
      expect(resultado).toBe(mockEquip);
    });

    it("deve lançar erro se equipamento não for encontrado", async () => {
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(null);
      messages.error.resourceNotFound.mockReturnValue("Equipamento não encontrado.");

      await expect(equipamentoService.atualizarStatus(validObjectId, userId, "ativo")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
    });

    it("deve permitir admin/moderador alterar status de qualquer equipamento", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "ativo", equiUsuario: "outroUserId" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
      });
      Reserva.countDocuments.mockResolvedValue(0);

      const resultado = await equipamentoService.atualizarStatus(validObjectId, userId, "inativo");

      expect(mockEquip.equiStatus).toBe("inativo");
      expect(mockEquip.save).toHaveBeenCalled();
      expect(resultado).toBe(mockEquip);
    });

    it("deve lançar erro se usuário não for dono do equipamento", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "ativo", equiUsuario: "outroUserId" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);

      await expect(equipamentoService.atualizarStatus(validObjectId, userId, "inativo")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Apenas o dono do equipamento pode alterar seu status.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Apenas o dono do equipamento pode alterar seu status.",
      });
    });

    it("deve lançar erro se equipamento estiver pendente", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "pendente", equiUsuario: userId });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);

      await expect(equipamentoService.atualizarStatus(validObjectId, userId, "ativo")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Não é possível alterar o status de um equipamento pendente.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: "Não é possível alterar o status de um equipamento pendente.",
      });
    });

    it("deve lançar erro se equipamento já estiver no status desejado", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "ativo", equiUsuario: userId });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);

      await expect(equipamentoService.atualizarStatus(validObjectId, userId, "ativo")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.CONFLICT.code,
        customMessage: "O equipamento já está ativo.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.CONFLICT.code,
        customMessage: "O equipamento já está ativo.",
      });
    });

    it("deve lançar erro se houver reservas ativas ao tentar inativar", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "ativo", equiUsuario: userId });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      Reserva.countDocuments.mockResolvedValue(2);

      await expect(equipamentoService.atualizarStatus(validObjectId, userId, "inativo")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.CONFLICT.code,
        customMessage: "Não é possível inativar equipamento com reservas ativas ou futuras.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.CONFLICT.code,
        customMessage: "Não é possível inativar equipamento com reservas ativas ou futuras.",
      });
    });

    it("deve lançar erro para transição inválida", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "ativo", equiUsuario: userId });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      Reserva.countDocuments.mockResolvedValue(0);

      await expect(equipamentoService.atualizarStatus(validObjectId, userId, "pendente")).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: "Transição inválida: de ativo para pendente.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: "Transição inválida: de ativo para pendente.",
      });
    });

    it("deve permitir moderador (nível 50) alterar status", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "ativo", equiUsuario: "outroUserId" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 50 }] }),
      });
      Reserva.countDocuments.mockResolvedValue(0);

      const resultado = await equipamentoService.atualizarStatus(validObjectId, userId, "inativo");

      expect(mockEquip.equiStatus).toBe("inativo");
      expect(mockEquip.save).toHaveBeenCalled();
      expect(resultado).toBe(mockEquip);
    });

    it("deve verificar reservas ativas ao tentar inativar equipamento", async () => {
      const mockEquip = makeEquipamento({ equiStatus: "ativo", equiUsuario: userId });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      
      // Deve chamar countDocuments com query específica
      const expectedQuery = {
        equipamentos: new mongoose.Types.ObjectId(validObjectId),
        statusReserva: { $in: ['pendente', 'confirmada'] },
        $or: [
          { dataInicial: { $lte: expect.any(Date) }, dataFinal: { $gte: expect.any(Date) } },
          { dataInicial: { $gte: expect.any(Date) } },
        ],
      };

      Reserva.countDocuments.mockResolvedValue(0);

      await equipamentoService.atualizarStatus(validObjectId, userId, "inativo");

      expect(Reserva.countDocuments).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe("adicionarFotos", () => {
    const validObjectId = "507f1f77bcf86cd799439011";

    it("deve adicionar fotos a equipamento existente", async () => {
      const mockEquip = makeEquipamento();
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);

      const novasFotos = [{ url: "nova.jpg" }];
      const resultado = await equipamentoService.adicionarFotos(validObjectId, novasFotos);

      expect(mockEquipamentoRepositoryInstance.listarPorId).toHaveBeenCalledWith(validObjectId);
      expect(mockEquip.equiFotos).toContain(novasFotos[0]);
      expect(mockEquip.save).toHaveBeenCalled();
      expect(resultado).toBe(mockEquip);
    });

    it("deve lançar erro se equipamento não for encontrado", async () => {
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(null);
      messages.error.resourceNotFound.mockReturnValue("Equipamento não encontrado.");

      await expect(equipamentoService.adicionarFotos(validObjectId, [{ url: "nova.jpg" }])).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
    });

    it("deve lançar erro se novasFotos não for um array válido", async () => {
      const mockEquip = makeEquipamento();
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);

      await expect(equipamentoService.adicionarFotos(validObjectId, [])).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: "Nenhuma foto válida fornecida.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: "Nenhuma foto válida fornecida.",
      });
    });
  });

  describe("ListarFoto", () => {
    const validObjectId = "507f1f77bcf86cd799439011";
    const validFotoId = "foto1";

    beforeEach(() => {
      jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
    });

    afterEach(() => {
      jest.spyOn(require('fs'), 'existsSync').mockRestore();
    });

    it("deve retornar informações da foto com sucesso", async () => {
      const mockEquip = makeEquipamento();
      const mockFoto = { url: "http://localhost/uploads/equipamentos/foto1.jpg" };
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      mockEquipamentoRepositoryInstance.buscarFotoPorId.mockResolvedValue(mockFoto);

      const resultado = await equipamentoService.listarFoto(validObjectId, validFotoId);

      expect(mockEquipamentoRepositoryInstance.listarPorId).toHaveBeenCalledWith(validObjectId);
      expect(mockEquipamentoRepositoryInstance.buscarFotoPorId).toHaveBeenCalledWith(validObjectId, validFotoId);
      expect(resultado).toEqual({
        filePath: expect.stringContaining("foto1.jpg"),
        contentType: "image/jpeg",
      });
    });

    it("deve lançar erro se equipamento não for encontrado", async () => {
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(null);
      messages.error.resourceNotFound.mockReturnValue("Equipamento não encontrado.");

      await expect(equipamentoService.listarFoto(validObjectId, validFotoId)).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
    });

    it("deve lançar erro se foto não for encontrada", async () => {
      const mockEquip = makeEquipamento();
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      mockEquipamentoRepositoryInstance.buscarFotoPorId.mockResolvedValue(null);

      await expect(equipamentoService.listarFoto(validObjectId, validFotoId)).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Foto não encontrada.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Foto não encontrada.",
      });
    });

    it("deve lançar erro se arquivo da foto não existir no servidor", async () => {
      const mockEquip = makeEquipamento();
      const mockFoto = { url: "http://localhost/uploads/equipamentos/foto1.jpg" };
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquip);
      mockEquipamentoRepositoryInstance.buscarFotoPorId.mockResolvedValue(mockFoto);
      jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);

      await expect(equipamentoService.listarFoto(validObjectId, validFotoId)).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Arquivo da foto não encontrado no servidor.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Arquivo da foto não encontrado no servidor.",
      });
    });
  });

  describe("_processarFiltros", () => {
    it('deve retornar status ativo quando status é "ativo"', () => {
      const filtros = { status: "ativo", usuarioId: "userId" };
      mockEquipamentoFilterBuilderInstance.build.mockReturnValue({});
      const { query } = equipamentoService._processarFiltros(filtros, "userId");
      expect(query).toEqual({
        equiStatus: 'ativo',
        equiUsuario: "userId",
      });
    });

    it('deve retornar status pendente quando status é "pendente"', () => {
      const filtros = { status: "pendente", usuarioId: "userId" };
      mockEquipamentoFilterBuilderInstance.build.mockReturnValue({});
      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
      });
      const { query } = equipamentoService._processarFiltros(filtros, "userId", true);
      expect(query).toEqual({ equiStatus: "pendente" });
    });

    it('deve retornar status personalizado quando status é outro valor', () => {
      const filtros = { status: "inativo", usuarioId: "userId" };
      mockEquipamentoFilterBuilderInstance.build.mockReturnValue({});
      const { query } = equipamentoService._processarFiltros(filtros, "userId");
      expect(query).toEqual({ equiStatus: "inativo", equiUsuario: "userId" });
    });

    it('deve retornar status ativo padrão quando status não definido e usuário autenticado', () => {
      const filtros = { usuarioId: "userId" };
      mockEquipamentoFilterBuilderInstance.build.mockReturnValue({});
      const { query } = equipamentoService._processarFiltros(filtros, "userId");
      expect(query).toEqual({ equiStatus: "ativo" });
    });

    it('deve retornar status ativo padrão quando status não definido e sem usuário', () => {
      const filtros = {};
      mockEquipamentoFilterBuilderInstance.build.mockReturnValue({});
      const { query } = equipamentoService._processarFiltros(filtros);
      expect(query).toEqual({ equiStatus: "ativo" });
    });

    it('deve lançar erro para status inválido quando usuário não é admin/moderador', () => {
      const filtros = { status: "statusInvalido", usuarioId: "userId" };
      mockEquipamentoFilterBuilderInstance.build.mockReturnValue({});
      
      expect(() => {
        equipamentoService._processarFiltros(filtros, "userId", false);
      }).toThrow(
        new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          customMessage: "Status inválido: statusInvalido",
        })
      );
    });

    it('deve lançar erro se usuário comum tentar listar equipamentos pendentes', () => {
      const filtros = { status: "pendente", usuarioId: "userId" };
      mockEquipamentoFilterBuilderInstance.build.mockReturnValue({});
      
      expect(() => {
        equipamentoService._processarFiltros(filtros, "userId", false);
      }).toThrow(
        new CustomError({
          statusCode: HttpStatusCodes.FORBIDDEN.code,
          customMessage: "Você não tem permissão para listar equipamentos pendentes.",
        })
      );
    });
  });

  describe("_verificarAtualizacaoPermitida", () => {
    it("deve lançar erro se campos inválidos forem passados", () => {
      const equipamento = makeEquipamento({ equiStatus: "ativo" });
      const dados = { equiNome: "Novo nome", equiValorDiaria: 100 };
      expect(() => equipamentoService._verificarAtualizacaoPermitida(equipamento, dados)).toThrow(
        new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          customMessage: "Não é permitido alterar os seguintes campos: equiNome",
        })
      );
    });

    it("não deve lançar erro se apenas campos permitidos forem atualizados", () => {
      const equipamento = makeEquipamento({ equiStatus: "ativo" });
      const dados = { equiValorDiaria: 100, equiQuantidadeDisponivel: 5 };
      expect(() => equipamentoService._verificarAtualizacaoPermitida(equipamento, dados)).not.toThrow();
    });
  });

  describe("_validarCamposObrigatorios", () => {
    it("deve lançar erro se equiNome não informado", () => {
      expect(() => equipamentoService._validarCamposObrigatorios({ equiCategoria: "cat" })).toThrow(
        new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          customMessage: "Campos obrigatórios não preenchidos.",
        })
      );
    });

    it("deve lançar erro se equiCategoria não for informado", () => {
      expect(() => equipamentoService._validarCamposObrigatorios({ equiNome: "nome" })).toThrow(
        new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          customMessage: "Campos obrigatórios não preenchidos.",
        })
      );
    });

    it("não deve lançar erro se campos preenchidos", () => {
      expect(() => equipamentoService._validarCamposObrigatorios({ equiNome: "nome", equiCategoria: "cat" })).not.toThrow();
    });
  });

  describe("_validarFotosObrigatorias", () => {
    it("deve lançar erro se equiFotos vazio ou não array", () => {
      expect(() => equipamentoService._validarFotosObrigatorias({ equiFotos: [] })).toThrow(
        new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          customMessage: "Pelo menos uma foto é obrigatória.",
        })
      );
      expect(() => equipamentoService._validarFotosObrigatorias({})).toThrow(
        new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          customMessage: "Pelo menos uma foto é obrigatória.",
        })
      );
    });

    it("não deve lançar erro se fotos presentes", () => {
      expect(() => equipamentoService._validarFotosObrigatorias({ equiFotos: ["foto.jpg"] })).not.toThrow();
    });
  });

  describe("deletarEquipamento", () => {
    const validObjectId = "507f1f77bcf86cd799439011";

    it("deve deletar equipamento existente com sucesso", async () => {
      const mockEquipamento = makeEquipamento();
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquipamento);
      mockEquipamentoRepositoryInstance.excluir.mockResolvedValue({ deletedCount: 1 });

      const resultado = await equipamentoService.deletarEquipamento(validObjectId);

      expect(mockEquipamentoRepositoryInstance.listarPorId).toHaveBeenCalledWith(validObjectId);
      expect(mockEquipamentoRepositoryInstance.excluir).toHaveBeenCalledWith(validObjectId);
      expect(resultado).toEqual(mockEquipamento);
    });

    it("deve lançar erro se equipamento não for encontrado", async () => {
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(null);
      messages.error.resourceNotFound.mockReturnValue("Equipamento não encontrado.");

      await expect(equipamentoService.deletarEquipamento(validObjectId)).rejects.toMatchObject({
        name: "CustomError",
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
      expect(mockCustomError).toHaveBeenCalledWith({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: "Equipamento não encontrado.",
      });
    });

    it("deve propagar erro do repository ao tentar excluir", async () => {
      const mockEquipamento = makeEquipamento();
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(mockEquipamento);
      mockEquipamentoRepositoryInstance.excluir.mockRejectedValue(new Error("Erro no banco de dados"));

      await expect(equipamentoService.deletarEquipamento(validObjectId)).rejects.toThrow("Erro no banco de dados");
      expect(mockEquipamentoRepositoryInstance.listarPorId).toHaveBeenCalledWith(validObjectId);
      expect(mockEquipamentoRepositoryInstance.excluir).toHaveBeenCalledWith(validObjectId);
    });

    it("deve conseguir deletar equipamento independente do status", async () => {
      const equipamentoInativo = makeEquipamento({ equiStatus: "inativo" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(equipamentoInativo);
      mockEquipamentoRepositoryInstance.excluir.mockResolvedValue({ deletedCount: 1 });

      const resultado = await equipamentoService.deletarEquipamento(validObjectId);

      expect(resultado).toEqual(equipamentoInativo);
      expect(mockEquipamentoRepositoryInstance.excluir).toHaveBeenCalledWith(validObjectId);
    });

    it("deve conseguir deletar equipamento pendente", async () => {
      const equipamentoPendente = makeEquipamento({ equiStatus: "pendente" });
      mockEquipamentoRepositoryInstance.listarPorId.mockResolvedValue(equipamentoPendente);
      mockEquipamentoRepositoryInstance.excluir.mockResolvedValue({ deletedCount: 1 });

      const resultado = await equipamentoService.deletarEquipamento(validObjectId);

      expect(resultado).toEqual(equipamentoPendente);
      expect(mockEquipamentoRepositoryInstance.excluir).toHaveBeenCalledWith(validObjectId);
    });
  });
});