import mongoose from 'mongoose';
import AvaliacaoRepository from '../../../repositories/AvaliacaoRepository.js';
import Avaliacao from '../../../models/Avaliacao.js';
import Equipamento from '../../../models/Equipamento.js';
import Usuario from '../../../models/Usuario.js';
import { CustomError, messages } from "../../../utils/helpers/index.js";
import AvaliacaoFilterBuilder from '../../../repositories/filters/AvaliacaoFilterBuilder.js';

class MockObjectId {
    constructor(id) {
        this.id = id;
    }
    toString() {
        return this.id;
    }
}

jest.mock('../../../models/Avaliacao.js');
jest.mock('../../../models/Equipamento.js');
jest.mock('../../../models/Usuario.js');

let mockFilterBuilderInstance;
jest.mock('../../../repositories/filters/AvaliacaoFilterBuilder.js', () => {
    const filterBuilderMock = {
        comOrdemNota: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue({
        filtros: { nota: { $gte: 3 } },
        ordenacao: { nota: -1 },
        }),
    };

    return jest.fn().mockImplementation(() => filterBuilderMock);
});


jest.mock('mongoose', () => {
    const originalMongoose = jest.requireActual('mongoose');
    const ObjectIdMock = jest.fn().mockImplementation((id) => new MockObjectId(id));
    ObjectIdMock.isValid = jest.fn().mockImplementation((id) => {
        return typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
    });
    return {
        ...originalMongoose,
        Types: {
            ObjectId: ObjectIdMock,
        },
    };
});

