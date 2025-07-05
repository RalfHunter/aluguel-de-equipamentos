import { beforeEach, describe, expect, jest } from "@jest/globals";
import UsuarioController from "../../../controllers/UsuarioController.js";
import UsuarioService from "../../../services/UsuarioService.js";
jest.mock("../../../services/UsuarioService.js");

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

  describe('atualizar', () => {
    it('deve atualizar um usuário pelo id recebido no req.user_id', async () => {
      req = {
        user_id: '67959501ea0999e0a0fa9f59', body: {
          nome: "Nome Alterado Com Sucesso",
          email: "emailalteradocomsucesso@gmail.com",
          telefone: "(69) 99999-9999"
        }
      };
      const updatedData = {
        id: req.user_id,
        nome: req.body.nome,
        email: req.body.email,
        telefone: req.body.telefone,
        senha: "Laravel@123",
        dataNascimento: "2000-08-08",
        CPF: "96945788253",
        ativo: true,
        tipoUsuario: "usuario",
        fotoUsuario: "http://lorempixel.com/640/480"
      };
      usuarioController.service.updateUsuario.mockResolvedValue(updatedData);
      await usuarioController.updateUsuario(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: updatedData,
        errors: [],
        message: "Usuário atualizado com sucesso!"
      });
    });

    it('deve retornar um erro ao tentar atualizar o usuário sem id', async () => {
      req.params = undefined;
      await expect(usuarioController.updateUsuario(req, res)).rejects.toThrow();
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
            
            // Mock que simula um documento Mongoose com método toObject
            const mockUsuarioDocument = {
                ...expectedData,
                toObject: jest.fn().mockReturnValue(expectedData)
            };
            
            usuarioController.service.cadastrarUsuario.mockResolvedValue(mockUsuarioDocument)
            await usuarioController.criarComSenha(req, res)
            expect(usuarioController.service.cadastrarUsuario).toHaveBeenCalledWith(expectedData)
            expect(mockUsuarioDocument.toObject).toHaveBeenCalled()
        })
    })
});
