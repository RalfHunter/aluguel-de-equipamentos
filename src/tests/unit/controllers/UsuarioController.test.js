import { beforeEach, describe, expect, jest } from "@jest/globals";
import UsuarioController from "../../../controllers/UsuarioController.js";
import UsuarioService from "../../../services/UsuarioService.js";
import fs from 'fs';
import sizeOf from 'image-size';

jest.mock("../../../services/UsuarioService.js");
jest.mock('fs');
jest.mock('image-size');
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn()
}));
jest.mock('../../../utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('UsuarioController', () => {
  let req, res, usuarioController;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    UsuarioService.mockClear();
    usuarioController = new UsuarioController();
  });

  describe('listar', () => {
    it('deve listar todos os usuários', async () => {
      const mockData = [{ id: '67959501ea0999e0a0fa9f58', nome: 'Usuario' }];
      usuarioController.service.listar.mockResolvedValue(mockData);
      await usuarioController.listar(req, res);
      expect(usuarioController.service.listar).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: mockData,
        errors: [],
        message: "Requisição bem-sucedida"
      });
    });

    it('deve listar um usuário por id com params', async () => {
      const mockData = { id: '67959501ea0999e0a0fa9f58', nome: 'Usuario' };
      req.params = { id: mockData.id };
      usuarioController.service.listar.mockResolvedValue(mockData);
      await usuarioController.listar(req, res);
      expect(res.json).toHaveBeenCalledWith({
        data: mockData,
        errors: [],
        message: "Requisição bem-sucedida"
      });
    });

    it('deve listar um usuário pelas queries', async () => {
      const mockData = [
        { id: '1', nome: 'Usuario', email: 'usuario@gmail.com' },
        { id: '2', nome: 'Usuario Dois', email: 'usuario2@gmail.com' }
      ];
      req.query = { email: 'usuario@gmail.com' };
      usuarioController.service.listar.mockResolvedValue(mockData[0]);
      await usuarioController.listar(req, res);
      expect(res.json).toHaveBeenCalledWith({
        data: mockData[0],
        errors: [],
        message: "Requisição bem-sucedida"
      });
    });
  });

  describe('cadastrar', () => {
    it('deve cadastrar um usuário pelo body', async () => {
      req.body = {
        nome: "TESTE",
        email: "teste1234@gmail.com",
        telefone: "(69) 99999-8888",
        senha: "Laravel@123",
        dataNascimento: "2000-08-08",
        CPF: "96945788253",
        ativo: true,
        tipoUsuario: "usuario",
        fotoUsuario: "http://lorempixel.com/640/480"
      };
      const mockResponse = { ...req.body, id: '67959501ea0999e0a0fa9f59' };
      usuarioController.service.cadastrarUsuario.mockResolvedValue(mockResponse);
      await usuarioController.cadastrarUsuario(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        data: mockResponse,
        errors: [],
        message: 'Usuário criado com sucesso!'
      });
    });
  });

  describe('alterarStatus', () => {
    it('deve alterar status com sucesso', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f59' };
      req.body = { email: 'usuario@gmail.com', ativo: false };
      usuarioController.service.alterarStatus.mockResolvedValue(req.body);
      await usuarioController.alterarStatus(req, res);
      expect(usuarioController.service.alterarStatus).toHaveBeenCalledWith(req.params.id, req.body, req);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: req.body,
        errors: [],
        message: 'Status alterado com sucesso para false'
      });
    });

    it('deve falhar ao validar id', async () => {
      req.params = { id: null };
      req.body = { email: 'usuario@gmail.com', ativo: false };
      await expect(usuarioController.alterarStatus(req, res)).rejects.toThrow();
    });

    it('deve falhar ao validar body inválido', async () => {
      req.params = { id: null };
      req.body = { email: 'usuario@', ativo: 'invalido' };
      await expect(usuarioController.alterarStatus(req, res)).rejects.toThrow();
    });

    it('deve falhar ao validar ausência de params', async () => {
      req.params = null;
      req.body = { email: 'usuario@', ativo: 'invalido' };
      await expect(usuarioController.alterarStatus(req, res)).rejects.toThrow();
    });
  });
  describe('criaComSenha', () =>{
        it('deve ter sucesso ao criar usuário com senha', async ()=>{
            req.body ={
                nome:"Nome Valido",
                email:"email@gmail.com",
                telefone:"69 9898-5555",
                senha: "Senha@1234",
                dataNascimento:"2001-01-01",
                CPF:"29116291085",
                fotoUsuario:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmTF0S7JfdTHAJiZ8WrkwclOW8Eutb3fsOGA&s"
            }
            
            // O schema adiciona campos padrão, então vamos criar o objeto esperado
            const expectedData = {
                ...req.body,
                tipoUsuario: "usuario"
            };
            
            // Mock que simula um documento retornado do serviço
            const mockUsuarioData = {
                ...expectedData,
                _id: '67959501ea0999e0a0fa9f58'
            };
            
            usuarioController.service.cadastrarUsuario.mockResolvedValue(mockUsuarioData)
            await usuarioController.criarComSenha(req, res)
            expect(usuarioController.service.cadastrarUsuario).toHaveBeenCalledWith(expectedData)
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: mockUsuarioData
            }))
        })

        it('deve falhar ao validar dados inválidos', async () => {
            req.body = {
                nome: "",
                email: "email-invalido",
                telefone: "123",
                senha: "123"
            };

            await expect(usuarioController.criarComSenha(req, res)).rejects.toThrow();
        });

        it('deve retornar erro do serviço quando falha', async () => {
            req.body = {
                nome:"Nome Valido",
                email:"email@gmail.com",
                telefone:"69 9898-5555",
                senha: "Senha@1234",
                dataNascimento:"2001-01-01",
                CPF:"29116291085",
                fotoUsuario:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmTF0S7JfdTHAJiZ8WrkwclOW8Eutb3fsOGA&s"
            };

            usuarioController.service.cadastrarUsuario.mockRejectedValue(new Error('Erro do serviço'));

            await expect(usuarioController.criarComSenha(req, res)).rejects.toThrow('Erro do serviço');
        });
    })

  describe('fotoUpload', () => {
    let next;

    beforeEach(() => {
      next = jest.fn();
    });

    it('deve fazer upload de foto com sucesso', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      req.file = {
        filename: 'test-image.jpg',
        originalname: 'original-test.jpg',
        mimetype: 'image/jpeg',
        size: 1024000, // 1MB
        path: '/fake/path/test-image.jpg'
      };
      req.protocol = 'http';
      req.get = jest.fn().mockReturnValue('localhost:3000');

      const mockFotoProcessada = {
        url: 'http://localhost:3000/uploads/usuarios/test-image.jpg',
        largura: 800,
        altura: 600,
        tamanhoMb: 0.98,
        nomeOriginal: 'original-test.jpg'
      };

      const mockResultado = {
        id: req.params.id,
        fotoUsuario: 'test-image.jpg'
      };

      // Mock dos métodos privados
      usuarioController._validarArquivoImagem = jest.fn();
      usuarioController._obterDimensoesImagem = jest.fn().mockReturnValue({
        width: 800,
        height: 600
      });
      usuarioController._processarImagemParaFoto = jest.fn().mockReturnValue(mockFotoProcessada);
      
      usuarioController.service.atualizarFotoUsuario.mockResolvedValue(mockResultado);

      await usuarioController.fotoUpload(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          message: 'Foto atualizada com sucesso.',
          dados: mockResultado,
          metadados: mockFotoProcessada
        },
        errors: [],
        message: "Requisição bem-sucedida"
      });
    });

    it('deve retornar erro quando nenhum arquivo é enviado', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      req.file = null;

      await usuarioController.fotoUpload(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          customMessage: 'Nenhum arquivo foi enviado.'
        })
      );
    });

    it('deve retornar erro quando id é inválido', async () => {
      req.params = { id: 'invalid-id' };
      req.file = {
        filename: 'test-image.jpg',
        mimetype: 'image/jpeg'
      };

      await usuarioController.fotoUpload(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          issues: expect.arrayContaining([
            expect.objectContaining({
              message: 'ID inválido'
            })
          ])
        })
      );
    });

    it('deve chamar métodos privados corretamente no upload', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      req.file = {
        filename: 'test-image.jpg',
        originalname: 'original-test.jpg',
        mimetype: 'image/jpeg',
        size: 1024000,
        path: '/fake/path/test-image.jpg'
      };
      req.protocol = 'http';
      req.get = jest.fn().mockReturnValue('localhost:3000');

      // Mock dos métodos privados para testar se são chamados
      usuarioController._validarArquivoImagem = jest.fn();
      usuarioController._obterDimensoesImagem = jest.fn().mockReturnValue({
        width: 800,
        height: 600
      });
      usuarioController._processarImagemParaFoto = jest.fn().mockReturnValue({
        url: 'http://localhost:3000/uploads/usuarios/test-image.jpg',
        largura: 800,
        altura: 600,
        tamanhoMb: 0.98,
        nomeOriginal: 'original-test.jpg'
      });
      
      usuarioController.service.atualizarFotoUsuario.mockResolvedValue({
        id: req.params.id,
        fotoUsuario: 'test-image.jpg'
      });

      await usuarioController.fotoUpload(req, res, next);

      expect(usuarioController._processarImagemParaFoto).toHaveBeenCalledWith(req.file, req);
    });

    it('deve retornar erro quando processamento de imagem falha', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      req.file = {
        filename: 'test-image.jpg',
        originalname: 'original-test.jpg',
        mimetype: 'image/jpeg',
        size: 1024000,
        path: '/fake/path/test-image.jpg'
      };

      // Mock para simular erro no processamento
      usuarioController._processarImagemParaFoto = jest.fn().mockImplementation(() => {
        throw new Error('Erro no processamento da imagem');
      });

      await usuarioController.fotoUpload(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Erro no processamento da imagem'
        })
      );
    });

    it('deve retornar erro quando serviço de atualização falha', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      req.file = {
        filename: 'test-image.jpg',
        originalname: 'original-test.jpg',
        mimetype: 'image/jpeg',
        size: 1024000,
        path: '/fake/path/test-image.jpg'
      };
      req.protocol = 'http';
      req.get = jest.fn().mockReturnValue('localhost:3000');

      usuarioController._processarImagemParaFoto = jest.fn().mockReturnValue({
        url: 'http://localhost:3000/uploads/usuarios/test-image.jpg',
        largura: 800,
        altura: 600,
        tamanhoMb: 0.98,
        nomeOriginal: 'original-test.jpg'
      });
      
      usuarioController.service.atualizarFotoUsuario.mockRejectedValue(new Error('Erro do serviço'));

      await usuarioController.fotoUpload(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Erro do serviço'
        })
      );
    });
  });

  describe('getFoto', () => {
    it('deve buscar foto do usuário com sucesso', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      
      const mockCaminhoFoto = 'uploads/usuarios/test-image.jpg';
      usuarioController.service.getFoto.mockResolvedValue(mockCaminhoFoto);

      res.setHeader = jest.fn();
      res.sendFile = jest.fn();

      await usuarioController.getFoto(req, res);

      expect(usuarioController.service.getFoto).toHaveBeenCalledWith(req.params.id);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(res.sendFile).toHaveBeenCalledWith('test-image.jpg', {
        root: expect.any(String)
      });
    });

    it('deve retornar content-type correto para PNG', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      
      const mockCaminhoFoto = 'uploads/usuarios/test-image.png';
      usuarioController.service.getFoto.mockResolvedValue(mockCaminhoFoto);

      res.setHeader = jest.fn();
      res.sendFile = jest.fn();

      await usuarioController.getFoto(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    });

    it('deve usar content-type padrão para extensão desconhecida', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      
      const mockCaminhoFoto = 'uploads/usuarios/test-image.unknown';
      usuarioController.service.getFoto.mockResolvedValue(mockCaminhoFoto);

      res.setHeader = jest.fn();
      res.sendFile = jest.fn();

      await usuarioController.getFoto(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
    });

    it('deve falhar ao validar id inválido', async () => {
      req.params = { id: 'invalid-id' };

      await expect(usuarioController.getFoto(req, res)).rejects.toThrow();
    });
  });

  describe('deletarUsuario', () => {
    it('deve deletar usuário com sucesso', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      
      const mockData = {
        id: req.params.id,
        message: 'Usuário deletado com sucesso'
      };

      usuarioController.service.deletarUsuario.mockResolvedValue(mockData);

      await usuarioController.deletarUsuario(req, res);

      expect(usuarioController.service.deletarUsuario).toHaveBeenCalledWith(req, req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: mockData,
        errors: [],
        message: 'Usuário excluído com sucesso.'
      });
    });

    it('deve falhar ao validar id inválido', async () => {
      req.params = { id: null };

      await expect(usuarioController.deletarUsuario(req, res)).rejects.toThrow();
    });

    it('deve falhar quando params não existe', async () => {
      req.params = null;

      await expect(usuarioController.deletarUsuario(req, res)).rejects.toThrow();
    });
  });

  describe('Métodos privados de validação de imagem', () => {
    describe('_validarHeaderImagem', () => {
      it('deve validar header JPEG corretamente', () => {
        const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
        const resultado = usuarioController._validarHeaderImagem(jpegBuffer);
        expect(resultado).toBe(true);
      });

      it('deve validar header PNG corretamente', () => {
        const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
        const resultado = usuarioController._validarHeaderImagem(pngBuffer);
        expect(resultado).toBe(true);
      });

      it('deve retornar false para buffer inválido', () => {
        const invalidBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
        const resultado = usuarioController._validarHeaderImagem(invalidBuffer);
        expect(resultado).toBe(false);
      });

      it('deve retornar false para buffer muito pequeno', () => {
        const smallBuffer = Buffer.from([0xFF, 0xD8]);
        const resultado = usuarioController._validarHeaderImagem(smallBuffer);
        expect(resultado).toBe(false);
      });

      it('deve retornar false para entrada não-buffer', () => {
        const resultado = usuarioController._validarHeaderImagem("not a buffer");
        expect(resultado).toBe(false);
      });
    });

    describe('_validarArquivoImagem', () => {
      it('deve validar arquivo de imagem válido', () => {
        const file = {
          mimetype: 'image/jpeg',
          path: '/path/to/image.jpg',
          size: 1024000, // 1MB
          originalname: 'test.jpg'
        };

        expect(() => usuarioController._validarArquivoImagem(file)).not.toThrow();
      });

      it('deve lançar erro para arquivo que não é imagem', () => {
        const file = {
          mimetype: 'text/plain',
          path: '/path/to/file.txt',
          size: 1024,
          originalname: 'test.txt'
        };

        expect(() => usuarioController._validarArquivoImagem(file)).toThrow('Arquivo test.txt não é uma imagem válida.');
      });

      it('deve lançar erro para arquivo sem path', () => {
        const file = {
          mimetype: 'image/jpeg',
          path: null,
          size: 1024,
          originalname: 'test.jpg'
        };

        expect(() => usuarioController._validarArquivoImagem(file)).toThrow('Arquivo test.jpg está vazio ou corrompido.');
      });

      it('deve lançar erro para arquivo com tamanho zero', () => {
        const file = {
          mimetype: 'image/jpeg',
          path: '/path/to/image.jpg',
          size: 0,
          originalname: 'test.jpg'
        };

        expect(() => usuarioController._validarArquivoImagem(file)).toThrow('Arquivo test.jpg está vazio ou corrompido.');
      });

      it('deve lançar erro para arquivo muito grande', () => {
        const file = {
          mimetype: 'image/jpeg',
          path: '/path/to/image.jpg',
          size: 6 * 1024 * 1024, // 6MB
          originalname: 'test.jpg'
        };

        expect(() => usuarioController._validarArquivoImagem(file)).toThrow('Arquivo test.jpg excede o tamanho máximo de 5MB.');
      });
    });

    describe('_obterDimensoesImagem', () => {
      beforeEach(() => {
        fs.existsSync.mockClear();
        fs.statSync.mockClear();
        fs.readFileSync.mockClear();
        sizeOf.mockClear();
      });

      it('deve obter dimensões da imagem com sucesso', () => {
        const caminhoArquivo = '/path/to/image.jpg';
        const mockBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG header
        
        fs.existsSync.mockReturnValue(true);
        fs.statSync.mockReturnValue({ size: 1024 });
        fs.readFileSync.mockReturnValue(mockBuffer);
        sizeOf.mockReturnValue({ width: 800, height: 600 });

        usuarioController._validarHeaderImagem = jest.fn().mockReturnValue(true);

        const resultado = usuarioController._obterDimensoesImagem(caminhoArquivo);

        expect(resultado).toEqual({ width: 800, height: 600 });
        expect(fs.existsSync).toHaveBeenCalledWith(caminhoArquivo);
        expect(fs.statSync).toHaveBeenCalledWith(caminhoArquivo);
        expect(fs.readFileSync).toHaveBeenCalledWith(caminhoArquivo);
        expect(sizeOf).toHaveBeenCalledWith(mockBuffer);
      });

      it('deve lançar erro para arquivo não encontrado', () => {
        const caminhoArquivo = '/path/to/nonexistent.jpg';
        fs.existsSync.mockReturnValue(false);

        expect(() => usuarioController._obterDimensoesImagem(caminhoArquivo)).toThrow('Arquivo não encontrado');
      });

      it('deve lançar erro para arquivo vazio', () => {
        const caminhoArquivo = '/path/to/empty.jpg';
        fs.existsSync.mockReturnValue(true);
        fs.statSync.mockReturnValue({ size: 0 });

        expect(() => usuarioController._obterDimensoesImagem(caminhoArquivo)).toThrow('Arquivo está vazio');
      });

      it('deve lançar erro para header de imagem inválido', () => {
        const caminhoArquivo = '/path/to/invalid.jpg';
        const mockBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
        
        fs.existsSync.mockReturnValue(true);
        fs.statSync.mockReturnValue({ size: 1024 });
        fs.readFileSync.mockReturnValue(mockBuffer);

        usuarioController._validarHeaderImagem = jest.fn().mockReturnValue(false);

        expect(() => usuarioController._obterDimensoesImagem(caminhoArquivo)).toThrow('Arquivo não é uma imagem válida');
      });

      it('deve lançar erro quando sizeOf retorna dimensões inválidas', () => {
        const caminhoArquivo = '/path/to/image.jpg';
        const mockBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
        
        fs.existsSync.mockReturnValue(true);
        fs.statSync.mockReturnValue({ size: 1024 });
        fs.readFileSync.mockReturnValue(mockBuffer);
        sizeOf.mockReturnValue({ width: null, height: null });

        usuarioController._validarHeaderImagem = jest.fn().mockReturnValue(true);

        expect(() => usuarioController._obterDimensoesImagem(caminhoArquivo)).toThrow('Não foi possível obter dimensões válidas');
      });
    });

    describe('_processarImagemParaFoto', () => {
      it('deve processar imagem para foto com sucesso', () => {
        const file = {
          filename: 'test-image.jpg',
          originalname: 'original-test.jpg',
          mimetype: 'image/jpeg',
          size: 1024000,
          path: '/path/to/test-image.jpg'
        };

        const req = {
          protocol: 'http',
          get: jest.fn().mockReturnValue('localhost:3000')
        };

        usuarioController._validarArquivoImagem = jest.fn();
        usuarioController._obterDimensoesImagem = jest.fn().mockReturnValue({
          width: 800,
          height: 600
        });

        const resultado = usuarioController._processarImagemParaFoto(file, req);

        expect(resultado).toEqual({
          url: 'http://localhost:3000/uploads/usuarios/test-image.jpg',
          largura: 800,
          altura: 600,
          tamanhoMb: 0.98,
          nomeOriginal: 'original-test.jpg'
        });

        expect(usuarioController._validarArquivoImagem).toHaveBeenCalledWith(file);
        expect(usuarioController._obterDimensoesImagem).toHaveBeenCalledWith(file.path);
      });

      it('deve propagar erro de validação de arquivo', () => {
        const file = {
          filename: 'test-image.jpg',
          originalname: 'original-test.jpg',
          mimetype: 'text/plain',
          size: 1024000,
          path: '/path/to/test-image.jpg'
        };

        const req = {
          protocol: 'http',
          get: jest.fn().mockReturnValue('localhost:3000')
        };

        usuarioController._validarArquivoImagem = jest.fn().mockImplementation(() => {
          throw new Error('Arquivo inválido');
        });

        expect(() => usuarioController._processarImagemParaFoto(file, req)).toThrow('Arquivo inválido');
      });

      it('deve propagar erro de obtenção de dimensões', () => {
        const file = {
          filename: 'test-image.jpg',
          originalname: 'original-test.jpg',
          mimetype: 'image/jpeg',
          size: 1024000,
          path: '/path/to/test-image.jpg'
        };

        const req = {
          protocol: 'http',
          get: jest.fn().mockReturnValue('localhost:3000')
        };

        usuarioController._validarArquivoImagem = jest.fn();
        usuarioController._obterDimensoesImagem = jest.fn().mockImplementation(() => {
          throw new Error('Erro ao obter dimensões');
        });

        expect(() => usuarioController._processarImagemParaFoto(file, req)).toThrow('Erro ao obter dimensões');
      });
    });
  });

  describe('Testes de casos extremos', () => {
    it('deve listar usuários com query vazia', async () => {
      req.query = {};
      const mockData = [{ id: '1', nome: 'Usuario 1' }, { id: '2', nome: 'Usuario 2' }];
      usuarioController.service.listar.mockResolvedValue(mockData);
      
      await usuarioController.listar(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: mockData,
        errors: [],
        message: "Requisição bem-sucedida"
      });
    });

    it('deve listar usuário por params quando params e query estão presentes', async () => {
      const mockData = { id: '67959501ea0999e0a0fa9f58', nome: 'Usuario' };
      req.params = { id: mockData.id };
      req.query = { email: 'test@email.com' };
      
      usuarioController.service.listar.mockResolvedValue(mockData);
      
      await usuarioController.listar(req, res);
      
      expect(usuarioController.service.listar).toHaveBeenCalledWith(req);
    });

    it('deve retornar erro específico de serviço no deletar', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      
      usuarioController.service.deletarUsuario.mockRejectedValue(new Error('Usuário não encontrado'));

      await expect(usuarioController.deletarUsuario(req, res)).rejects.toThrow('Usuário não encontrado');
    });

    it('deve retornar erro específico de serviço no alterarStatus', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      req.body = { email: 'usuario@gmail.com', ativo: true };
      
      usuarioController.service.alterarStatus.mockRejectedValue(new Error('Status não pode ser alterado'));

      await expect(usuarioController.alterarStatus(req, res)).rejects.toThrow('Status não pode ser alterado');
    });

    it('deve retornar erro específico de serviço no cadastrarUsuario', async () => {
      req.body = {
        nome: "TESTE",
        email: "teste@gmail.com",
        telefone: "(69) 99999-8888",
        senha: "Laravel@123",
        dataNascimento: "2000-08-08",
        CPF: "96945788253",
        ativo: true,
        tipoUsuario: "usuario",
        fotoUsuario: "http://example.com/photo.jpg"
      };
      
      usuarioController.service.cadastrarUsuario.mockRejectedValue(new Error('Email já existe'));

      await expect(usuarioController.cadastrarUsuario(req, res)).rejects.toThrow('Email já existe');
    });

    it('deve retornar erro específico de serviço no getFoto', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      
      usuarioController.service.getFoto.mockRejectedValue(new Error('Foto não encontrada'));

      await expect(usuarioController.getFoto(req, res)).rejects.toThrow('Foto não encontrada');
    });
  });

  describe('removerFoto', () => {
    it('deve remover foto do usuário com sucesso', async () => {
      const mockData = {
        _id: '67959501ea0999e0a0fa9f58',
        nome: 'Usuario Teste',
        email: 'teste@email.com',
        fotoUsuario: null
      };
      
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      
      usuarioController.service.removerFoto.mockResolvedValue(mockData);
      
      await usuarioController.removerFoto(req, res);
      
      expect(usuarioController.service.removerFoto).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: mockData,
        errors: [],
        message: 'Foto deletada com sucesso.'
      });
    });

    it('deve falhar ao validar id inválido', async () => {
      req.params = { id: null };
      
      await expect(usuarioController.removerFoto(req, res)).rejects.toThrow();
    });

    it('deve falhar quando params não existe', async () => {
      req.params = null;
      
      await expect(usuarioController.removerFoto(req, res)).rejects.toThrow();
    });

    it('deve propagar erro do serviço', async () => {
      req.params = { id: '67959501ea0999e0a0fa9f58' };
      
      usuarioController.service.removerFoto.mockRejectedValue(new Error('Foto não encontrada'));
      
      await expect(usuarioController.removerFoto(req, res)).rejects.toThrow('Foto não encontrada');
      
      expect(usuarioController.service.removerFoto).toHaveBeenCalledWith(req.params.id);
    });
  });

  describe('getPerfil', () => {
    it('deve buscar perfil do usuário com sucesso', async () => {
      const mockData = {
        _id: '67959501ea0999e0a0fa9f58',
        nome: 'Usuario Teste',
        email: 'teste@email.com',
        telefone: '(69) 99999-8888',
        dataNascimento: '2000-08-08',
        CPF: '96945788253',
        ativo: true,
        fotoUsuario: 'http://example.com/photo.jpg'
      };
      
      req.user_id = '67959501ea0999e0a0fa9f58';
      
      usuarioController.service.getPerfil.mockResolvedValue(mockData);
      
      await usuarioController.getPerfil(req, res);
      
      expect(usuarioController.service.getPerfil).toHaveBeenCalledWith(req.user_id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: mockData,
        errors: [],
        message: 'Requisição bem-sucedida'
      });
    });

    it('deve falhar ao validar id inválido', async () => {
      req.user_id = null;
      
      await expect(usuarioController.getPerfil(req, res)).rejects.toThrow();
    });

    it('deve falhar quando user_id não existe', async () => {
      req.user_id = undefined;
      
      await expect(usuarioController.getPerfil(req, res)).rejects.toThrow();
    });

    it('deve propagar erro do serviço', async () => {
      req.user_id = '67959501ea0999e0a0fa9f58';
      
      usuarioController.service.getPerfil.mockRejectedValue(new Error('Usuário não encontrado'));
      
      await expect(usuarioController.getPerfil(req, res)).rejects.toThrow('Usuário não encontrado');
      
      expect(usuarioController.service.getPerfil).toHaveBeenCalledWith(req.user_id);
    });
  });

  describe('updatePerfil', () => {
    it('deve atualizar perfil do usuário com sucesso', async () => {
      const updatedData = {
        _id: '67959501ea0999e0a0fa9f58',
        nome: 'Nome Atualizado',
        email: 'novo@email.com',
        telefone: '(69) 98888-7777',
        dataNascimento: '2000-08-08',
        CPF: '96945788253',
        ativo: true,
        fotoUsuario: 'http://example.com/photo.jpg'
      };
      
      req.user_id = '67959501ea0999e0a0fa9f58';
      req.body = {
        nome: 'Nome Atualizado',
        email: 'novo@email.com',
        telefone: '(69) 98888-7777'
      };
      
      usuarioController.service.updateUsuario.mockResolvedValue(updatedData);
      
      await usuarioController.updatePerfil(req, res);
      
      expect(usuarioController.service.updateUsuario).toHaveBeenCalledWith(req.user_id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: updatedData,
        errors: [],
        message: 'Requisição bem-sucedida'
      });
    });

    it('deve falhar ao validar id inválido', async () => {
      req.user_id = null;
      req.body = {
        nome: 'Nome Atualizado',
        email: 'novo@email.com'
      };
      
      await expect(usuarioController.updatePerfil(req, res)).rejects.toThrow();
    });

    it('deve falhar ao validar body inválido', async () => {
      req.user_id = '67959501ea0999e0a0fa9f58';
      req.body = {
        nome: '',
        email: 'email-invalido',
        telefone: '123'
      };
      
      await expect(usuarioController.updatePerfil(req, res)).rejects.toThrow();
    });

    it('deve falhar quando user_id não existe', async () => {
      req.user_id = undefined;
      req.body = {
        nome: 'Nome Atualizado',
        email: 'novo@email.com'
      };
      
      await expect(usuarioController.updatePerfil(req, res)).rejects.toThrow();
    });

    it('deve propagar erro do serviço', async () => {
      req.user_id = '67959501ea0999e0a0fa9f58';
      req.body = {
        nome: 'Nome Atualizado',
        email: 'novo@email.com',
        telefone: '(69) 98888-7777'
      };
      
      usuarioController.service.updateUsuario.mockRejectedValue(new Error('Erro ao atualizar perfil'));
      
      await expect(usuarioController.updatePerfil(req, res)).rejects.toThrow('Erro ao atualizar perfil');
      
      expect(usuarioController.service.updateUsuario).toHaveBeenCalledWith(req.user_id, req.body);
    });

    it('deve atualizar perfil com dados parciais', async () => {
      const updatedData = {
        _id: '67959501ea0999e0a0fa9f58',
        nome: 'Nome Atualizado',
        email: 'teste@email.com',
        telefone: '(69) 99999-8888',
        dataNascimento: '2000-08-08',
        CPF: '96945788253',
        ativo: true,
        fotoUsuario: 'http://example.com/photo.jpg'
      };
      
      req.user_id = '67959501ea0999e0a0fa9f58';
      req.body = {
        nome: 'Nome Atualizado'
      };
      
      usuarioController.service.updateUsuario.mockResolvedValue(updatedData);
      
      await usuarioController.updatePerfil(req, res);
      
      expect(usuarioController.service.updateUsuario).toHaveBeenCalledWith(req.user_id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: updatedData,
        errors: [],
        message: 'Requisição bem-sucedida'
      });
    });
  });
});
