import mongoose from 'mongoose';
import AvaliacaoRepository from '../../../repositories/AvaliacaoRepository.js';
import Avaliacao from '../../../models/Avaliacao.js';
import Equipamento from '../../../models/Equipamento.js';
import Usuario from '../../../models/Usuario.js';
import { CustomError, messages } from "../../..//utils/helpers/index.js";
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

jest.mock('../../../repositories/filters/AvaliacaoFilterBuilder.js', () => {
    return jest.fn().mockImplementation(() => ({
        comOrdemNota: jest.fn().mockReturnThis(),
        comNotaMinima: jest.fn().mockReturnThis(),
        comNotaMaxima: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue({
            filtros: { nota: { $gte: 3 } },
            ordenacao: { nota: -1 },
        }),
    }));
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
        it('deve listar avaliações com filtros e paginação', async () => {
            const mockResultado = {
                docs: [{ _id: '123', toObject: jest.fn().mockReturnValue({ _id: '123' }) }],
                totalDocs: 1,
                page: 1,
                limit: 10,
            };

            const mockFiltros = { nota: { $gte: 3 } };
            const mockOrdenacao = { nota: -1 };

            const buildMock = jest.fn().mockReturnValue({
                filtros: mockFiltros,
                ordenacao: mockOrdenacao,
            });

            // sobrescrevendo o mock da classe com nova instância do mock correto
            AvaliacaoFilterBuilder.mockImplementation(() => ({
                comOrdemNota: jest.fn().mockReturnThis(),
                comNotaMinima: jest.fn().mockReturnThis(),
                comNotaMaxima: jest.fn().mockReturnThis(),
                build: buildMock,
            }));

            Avaliacao.paginate.mockResolvedValue(mockResultado);

            const req = {
                query: {
                    equipamentoId: '685de5ee33dc9509d2d7cc52',
                    notaMinima: '3',
                    page: '1',
                    limit: '10',
                },
            };

            const result = await avaliacaoRepository.listar(req);

            expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('685de5ee33dc9509d2d7cc52');

            expect(Avaliacao.paginate).toHaveBeenCalledWith(
                {
                    equipamentos: '685de5ee33dc9509d2d7cc52',
                    ...mockFiltros,
                },
                {
                    page: 1,
                    limit: 10,
                    sort: mockOrdenacao,
                    populate: [
                        { path: 'equipamentos', select: 'equiNome' },
                        { path: 'usuarios', select: 'nome' },
                    ],
                }
            );

            expect(result).toEqual(mockResultado);
        });

        it('deve lançar erro para equipamentoId inválido', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);

            const req = { query: { equipamentoId: 'invalid_id' } };

            await expect(avaliacaoRepository.listar(req)).rejects.toThrow('ID de equipamento inválido');
        });
    });
});
