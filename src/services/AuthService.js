// /src/services/AuthService.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomError, HttpStatusCodes, messages } from '../utils/helpers/index.js';
import tokenUtil from '../utils/TokenUtil.js';
import AuthHelper from '../utils/AuthHelper.js';

import UsuarioRepository from '../repositories/UsuarioRepository.js';

class AuthService {
    constructor({ tokenUtil: injectedTokenUtil, usuarioRepository} = {}) {
        // Se nada for injetado, usa a instância importada
        this.TokenUtil = injectedTokenUtil || tokenUtil;
        this.repository = usuarioRepository || new UsuarioRepository();
    }

    async carregatokens(id, token) {
        const data = await this.repository.buscarPorId(id, { includeTokens: true });
        return { data };
    }

    async revoke(id) {
        // Validação do ID
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário é obrigatório para revogar tokens.'
            });
        }

        // Verificar se o usuário existe
        const usuario = await this.repository.buscarPorId(id);
        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'notFound',
                field: 'Usuário',
                details: [],
                customMessage: 'Usuário não encontrado para revogação de tokens.'
            });
        }

        const data = await this.repository.removeToken(id);
        if (!data) {
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                errorType: 'serverError',
                field: 'Token',
                details: [],
                customMessage: 'Erro ao revogar tokens do usuário.'
            });
        }

        return { message: 'Tokens revogados com sucesso.' };
    }

    async logout(id, token) {
        // Validação do ID
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário é obrigatório para logout.'
            });
        }

        // Validação do token
        if (!token) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'token',
                details: [],
                customMessage: 'Token é obrigatório para logout.'
            });
        }

        // Verificar se o usuário existe
        const usuario = await this.repository.buscarPorId(id);
        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'notFound',
                field: 'Usuário',
                details: [],
                customMessage: 'Usuário não encontrado para logout.'
            });
        }

        const data = await this.repository.removeToken(id);
        if (!data) {
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                errorType: 'serverError',
                field: 'Token',
                details: [],
                customMessage: 'Erro ao fazer logout do usuário.'
            });
        }

        return { message: 'Logout realizado com sucesso.' };
    }

    async login(body) {
        console.log('Estou no logar em AuthService');

        // Buscar o usuário pelo email
        const userEncontrado = await this.repository.buscarPorEmailCadastrado(body.email);
        if (!userEncontrado) {
            console.log("EMAIL:", userEncontrado)
            throw new CustomError({
                statusCode: 401,
                errorType: 'notFound',
                field: 'Email',
                details: [],
                customMessage: messages.error.unauthorized('Senha ou Email')
            });
        }

        // Validar a senha
        const senhaValida = await bcrypt.compare(body.senha, userEncontrado.senha);
        if (!senhaValida) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'unauthorized',
                field: 'Senha',
                details: [],
                customMessage: messages.error.unauthorized('Senha ou Email')
            });
        }
        if (!userEncontrado.ativo) {
            throw new CustomError({
                statusCode: 403,
                errorType: 'unauthorized',
                field: 'Status',
                details: [],
                customMessage: "Está conta foi desativada por um administrador por violação de contrato."
            })

        }
        // Gerar novo access token utilizando a instância injetada
        const accessToken = await this.TokenUtil.generateAccessToken(userEncontrado._id);

        // Buscar o usuário com os tokens já armazenados
        const userComTokens = await this.repository.buscarPorId(userEncontrado._id, true);
        let refreshToken = userComTokens.refreshToken;
        console.log("refresh token no banco", refreshToken);

        if (refreshToken) {
            try {
                jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN);
            } catch (error) {
                if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                    refreshToken = await this.TokenUtil.generateRefreshToken(userEncontrado._id);
                } else {
                    throw new CustomError({
                        statusCode: 500,
                        errorType: 'serverError',
                        field: 'Token',
                        details: [],
                        customMessage: messages.error.unauthorized('falha na geração do token')
                    });
                }
            }
        } else {
            // Se o refresh token não existe, gera um novo
            refreshToken = await this.TokenUtil.generateRefreshToken(userEncontrado._id);
        }

        console.log("refresh token gerado", refreshToken);

        // Armazenar os tokens atualizados
        await this.repository.armazenarTokens(userEncontrado._id, accessToken, refreshToken);

        // Buscar novamente o usuário e remover a senha
        const userLogado = await this.repository.buscarPorEmailCadastrado(body.email);
        delete userLogado.senha;
        const userObjeto = userLogado.toObject();

        // Retornar o usuário com os tokens
        return { user: { accessToken, refreshToken, ...userObjeto } };
    }


    // RecuperaSenhaService.js
    async recuperaSenha(body) {
        console.log('Estou em RecuperaSenhaService');

        // Validação dos dados de entrada
        if (!body || !body.email) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'email',
                details: [],
                customMessage: 'Email é obrigatório para recuperação de senha.'
            });
        }

        // ───────────────────────────────────────────────
        // Passo 1 – Buscar usuário pelo e-mail informado
        // ───────────────────────────────────────────────
        const userEncontrado = await this.repository.buscarPorEmailCadastrado(body.email);

        // Se não encontrar, lança erro 404
        if (!userEncontrado) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'notFound',
                field: 'Email',
                details: [],
                customMessage: 'Email não encontrado no sistema.'
            });
        }

        if (!userEncontrado.ativo) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'forbidden',
                field: 'Status',
                details: [],
                customMessage: "Se sua conta foi desativada, ela não pode mais ser acessada. Para dúvidas, entre em contato com o suporte."
            });
        }
        // ───────────────────────────────────────────────
        // Passo 2 – Gerar código de verificação (4 carac.)
        // ───────────────────────────────────────────────
        const generateCode = () => Math.random()
            .toString(36)              // ex: “0.f5g9hk3j”
            .replace(/[^a-z0-9]/gi, '') // mantém só letras/números
            .slice(0, 4)               // pega os 4 primeiros
            .toUpperCase();            // converte p/ maiúsculas

        let codigoRecuperaSenha = generateCode();

        // ───────────────────────────────────────────────
        // Passo 3 – Garantir unicidade do código gerado 
        // ───────────────────────────────────────────────
        let codigoExistente =
            await this.repository.buscarPorCodigoRecuperacao(codigoRecuperaSenha);
        console.log('Código existente:', codigoExistente);

        while (codigoExistente) {
            console.log('Código já existe, gerando um novo código');
            codigoRecuperaSenha = generateCode();
            codigoExistente =
                await this.repository.buscarPorCodigoRecuperacao(codigoRecuperaSenha);
        }
        console.log('Código gerado:', codigoRecuperaSenha);

        // ───────────────────────────────────────────────
        // Passo 4 – Gerar token único (JWT) p/ recuperação
        // ───────────────────────────────────────────────
        const tokenUnico =
            await this.TokenUtil.generatePasswordRecoveryToken(userEncontrado._id);

        // ───────────────────────────────────────────────
        // Passo 5 – Persistir token + código no usuário
        // ───────────────────────────────────────────────
        const expMs = Date.now() + 60 * 60 * 1000; // 1 hora de expiração
        const data = await this.repository.atualizar(userEncontrado._id, {
            tokenUnico,
            codigo_recupera_senha: codigoRecuperaSenha,
            exp_codigo_recupera_senha: new Date(expMs).toISOString() // Armazenar expiração como string ISO TMZ0 Ex.: 2023-10-01T12:00:00.000Z
        });

        if (!data) {
            // Falha ao atualizar → erro 500
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                field: 'Recuperação de Senha',
                details: [],
                customMessage: HttpStatusCodes.INTERNAL_SERVER_ERROR.message
            });
        }

        const resetUrl = `${process.env.MAIL_HOST}/auth/?token=${tokenUnico}`;
        console.log('URL de redefinição de senha:', resetUrl);
        const emailData = {
            to: userEncontrado.email,
            subject: 'Redefinir senha',
            template: 'password-reset',
            data: {
                name: userEncontrado.nome,
                resetUrl: resetUrl,
                expirationMinutes: 60, // Expiração em minutos
                year: new Date().getFullYear(),
                company: process.env.COMPANY_NAME || 'Auth'
            }
        };
        console.log('Dados do e-mail:', emailData);


        // Criar função para fazer a chamada para enviar o e-mai
        // Necessário passar apiKey presente em MAIL_API_KEY
        const sendMail = async (emailData) => {
            console.log('Enviando e-mail de recuperação de senha para:', emailData.to);
            try {
                const response = await fetch(`${process.env.MAIL_API_URL}/emails/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.MAIL_API_KEY
                    },
                    body: JSON.stringify(emailData)
                });
                if (!response.ok) {
                    throw new Error(`Erro ao enviar e-mail: ${response.status} ${response.statusText}`);
                }
                const responseData = await response.json();
                console.log('E-mail enviado com sucesso:', responseData);
            } catch (error) {
                console.error('Erro ao enviar e-mail:', error);
                throw new CustomError({
                    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                    field: 'E-mail',
                    details: [],
                    customMessage: 'Erro ao enviar e-mail de recuperação de senha.'
                });
            }
        };

        console.log('Antes de sendMail');
        await sendMail(emailData);
        console.log('Depois de sendMail');

        console.log('Enviando e-mail de recuperação de senha');

        return {
            message:
                'Solicitação de recuperação de senha recebida. Um e-mail foi enviado com instruções.'
        };
    }

    async refresh(id, token) {
        // Validação do ID
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário é obrigatório para refresh.'
            });
        }

        // Validação do token
        if (!token || token === 'null' || token === 'undefined') {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'invalidToken',
                field: 'Token',
                details: [],
                customMessage: 'Refresh token é obrigatório.'
            });
        }

        const userEncontrado = await this.repository.buscarPorId(id, { includeTokens: true });
        console.log("USER", userEncontrado)
        if (!userEncontrado) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'notFound',
                field: 'Usuário',
                details: [],
                customMessage: 'Usuário não encontrado para renovação de token.'
            });
        }

        // Verificar se o usuário está ativo
        if (!userEncontrado.ativo) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'forbidden',
                field: 'Status',
                details: [],
                customMessage: 'Usuário desativado. Não é possível renovar o token.'
            });
        }

        console.log(id)
        console.log(userEncontrado.refreshToken)
        console.log("TOKEN", token)
        if (userEncontrado.refreshToken !== token) {
            console.log('Token inválido');
            throw new CustomError({
                statusCode: HttpStatusCodes.UNAUTHORIZED.code,
                errorType: 'invalidToken',
                field: 'Token',
                details: [],
                customMessage: 'Refresh token inválido ou não corresponde ao usuário.'
            });
        }

        // Gerar novo access token utilizando a instância injetada
        const accesstoken = await this.TokenUtil.generateAccessToken(id);

        /**
         * Se SINGLE_SESSION_REFRESH_TOKEN for true, gera um novo refresh token
         * Senão, mantém o token armazenado
         */
        let refreshtoken = '';
        if (process.env.SINGLE_SESSION_REFRESH_TOKEN === 'true') {
            refreshtoken = await this.TokenUtil.generateRefreshToken(id);
        } else {
            refreshtoken = userEncontrado.refreshtoken;
        }

        // Atualiza o usuário com os novos tokens
        await this.repository.armazenarTokens(id, accesstoken, refreshtoken);

        // monta o objeto de usuário com os tokens para resposta
        const userLogado = await this.repository.buscarPorId(id, { includeTokens: true });
        delete userLogado.senha;
        const userObjeto = userLogado.toObject();

        const userComTokens = {
            accesstoken,
            refreshtoken,
            ...userObjeto
        };

        return { user: userComTokens };
    }
    // async atualizarSenha({ tokenRecuperacao = null, codigo_recupera_senha = null, senha }) {
    //     /* 1) Nenhum identificador */
    //     if (!tokenRecuperacao && !codigo_recupera_senha) {
    //         throw new CustomError({
    //             statusCode: HttpStatusCodes.BAD_REQUEST.code,
    //             errorType: 'validationError',
    //             field: 'tokenRecuperacao / codigo_recupera_senha',
    //             details: [],
    //             customMessage:
    //                 'Informe o token de recuperação ou o código de recuperação.',
    //         });
    //     }


    //     let usuarioId;

    //     /* ─── A) Código de 4 caracteres ───────────────────────────── */
    //     if (codigo_recupera_senha) {
    //         const usuario = await this.usuarioRepository.buscarPorCodigoRecuperacao(codigo_recupera_senha);

    //         if (!usuario) {
    //             throw new CustomError({
    //                 statusCode: HttpStatusCodes.NOT_FOUND.code,
    //                 errorType: 'validationError',
    //                 field: 'codigo_recupera_senha',
    //                 details: [
    //                     {
    //                         path: 'codigo_recupera_senha',
    //                         message: 'Código de recuperação inválido ou não encontrado.',
    //                     },
    //                 ],
    //                 customMessage: 'Código de recuperação inválido ou não encontrado.',
    //             });
    //         }

    //         /* Validação de expiração */
    //         const expTime = new Date(usuario.exp_codigo_recupera_senha).getTime();
    //         if (!expTime || expTime < Date.now()) {
    //             throw new CustomError({
    //                 statusCode: HttpStatusCodes.UNAUTHORIZED.code,
    //                 errorType: 'authenticationError',
    //                 field: 'codigo_recupera_senha',
    //                 details: [
    //                     {
    //                         path: 'codigo_recupera_senha',
    //                         message: 'Código de recuperação expirado.',
    //                     },
    //                 ],
    //                 customMessage: 'Código de recuperação expirado.',
    //             });
    //         }

    //         usuarioId = usuario._id.toString();
    //     }

    //     /* ─── B) Token JWT ────────────────────────────────────────── */
    //     if (tokenRecuperacao) {
    //         if (typeof tokenRecuperacao !== 'string' || !tokenRecuperacao.trim()) {
    //             throw new CustomError({
    //                 statusCode: HttpStatusCodes.BAD_REQUEST.code,
    //                 errorType: 'validationError',
    //                 field: 'tokenRecuperacao',
    //                 details: [
    //                     {
    //                         path: 'tokenRecuperacao',
    //                         message: 'Token de recuperação inválido.',
    //                     },
    //                 ],
    //                 customMessage: 'Token de recuperação deve ser uma string não vazia.',
    //             });
    //         }

    //         let decoded;
    //         try {
    //             decoded = await this.TokenUtil.decodePasswordRecoveryToken(tokenRecuperacao);
    //         } catch (err) {
    //             throw new CustomError({
    //                 statusCode: HttpStatusCodes.UNAUTHORIZED.code,
    //                 errorType: 'authenticationError',
    //                 field: 'tokenRecuperacao',
    //                 details: [],
    //                 customMessage: 'Token de recuperação expirado ou inválido.',
    //             });
    //         }

    //         if (!decoded.usuarioId) {
    //             throw new CustomError({
    //                 statusCode: HttpStatusCodes.BAD_REQUEST.code,
    //                 errorType: 'validationError',
    //                 field: 'tokenRecuperacao',
    //                 details: [],
    //                 customMessage: 'Payload do token não contém ID do usuário.',
    //             });
    //         }

    //         usuarioId = decoded.usuarioId;
    //     }

    //     /* 3) Valida ID e busca usuário */
    //     objectIdSchema.parse(usuarioId);

    //     const usuarioEncontrado = await this.usuarioRepository.listarPorId(usuarioId);
    //     if (!usuarioEncontrado) {
    //         throw new CustomError({
    //             statusCode: HttpStatusCodes.NOT_FOUND.code,
    //             errorType: 'notFound',
    //             field: 'id',
    //             details: [],
    //             customMessage: 'Usuário não encontrado para alteração de senha.',
    //         });
    //     }

    //     /* 4) Valida / gera hash da nova senha */
    //     const { senha: senhaValidada } = UsuarioUpdateSchema.parse({ senha });
    //     const senhaHash = bcrypt.hash(senhaValidada, 8);

    //     /* 5) Persiste */
    //     await this.usuarioRepository.atualizarSenhar(usuarioId, senhaHash);

    //     /* 6) Remove código após uso */
    //     if (codigo_recupera_senha) {
    //         await this.usuarioRepository.alterar(usuarioId, {
    //             codigo_recupera_senha: null,
    //             exp_codigo_recupera_senha: null,
    //         });
    //     }

    //     return { message: 'Senha atualizada com sucesso.' };
    // }
    async atualizarSenhaToken(tokenRecuperacao, senhaBody) {
        // Validação do token
        if (!tokenRecuperacao || tokenRecuperacao === 'null' || tokenRecuperacao === 'undefined') {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'token',
                details: [],
                customMessage: 'Token de recuperação é obrigatório.'
            });
        }

        // Validação da senha
        if (!senhaBody || !senhaBody.senha) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'senha',
                details: [],
                customMessage: 'Nova senha é obrigatória.'
            });
        }

        let usuarioId;
        try {
            // 1) Decodifica o token para obter o ID do usuário
            usuarioId = await this.TokenUtil.decodePasswordRecoveryToken(
                tokenRecuperacao,
                process.env.JWT_SECRET_PASSWORD_RECOVERY
            );
        } catch (err) {
            // Tratamento específico para erros de JWT
            if (err.name === 'JsonWebTokenError') {
                throw new CustomError({
                    statusCode: HttpStatusCodes.UNAUTHORIZED.code,
                    errorType: 'invalidToken',
                    field: 'token',
                    details: [],
                    customMessage: 'Token de recuperação inválido ou malformado.'
                });
            }
            
            if (err.name === 'TokenExpiredError') {
                throw new CustomError({
                    statusCode: HttpStatusCodes.UNAUTHORIZED.code,
                    errorType: 'tokenExpired',
                    field: 'token',
                    details: [],
                    customMessage: 'Token de recuperação expirado.'
                });
            }

            // Para outros erros de decodificação
            throw new CustomError({
                statusCode: HttpStatusCodes.UNAUTHORIZED.code,
                errorType: 'invalidToken',
                field: 'token',
                details: [],
                customMessage: 'Erro ao validar token de recuperação.'
            });
        }

        // 2) Gera o hash da senha pura
        const senhaHasheada = await AuthHelper.hashPassword(senhaBody.senha);

        // Buscar usuário pelo token unico
        const usuario = await this.repository.buscarPorTokenUnico(tokenRecuperacao);
        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'notFound',
                field: 'Token',
                details: [],
                customMessage: "Token de recuperação já foi utilizado ou é inválido."
            });
        }

        // Verificar se o usuário está ativo
        if (!usuario.ativo) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'forbidden',
                field: 'Status',
                details: [],
                customMessage: 'Usuário desativado. Não é possível alterar a senha.'
            });
        }

        // 2) Verifica expiração
        if (usuario.exp_tokenUnico_recuperacao < new Date()) {
            throw new CustomError({
                statusCode: HttpStatusCodes.UNAUTHORIZED.code,
                errorType: 'tokenExpired',
                field: 'Token de Recuperação',
                details: [],
                customMessage: 'Token de recuperação expirado.'
            });
        }

        // 3) Atualiza no repositório (já com hash)
        const usuarioAtualizado = await this.repository.atualizarSenha(usuarioId, senhaHasheada);
        if (!usuarioAtualizado) {
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                errorType: 'serverError',
                field: 'Senha',
                details: [],
                customMessage: 'Erro ao atualizar a senha.'
            });
        }

        // 4) Limpar o token após uso bem-sucedido
        try {
            await this.repository.alterar(usuarioId, {
                tokenUnico: null,
                exp_tokenUnico_recuperacao: null,
                codigo_recupera_senha: null,
                exp_codigo_recupera_senha: null
            });
        } catch (error) {
            // Não falhamos a operação se não conseguirmos limpar o token
            console.warn('Aviso: Não foi possível limpar o token de recuperação usado:', error);
        }

        return { message: 'Senha atualizada com sucesso.' };
    }


}

export default AuthService;