describe('AvaliacaoRepository', () => {
    let avaliacaoRepository;

    beforeEach(() => {
        avaliacaoRepository = new AvaliacaoRepository({
            avaliacaoModel: Avaliacao,
            equipamentoModel: Equipamento,
            usuarioModel: Usuario,
        });
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('deve listar avaliações com sucesso', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
        
            Avaliacao.paginate = jest.fn().mockResolvedValue('result_paginate');
        
            const req = { query: { equipamentoId: '1234567890abcdef12345678', page: '2', limit: '5' } };
        
            const result = await avaliacaoRepository.listar(req);
        
            expect(AvaliacaoFilterBuilder).toHaveBeenCalledWith(req.query);
            expect(result).toBe('result_paginate');
            expect(Avaliacao.paginate).toHaveBeenCalledWith(
              expect.objectContaining({ equipamentos: '1234567890abcdef12345678' }),
              expect.objectContaining({ page: 2, limit: 5 })
            );
          });
        
          it('deve lançar erro se paginate falhar', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            Avaliacao.paginate = jest.fn().mockRejectedValue(new Error('paginate fail'));
        
            const req = { query: { equipamentoId: '1234567890abcdef12345678' } };
        
            await expect(avaliacaoRepository.listar(req)).rejects.toThrow('paginate fail');
          });

        it('deve lançar erro para equipamentoId inválido', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);

            const req = { query: { equipamentoId: 'invalid_id' } };

            await expect(avaliacaoRepository.listar(req)).rejects.toThrow('ID de equipamento inválido');
        });
    });

    describe('criar', () => {
        it('deve criar uma nova avaliação', async () => {
            const mockDados = {
                nota: 4,
                descricao: 'Ótimo equipamento',
                usuarioId: '685de5ed33dc9509d2d7cbef',
                equipamentoId: '685de5ee33dc9509d2d7cc52',
            };
            const mockAvaliacao = { ...mockDados, _id: '1234567890abcdef12345678' };
    
            // Configurar o mock para retornar true para os IDs válidos
            mongoose.Types.ObjectId.isValid
                .mockReturnValueOnce(true) // Para usuarioId
                .mockReturnValueOnce(true); // Para equipamentoId

            Avaliacao.findOne.mockResolvedValue(null);
            Avaliacao.create.mockResolvedValue(mockAvaliacao);
            Equipamento.findByIdAndUpdate.mockResolvedValue({});
            avaliacaoRepository.recalcularMedia = jest.fn().mockResolvedValue();

            const result = await avaliacaoRepository.criar(mockDados);

            expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(mockDados.usuarioId);
            expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(mockDados.equipamentoId);
            expect(Avaliacao.findOne).toHaveBeenCalledWith({
                usuarios: mockDados.usuarioId,
                equipamentos: mockDados.equipamentoId,
            });
            expect(Avaliacao.create).toHaveBeenCalledWith({
                nota: mockDados.nota,
                descricao: mockDados.descricao,
                usuarios: mockDados.usuarioId,
                equipamentos: mockDados.equipamentoId,
            });
            expect(Equipamento.findByIdAndUpdate).toHaveBeenCalledWith(mockDados.equipamentoId, {
                $push: { equiAvaliacoes: mockAvaliacao._id },
            });
            expect(avaliacaoRepository.recalcularMedia).toHaveBeenCalledWith(mockDados.equipamentoId);
            expect(result).toEqual(mockAvaliacao);
        });

        it('deve lançar erro para IDs inválidos', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);

            const mockDados = {
                nota: 4,
                descricao: 'Ótimo equipamento',
                usuarioId: 'abcdef1234567890abcdef1',
                equipamentoId: 'abcdef1234567890abcdef12',
            };

            await expect(avaliacaoRepository.criar(mockDados)).rejects.toThrow(
                new CustomError({
                    statusCode: 400,
                    errorType: 'invalidData',
                    field: 'IDs',
                    customMessage: 'ID de usuário ou equipamento inválido.',
                })
            );
        });

        it('deve lançar erro se usuário já avaliou o equipamento', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            Avaliacao.findOne.mockResolvedValue({ _id: '1234567890abcdef12345678' });

            const mockDados = {
                nota: 4,
                descricao: 'Ótimo equipamento',
                usuarioId: '1234567890abcdef12345678',
                equipamentoId: 'abcdef1234567890abcdef12',
            };

            await expect(avaliacaoRepository.criar(mockDados)).rejects.toThrow(
                new CustomError({
                    statusCode: 409,
                    errorType: 'conflict',
                    field: 'avaliacao',
                    customMessage: 'Usuário já avaliou este equipamento.',
                })
            );
        });

        it('deve lançar erro genérico em caso de falha no banco', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            Avaliacao.findOne.mockRejectedValue(new Error('Erro no banco'));

            const mockDados = {
                nota: 4,
                descricao: 'Ótimo equipamento',
                usuarioId: '1234567890abcdef12345678',
                equipamentoId: 'abcdef1234567890abcdef12',
            };

            await expect(avaliacaoRepository.criar(mockDados)).rejects.toThrow(
                new CustomError({
                    statusCode: 500,
                    errorType: 'databaseError',
                    field: 'Avaliacao',
                    details: ['Erro no banco'],
                    customMessage: 'Erro ao criar avaliação.',
                })
            );
        });
        
    });

    describe('recalcularMedia', () => {
        it('deve lançar erro se findById falhar', async () => {
            Equipamento.findById.mockReturnValue({
              populate: jest.fn().mockRejectedValue(new Error('find fail')),
            });
        
            await expect(avaliacaoRepository.recalcularMedia('id')).rejects.toThrow('find fail');
        });

        it('deve recalcular a média de notas de um equipamento', async () => {
            const equipamentoId = 'abcdef1234567890abcdef12';
            const mockEquipamento = {
                _id: equipamentoId,
                equiAvaliacoes: [
                    { nota: 4 },
                    { nota: 5 },
                ],
            };

            Equipamento.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockEquipamento),
            });
            Equipamento.findByIdAndUpdate.mockResolvedValue({});

            await avaliacaoRepository.recalcularMedia(equipamentoId);

            expect(Equipamento.findById).toHaveBeenCalledWith(equipamentoId);
            expect(Equipamento.findByIdAndUpdate).toHaveBeenCalledWith(equipamentoId, {
                equiNotaMediaAvaliacao: '4.5',
            });
        });

        it('deve não atualizar se equipamento não for encontrado', async () => {
            Equipamento.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await avaliacaoRepository.recalcularMedia('abcdef1234567890abcdef12');

            expect(Equipamento.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('deve lidar com equipamento sem avaliações', async () => {
            const equipamentoId = 'abcdef1234567890abcdef12';
            const mockEquipamento = {
                _id: equipamentoId,
                equiAvaliacoes: [],
            };

            Equipamento.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockEquipamento),
            });
            Equipamento.findByIdAndUpdate.mockResolvedValue({});

            await avaliacaoRepository.recalcularMedia(equipamentoId);

            expect(Equipamento.findByIdAndUpdate).toHaveBeenCalledWith(equipamentoId, {
                equiNotaMediaAvaliacao: '0.0',
            });
        });
    });

    describe('verificar se já avaliou', () => {
        it('deve retornar verdadeiro se usuário já avaliou o equipamento', async () => {
            Avaliacao.exists.mockResolvedValue(true);

            const result = await avaliacaoRepository.verificarSeJaAvaliou(
                '1234567890abcdef12345678',
                'abcdef1234567890abcdef12'
            );

            expect(Avaliacao.exists).toHaveBeenCalledWith({
                usuarios: '1234567890abcdef12345678',
                equipamentos: 'abcdef1234567890abcdef12',
            });
            expect(result).toBe(true);
        });

        it('deve retornar falso se usuário não avaliou o equipamento', async () => {
            Avaliacao.exists.mockResolvedValue(false);

            const result = await avaliacaoRepository.verificarSeJaAvaliou(
                '1234567890abcdef12345678',
                'abcdef1234567890abcdef12'
            );

            expect(Avaliacao.exists).toHaveBeenCalledWith({
                usuarios: '1234567890abcdef12345678',
                equipamentos: 'abcdef1234567890abcdef12',
            });
            expect(result).toBe(false);
        });
    });

    describe('atualizar', () => {
            it('deve atualizar uma avaliação existente', async () => {
                const avaliacaoId = '1234567890abcdef12345678';
                const usuarioId = 'user1234567890abcdef1234';
                const mockAvaliacao = {
                    _id: avaliacaoId,
                    nota: 4,
                    descricao: 'Ótimo',
                    usuarios: new MockObjectId(usuarioId),
                    equipamentos: new MockObjectId('equip1234567890abcdef123'),
                    save: jest.fn().mockResolvedValue({}),
                };

                mongoose.Types.ObjectId.isValid.mockReturnValue(true);
                Avaliacao.findById.mockResolvedValue(mockAvaliacao);
                avaliacaoRepository.recalcularMedia = jest.fn().mockResolvedValue();

                const result = await avaliacaoRepository.atualizar(avaliacaoId, usuarioId, {
                    nota: 5,
                    descricao: 'Excelente',
                });

                expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(avaliacaoId);
                expect(Avaliacao.findById).toHaveBeenCalledWith(avaliacaoId);
                expect(mockAvaliacao.nota).toBe(5);
                expect(mockAvaliacao.descricao).toBe('Excelente');
                expect(mockAvaliacao.save).toHaveBeenCalled();
                expect(avaliacaoRepository.recalcularMedia).toHaveBeenCalledWith(mockAvaliacao.equipamentos);
                expect(result).toEqual(mockAvaliacao);
            });

            it('deve manter valores existentes se não fornecidos', async () => {
                const avaliacaoId = '1234567890abcdef12345678';
                const usuarioId = 'user1234567890abcdef1234';
                const mockAvaliacao = {
                    _id: avaliacaoId,
                    nota: 4,
                    descricao: 'Ótimo',
                    usuarios: new MockObjectId(usuarioId),
                    equipamentos: new MockObjectId('equip1234567890abcdef123'),
                    save: jest.fn().mockResolvedValue({}),
                };

                mongoose.Types.ObjectId.isValid.mockReturnValue(true);
                Avaliacao.findById.mockResolvedValue(mockAvaliacao);
                avaliacaoRepository.recalcularMedia = jest.fn().mockResolvedValue();

                await avaliacaoRepository.atualizar(avaliacaoId, usuarioId, { nota: 5 });

                expect(mockAvaliacao.nota).toBe(5);
                expect(mockAvaliacao.descricao).toBe('Ótimo');
                expect(mockAvaliacao.save).toHaveBeenCalled();
            });

            it('deve lançar erro para ID inválido', async () => {
                mongoose.Types.ObjectId.isValid.mockReturnValue(false);

                await expect(
                    avaliacaoRepository.atualizar('invalid_id', 'user123', { nota: 5 })
                ).rejects.toThrow(
                    new CustomError({
                        statusCode: 400,
                        errorType: 'invalidData',
                        field: 'IDs',
                        customMessage: 'ID inválido.',
                    })
                );
            });

            it('deve lançar erro se avaliação não for encontrada', async () => {
                mongoose.Types.ObjectId.isValid.mockReturnValue(true);
                Avaliacao.findById.mockResolvedValue(null);

                await expect(
                    avaliacaoRepository.atualizar('1234567890abcdef12345678', 'user123', { nota: 5 })
                ).rejects.toThrow(
                    new CustomError({
                        statusCode: 404,
                        errorType: 'resourceNotFound',
                        field: 'Avaliacao',
                        customMessage: 'Avaliação não encontrada.',
                    })
                );
            });

            it('deve lançar erro se usuário não for o dono da avaliação', async () => {
                const avaliacaoId = '1234567890abcdef12345678';
                const mockAvaliacao = {
                    _id: avaliacaoId,
                    usuarios: new MockObjectId('other_user123'),
                };

                mongoose.Types.ObjectId.isValid.mockReturnValue(true);
                Avaliacao.findById.mockResolvedValue(mockAvaliacao);

                await expect(
                    avaliacaoRepository.atualizar(avaliacaoId, 'user123', { nota: 5 })
                ).rejects.toThrow(
                    new CustomError({
                        statusCode: 403,
                        errorType: 'unauthorized',
                        field: 'Avaliacao',
                        customMessage: 'Você só pode editar suas próprias avaliações.',
                    })
                );
            });

            it('deve lançar erro genérico em caso de falha no banco', async () => {
                mongoose.Types.ObjectId.isValid.mockReturnValue(true);
                Avaliacao.findById.mockRejectedValue(new Error('Erro no banco'));

                await expect(
                    avaliacaoRepository.atualizar('1234567890abcdef12345678', 'user123', { nota: 5 })
                ).rejects.toThrow(
                    new CustomError({
                        statusCode: 500,
                        errorType: 'databaseError',
                        field: 'Avaliacao',
                        details: ['Erro no banco'],
                        customMessage: 'Erro ao atualizar avaliação.',
                    })
                );
            });
    });

    describe('remover', () => {
        it('deve remover uma avaliação', async () => {
            const avaliacaoId = '1234567890abcdef12345678';
            const mockAvaliacao = {
                _id: avaliacaoId,
                equipamentos: new MockObjectId('equip1234567890abcdef123'),
            };

            Avaliacao.findById.mockResolvedValue(mockAvaliacao);
            Avaliacao.findByIdAndDelete.mockResolvedValue({});
            Equipamento.findByIdAndUpdate.mockResolvedValue({});
            avaliacaoRepository.recalcularMedia = jest.fn().mockResolvedValue();

            const result = await avaliacaoRepository.remover(avaliacaoId, 'user123');

            expect(Avaliacao.findById).toHaveBeenCalledWith(avaliacaoId);
            expect(Equipamento.findByIdAndUpdate).toHaveBeenCalledWith(mockAvaliacao.equipamentos, {
                $pull: { equiAvaliacoes: avaliacaoId },
            });
            expect(Avaliacao.findByIdAndDelete).toHaveBeenCalledWith(avaliacaoId);
            expect(avaliacaoRepository.recalcularMedia).toHaveBeenCalledWith(mockAvaliacao.equipamentos);
            expect(result).toEqual({ success: true, message: 'Avaliação removida com sucesso.' });
        });

        it('deve lançar erro se avaliação não for encontrada', async () => {
            Avaliacao.findById.mockResolvedValue(null);

            await expect(
                avaliacaoRepository.remover('1234567890abcdef12345678', 'user123')
            ).rejects.toThrow(
                new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Avaliacao',
                    customMessage: 'Avaliação não encontrada.',
                })
            );
        });
    });
});
