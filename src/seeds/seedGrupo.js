import Grupo from "../models/Grupo.js";
import getGlobalFakeMapping from "./globalFakeMapping.js";

const grupoAdmin = {
    nome: 'admin',
    descricao: 'Grupo com acesso total ao sistema',
    ativo: true,
    nivelPermissao: 0,
    permissoes: [{
        rota: "grupos",
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: "usuarios",
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: "usuarios-id-foto",
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'perfil',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: false
    },
    {
        rota: "avaliacoes",
        ativo: true,
        buscar: false,
        enviar: false,
        substituir: false,
        modificar: false,
        excluir: true
    },
    {
        rota: "equipamentos",
        dominio: "localhost",
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: "equipamentos-id-status",
        dominio: "localhost",
        ativo: true,
        buscar: false,
        enviar: false,
        substituir: false,
        modificar: true,
        excluir: false
    },
    {
        rota: "equipamentos-id-aprovar",
        dominio: "localhost",
        ativo: true,
        buscar: false,
        enviar: false,
        substituir: false,
        modificar: true,
        excluir: false
    },
    {
        rota: "equipamentos-id-reprovar",
        dominio: "localhost",
        ativo: true,
        buscar: false,
        enviar: false,
        substituir: false,
        modificar: true,
        excluir: false
    },
    {
        rota: "equipamentos-id-foto",
        dominio: "localhost",
        ativo: true,
        buscar: false,
        enviar: true,
        substituir: false,
        modificar: false,
        excluir: false
    }
    ]
}
const grupoModerador = {
    nome: 'moderador',
    descricao: 'Grupo com controle sobre os usuarios',
    ativo: true,
    nivelPermissao: 50,
    permissoes: [{
        rota: "usuarios",
        dominio: "localhost",
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'perfil',
        ativo: true,
        buscar: false,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: false
    },
    {
        rota: "avaliacoes",
        ativo: true,
        buscar: false,
        enviar: false,
        substituir: false,
        modificar: false,
        excluir: true
    },
    {
        rota: "equipamentos",
        dominio: "localhost",
        ativo: true,
        buscar: true,
        enviar: false,
        substituir: false,
        modificar: false,
        excluir: false
    },
    {
        rota: "equipamentos-id-aprovar",
        dominio: "localhost",
        ativo: true,
        buscar: false,
        enviar: false,
        substituir: false,
        modificar: true,
        excluir: false
    },
    {
        rota: "equipamentos-id-reprovar",
        dominio: "localhost",
        ativo: true,
        buscar: false,
        enviar: false,
        substituir: false,
        modificar: true,
        excluir: false
    }
    ]
}


const grupoUsuario = {
    nome: 'usuario',
    descricao: 'Grupo que pude alocar e alugar equipamentos',
    ativo: true,
    nivelPermissao: 100,
    permissoes: [{
        rota: 'usuarios',
        ativo: true,
        buscar: false,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: false
    },
    {
        rota: 'perfil',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: false
    },
    {
        rota: 'usuarios-id-foto',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: "equipamentos",
        dominio: "localhost",
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: false,
        modificar: true,
        excluir: false
    },
    {
        rota: "equipamentos-id-status",
        dominio: "localhost",
        ativo: true,
        buscar: false,
        enviar: false,
        substituir: false,
        modificar: true,
        excluir: false
    },
        // {
        //     rota: "equipamentos-id-foto",
        //     dominio: "localhost",
        //     ativo: true,
        //     buscar: false,
        //     enviar: true,
        //     substituir: false,
        //     modificar: false,
        //     excluir: false
        // }
    ]
}

const grupos = [grupoAdmin, grupoModerador, grupoUsuario]

async function SeedGrupo() {
    await Grupo.deleteMany()



    return await Grupo.insertMany(grupos)


}
export default SeedGrupo