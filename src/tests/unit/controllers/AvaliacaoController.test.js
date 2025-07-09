import { beforeEach, describe, expect, jest } from '@jest/globals';
import AvaliacaoController from '../../../controllers/AvaliacaoController.js';
import AvaliacaoService from '../../../services/AvaliacaoService.js';
import mongoose from 'mongoose';

jest.mock('../../../services/AvaliacaoService.js');

describe('AvaliacaoController', () => {
    let req, res, avaliacaoController;

    beforeEach(() => {
        req = { params: {}, body: {}, query: {}, user: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        AvaliacaoService.mockClear();
        avaliacaoController = new AvaliacaoController();
    });

    describe('listar', () => {
        it('deve listar todas as avaliações', async () => {
            const mockData = [
                {
                    _id: new mongoose.Types.ObjectId().toString(),
                    nota: 4.5,
                    descricao: 'Ótimo equipamento',
                    usuarios: new mongoose.Types.ObjectId(),
                    equipamentos: new mongoose.Types.ObjectId(),
                    createdAt: new Date(),
                },
            ];
            avaliacaoController.service.listar.mockResolvedValue(mockData);
            await avaliacaoController.listar(req, res);
            expect(avaliacaoController.service.listar).toHaveBeenCalledTimes(1);
            expect(avaliacaoController.service.listar).toHaveBeenCalledWith(req);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockData,
                errors: [],
                message: 'Avaliações listadas com sucesso.',
            });
        });

        it('deve listar avaliações pelas queries', async () => {
            const mockData = [
                {
                    _id: new mongoose.Types.ObjectId().toString(),
                    nota: 4.5,
                    descricao: 'Ótimo equipamento',
                    usuarios: new mongoose.Types.ObjectId(),
                    equipamentos: new mongoose.Types.ObjectId(),
                    createdAt: new Date(),
                },
            ];
            req.query = { notaMinima: '4', equipamentoId: new mongoose.Types.ObjectId().toString() };
            avaliacaoController.service.listar.mockResolvedValue(mockData);
            await avaliacaoController.listar(req, res);
            expect(avaliacaoController.service.listar).toHaveBeenCalledTimes(1);
            expect(avaliacaoController.service.listar).toHaveBeenCalledWith(req);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockData,
                errors: [],
                message: 'Avaliações listadas com sucesso.',
            });
        });
    });

    describe('criar', () => {
        it('deve criar uma avaliação com dados válidos usando req.user.id', async () => {
            const mockAvaliacao = {
                _id: new mongoose.Types.ObjectId().toString(),
                nota: 4.5,
                descricao: 'Ótimo equipamento',
                usuarios: new mongoose.Types.ObjectId(),
                equipamentos: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
            };
            req.user.id = mockAvaliacao.usuarios.toString();
            req.query = { equipamentoId: mockAvaliacao.equipamentos.toString() };
            req.body = { nota: 4.5, descricao: 'Ótimo equipamento' };
            avaliacaoController.service.criar.mockResolvedValue(mockAvaliacao);
            await avaliacaoController.criar(req, res);
            expect(avaliacaoController.service.criar).toHaveBeenCalledTimes(1);
            expect(avaliacaoController.service.criar).toHaveBeenCalledWith({
                nota: 4.5,
                descricao: 'Ótimo equipamento',
                equipamentoId: mockAvaliacao.equipamentos.toString(),
                usuarioId: mockAvaliacao.usuarios.toString(),
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                data: mockAvaliacao,
                errors: [],
                message: 'Avaliação criada com sucesso.',
            });
        });

        it('deve criar uma avaliação com usuarioId via query', async () => {
            const mockAvaliacao = {
                _id: new mongoose.Types.ObjectId().toString(),
                nota: 4.5,
                descricao: 'Ótimo equipamento',
                usuarios: new mongoose.Types.ObjectId(),
                equipamentos: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
            };
            req.query = {
                usuarioId: mockAvaliacao.usuarios.toString(),
                equipamentoId: mockAvaliacao.equipamentos.toString(),
            };
            req.body = { nota: 4.5, descricao: 'Ótimo equipamento' };
            avaliacaoController.service.criar.mockResolvedValue(mockAvaliacao);
            await avaliacaoController.criar(req, res);
            expect(avaliacaoController.service.criar).toHaveBeenCalledTimes(1);
            expect(avaliacaoController.service.criar).toHaveBeenCalledWith({
                nota: 4.5,
                descricao: 'Ótimo equipamento',
                equipamentoId: mockAvaliacao.equipamentos.toString(),
                usuarioId: mockAvaliacao.usuarios.toString(),
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                data: mockAvaliacao,
                errors: [],
                message: 'Avaliação criada com sucesso.',
            });
        });
    });

    describe('atualizar', () => {
        it('deve atualizar uma avaliação usando req.user.id', async () => {
            const mockAvaliacao = {
                _id: new mongoose.Types.ObjectId().toString(),
                nota: 4.0,
                descricao: 'Equipamento atualizado',
                usuarios: new mongoose.Types.ObjectId(),
                equipamentos: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
            };
            req.params = { id: mockAvaliacao._id };
            req.user.id = mockAvaliacao.usuarios.toString();
            req.body = { nota: 4.0, descricao: 'Equipamento atualizado' };
            avaliacaoController.service.atualizar.mockResolvedValue(mockAvaliacao);
            await avaliacaoController.atualizar(req, res);
            expect(avaliacaoController.service.atualizar).toHaveBeenCalledTimes(1);
            expect(avaliacaoController.service.atualizar).toHaveBeenCalledWith(
                mockAvaliacao._id,
                mockAvaliacao.usuarios.toString(),
                { nota: 4.0, descricao: 'Equipamento atualizado' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockAvaliacao,
                errors: [],
                message: 'Avaliação atualizada com sucesso.',
            });
        });

        it('deve atualizar uma avaliação usando usuarioId via query', async () => {
            const mockAvaliacao = {
                _id: new mongoose.Types.ObjectId().toString(),
                nota: 4.0,
                descricao: 'Equipamento atualizado',
                usuarios: new mongoose.Types.ObjectId(),
                equipamentos: new mongoose.Types.ObjectId(),
                createdAt: new Date(),
            };
            req.params = { id: mockAvaliacao._id };
            req.query = { usuarioId: mockAvaliacao.usuarios.toString() };
            req.body = { nota: 4.0, descricao: 'Equipamento atualizado' };
            avaliacaoController.service.atualizar.mockResolvedValue(mockAvaliacao);
            await avaliacaoController.atualizar(req, res);
            expect(avaliacaoController.service.atualizar).toHaveBeenCalledTimes(1);
            expect(avaliacaoController.service.atualizar).toHaveBeenCalledWith(
                mockAvaliacao._id,
                mockAvaliacao.usuarios.toString(),
                { nota: 4.0, descricao: 'Equipamento atualizado' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockAvaliacao,
                errors: [],
                message: 'Avaliação atualizada com sucesso.',
            });
        });

        it('deve retornar erro ao tentar atualizar com id inválido', async () => {
            req.params = { id: 'invalid-id' };
            req.user.id = new mongoose.Types.ObjectId().toString();
            req.body = { nota: 4.0, descricao: 'Equipamento atualizado' };
            avaliacaoController.service.atualizar.mockRejectedValue(new Error('ID inválido'));
            await expect(avaliacaoController.atualizar(req, res)).rejects.toThrow('ID inválido');
        });
    });

    describe('remover', () => {
        it('deve remover uma avaliação usando req.user.id', async () => {
            const mockAvaliacaoId = new mongoose.Types.ObjectId().toString();
            const mockUsuarioId = new mongoose.Types.ObjectId().toString();
            req.params = { id: mockAvaliacaoId };
            req.user.id = mockUsuarioId;
            avaliacaoController.service.remover.mockResolvedValue({ _id: mockAvaliacaoId });
            await avaliacaoController.remover(req, res);
            expect(avaliacaoController.service.remover).toHaveBeenCalledTimes(1);
            expect(avaliacaoController.service.remover).toHaveBeenCalledWith(mockAvaliacaoId, mockUsuarioId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: { _id: mockAvaliacaoId },
                errors: [],
                message: 'Avaliação removida com sucesso.',
            });
        });

        it('deve remover uma avaliação usando usuarioId via query', async () => {
            const mockAvaliacaoId = new mongoose.Types.ObjectId().toString();
            const mockUsuarioId = new mongoose.Types.ObjectId().toString();
            req.params = { id: mockAvaliacaoId };
            req.query = { usuarioId: mockUsuarioId };
            avaliacaoController.service.remover.mockResolvedValue({ _id: mockAvaliacaoId });
            await avaliacaoController.remover(req, res);
            expect(avaliacaoController.service.remover).toHaveBeenCalledTimes(1);
            expect(avaliacaoController.service.remover).toHaveBeenCalledWith(mockAvaliacaoId, mockUsuarioId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: { _id: mockAvaliacaoId },
                errors: [],
                message: 'Avaliação removida com sucesso.',
            });
        });

        it('deve remover uma avaliação usando usuarioId via body', async () => {
            const mockAvaliacaoId = new mongoose.Types.ObjectId().toString();
            const mockUsuarioId = new mongoose.Types.ObjectId().toString();
            req.params = { id: mockAvaliacaoId };
            req.body = { usuarioId: mockUsuarioId };
            avaliacaoController.service.remover.mockResolvedValue({ _id: mockAvaliacaoId });
            await avaliacaoController.remover(req, res);
            expect(avaliacaoController.service.remover).toHaveBeenCalledTimes(1);
            expect(avaliacaoController.service.remover).toHaveBeenCalledWith(mockAvaliacaoId, mockUsuarioId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: { _id: mockAvaliacaoId },
                errors: [],
                message: 'Avaliação removida com sucesso.',
            });
        });

        it('deve retornar erro ao tentar remover com id inválido', async () => {
            req.params = { id: 'invalid-id' };
            req.user.id = new mongoose.Types.ObjectId().toString();
            avaliacaoController.service.remover.mockRejectedValue(new Error('ID inválido'));
            await expect(avaliacaoController.remover(req, res)).rejects.toThrow('ID inválido');
        });
    });
});