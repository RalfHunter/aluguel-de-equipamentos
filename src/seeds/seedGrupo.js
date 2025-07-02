import Grupo from "../models/Grupo.js";
import getGlobalFakeMapping from "./globalFakeMapping.js";

const grupoAdmin = {
    nome: 'admin',
    descricao: 'Grupo com acesso total ao sistema',
    ativo: true,
    permissoes: [{
        rota: "grupos",
        dominio: "locahost",
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: "grupos:id",
        dominio: "locahost",
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    }
    ]
}
const grupoModerador = {
    nome: 'moderador',
    descricao: 'Grupo com controle sobre os usuarios',
    ativo: true,
    permissoes: [{
        rota: "usuario",
        dominio: "locahost",
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: "usuarios:id",
        dominio: "locahost",
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    }
    ]
}

const grupoUsuario = {
    nome: 'usuario',
    descricao: 'Grupo que pude alocar e alugar equipamentos',
    ativo: true,
    permissoes:[{
        rota: 'usuario',
        dominio: 'localhost',
        ativo: true,
        buscar: false,
        enviar: true,
        substituir:true,
        modificar: true,
        excluir: false
    }]
}

const grupos = [grupoAdmin, grupoModerador, grupoUsuario]

async function SeedGrupo() {
    await Grupo.deleteMany()



    return await Grupo.insertMany(grupos)

    
}
export default SeedGrupo