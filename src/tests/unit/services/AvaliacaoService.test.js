import { beforeEach, describe, expect, jest } from '@jest/globals';
import AvaliacaoService from '../../../services/AvaliacaoService.js';
import AvaliacaoRepository from '../../../repositories/AvaliacaoRepository.js';
import Usuario from '../../../models/Usuario.js';
import mongoose from 'mongoose';
import CustomError from '../../../utils/helpers/CustomError.js';

jest.mock('../../../repositories/AvaliacaoRepository', () => {
    return jest.fn().mockImplementation(() => ({
        listar: jest.fn(),
        criar: jest.fn(),
        atualizar: jest.fn(),
        remover: jest.fn(),
        verificarSeJaAvaliou: jest.fn(),
    }));
});

jest.mock('../../../models/Usuario.js', () => ({
    findById: jest.fn(),
}));

jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    const mockObjectId = jest.fn().mockImplementation((id) => {
        const value = id || new actualMongoose.Types.ObjectId().toString();
        return {
            toString: () => value,
            equals: (other) => value === other.toString(),
            _id: value,
        };
    });
    mockObjectId.isValid = jest.fn();
    return {
        ...actualMongoose,
        Types: {
            ObjectId: mockObjectId,
        },
    };
});

describe('AvaliacaoService', () => {
    let avaliacaoService;
    let repositoryMock;
    let req;

    beforeEach(() => {
        req = { params: {}, body: {}, query: {} };
        repositoryMock = new AvaliacaoRepository();
        avaliacaoService = new AvaliacaoService();
        avaliacaoService.repository = repositoryMock;
        jest.clearAllMocks();
        mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    });

    describe('listar', () => {
        it('deve listar avaliações para um equipamentoId válido', async () => {
            const mockData = {
                docs: [
                    {
                        _id: new mongoose.Types.ObjectId().toString(),
                        nota: 4.5,
                        descricao: 'Ótimo equipamento',
                        usuarios: new mongoose.Types.ObjectId().toString(),
                        equipamentos: new mongoose.Types.ObjectId().toString(),
                        createdAt: new Date(),
                    },
                ],
                totalDocs: 1,
                limit: 10,
                page: 1,
            };
            const equipamentoId = new mongoose.Types.ObjectId().toString();
            console.log('equipamentoId gerado:', equipamentoId);
            req.query = { equipamentoId: equipamentoId };
            repositoryMock.listar.mockResolvedValue(mockData);

            const result = await avaliacaoService.listar(req);

            expect(repositoryMock.listar).toHaveBeenCalledWith(req);
            expect(result).toEqual(mockData);
        });
        it('deve retornar mensagem de nenhuma avaliação encontrada se docs estiver vazio', async () => {
            const equipamentoId = new mongoose.Types.ObjectId().toString();
            console.log("EQUIPAMENTO", equipamentoId)
            const mockData = { docs: [], totalDocs: 0, limit: 10, page: 1 };

            const req = { query: { equipamentoId } };
            console.log(req)
            repositoryMock.listar.mockResolvedValue(mockData);

            const result = await avaliacaoService.listar(req);

            expect(repositoryMock.listar).toHaveBeenCalledWith(req);
            expect(result).toEqual({
                ...mockData,
                message: 'Nenhuma avaliação encontrada para este equipamento.',
            });
        });

        it('deve lançar erro se equipamentoId não for fornecido', async () => {
            req.query = {};

            await expect(avaliacaoService.listar(req)).rejects.toThrow(
                new CustomError({
                    statusCode: 400,
                    errorType: 'missingData',
                    field: 'equipamentoId',
                    customMessage: 'O ID do equipamento é obrigatório',
                })
            );
        });
    });

    describe('criar', () => {
        const validAvaliacaoData = {
            nota: 4.5,
            descricao: 'Ótimo equipamento',
            usuarioId: new mongoose.Types.ObjectId().toString(),
            equipamentoId: new mongoose.Types.ObjectId().toString(),
        };

        it('deve criar uma avaliação válida', async () => {
            repositoryMock.verificarSeJaAvaliou.mockResolvedValue(null);
            repositoryMock.criar.mockResolvedValue(validAvaliacaoData);

            const result = await avaliacaoService.criar(validAvaliacaoData);

            expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(validAvaliacaoData.usuarioId);
            expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(validAvaliacaoData.equipamentoId);
            expect(repositoryMock.verificarSeJaAvaliou).toHaveBeenCalledWith(
                validAvaliacaoData.usuarioId,
                validAvaliacaoData.equipamentoId
            );
            expect(repositoryMock.criar).toHaveBeenCalledWith(validAvaliacaoData);
            expect(result).toEqual(validAvaliacaoData);
        });

        it('deve lançar erro se usuarioId ou equipamentoId for inválido', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);
            const invalidData = { ...validAvaliacaoData, usuarioId: 'invalid-id' };

            await expect(avaliacaoService.criar(invalidData)).rejects.toThrow(
                new CustomError({
                    statusCode: 400,
                    errorType: 'invalidData',
                    field: 'IDs',
                    customMessage: 'ID de usuário ou equipamento inválido.',
                })
            );
        });

        it('deve lançar erro se nota não for um número entre 1 e 5', async () => {
            const invalidData = { ...validAvaliacaoData, nota: 6 };

            await expect(avaliacaoService.criar(invalidData)).rejects.toThrow(
                new CustomError({
                    statusCode: 400,
                    errorType: 'invalidData',
                    field: 'nota',
                    customMessage: 'A nota deve ser um número entre 1 e 5.',
                })
            );
        });

        it('deve lançar erro se usuário já avaliou o equipamento', async () => {
            repositoryMock.verificarSeJaAvaliou.mockResolvedValue({ _id: 'existing-avaliacao' });

            await expect(avaliacaoService.criar(validAvaliacaoData)).rejects.toThrow(
                new CustomError({
                    statusCode: 409,
                    errorType: 'conflict',
                    field: 'avaliacao',
                    customMessage: 'Usuário já avaliou este equipamento.',
                })
            );
        });
    });

    describe('atualizar', () => {
        const validUpdateData = {
            nota: 4.0,
            descricao: 'Atualizado',
        };
        const avaliacaoId = new mongoose.Types.ObjectId().toString();
        const usuarioId = new mongoose.Types.ObjectId().toString();

        it('deve atualizar uma avaliação válida', async () => {
            const mockAvaliacao = {
                _id: avaliacaoId,
                ...validUpdateData,
                usuarios: usuarioId,
                equipamentos: new mongoose.Types.ObjectId().toString(),
            };
            repositoryMock.atualizar.mockResolvedValue(mockAvaliacao);

            const result = await avaliacaoService.atualizar(avaliacaoId, usuarioId, validUpdateData);

            expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(avaliacaoId);
            expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(usuarioId);
            expect(repositoryMock.atualizar).toHaveBeenCalledWith(avaliacaoId, usuarioId, validUpdateData);
            expect(result).toEqual(mockAvaliacao);
        });

        it('deve atualizar apenas os campos fornecidos', async () => {
            const partialUpdateData = { nota: 4.0 };
            const mockAvaliacao = {
                _id: avaliacaoId,
                nota: 4.0,
                descricao: 'Original',
                usuarios: usuarioId,
                equipamentos: new mongoose.Types.ObjectId().toString(),
            };
            repositoryMock.atualizar.mockResolvedValue(mockAvaliacao);

            const result = await avaliacaoService.atualizar(avaliacaoId, usuarioId, partialUpdateData);

            expect(repositoryMock.atualizar).toHaveBeenCalledWith(avaliacaoId, usuarioId, partialUpdateData);
            expect(result).toEqual(mockAvaliacao);
        });

        it('deve lançar erro se avaliacaoId ou usuarioId for inválido', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);

            await expect(avaliacaoService.atualizar('invalid-id', usuarioId, validUpdateData)).rejects.toThrow(
                new CustomError({
                    statusCode: 400,
                    errorType: 'invalidData',
                    field: 'IDs',
                    customMessage: 'ID inválido.',
                })
            );
        });

        it('deve lançar erro se nota não for um número entre 1 e 5', async () => {
            const invalidUpdateData = { nota: 6 };

            await expect(avaliacaoService.atualizar(avaliacaoId, usuarioId, invalidUpdateData)).rejects.toThrow(
                new CustomError({
                    statusCode: 400,
                    errorType: 'invalidData',
                    field: 'nota',
                    customMessage: 'A nota deve ser um número entre 1 e 5.',
                })
            );
        });
    });

    describe('remover', () => {
        const avaliacaoId = new mongoose.Types.ObjectId().toString();
    const usuarioId = new mongoose.Types.ObjectId().toString();

    it('deve lançar erro se usuarioId for inválido', async () => {
        mongoose.Types.ObjectId.isValid.mockReturnValue(false);

        await expect(avaliacaoService.remover(avaliacaoId, 'invalid-id')).rejects.toThrow(
            new CustomError({
                statusCode: 400,
                errorType: 'invalidData',
                field: 'IDs',
                customMessage: 'ID inválido.',
            })
        );
    });

    it('deve lançar erro se usuário não for encontrado', async () => {
        mongoose.Types.ObjectId.isValid.mockReturnValue(true);
        Usuario.findById.mockResolvedValue(null);

        await expect(avaliacaoService.remover(avaliacaoId, usuarioId)).rejects.toThrow(
            new CustomError({
                statusCode: 403,
                errorType: 'unauthorized',
                field: 'Usuario',
                customMessage: 'Apenas administradores podem remover avaliações.',
            })
        );
    });

    it('deve remover avaliação se usuário for encontrado', async () => {
        mongoose.Types.ObjectId.isValid.mockReturnValue(true);
        Usuario.findById.mockResolvedValue({ _id: usuarioId });

        const mockRemocao = { acknowledged: true, deletedCount: 1 };
        repositoryMock.remover.mockResolvedValue(mockRemocao);

        const result = await avaliacaoService.remover(avaliacaoId, usuarioId);

        expect(Usuario.findById).toHaveBeenCalledWith(usuarioId);
        expect(repositoryMock.remover).toHaveBeenCalledWith(avaliacaoId, usuarioId);
        expect(result).toEqual(mockRemocao);
    });
    });
});