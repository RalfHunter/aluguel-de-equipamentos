import fs from "fs"
import Usuario from "../models/Usuario.js"
// import getGlobalFakeMapping from "../globalFakeMapping"
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import getGlobalFakeMapping from "./globalFakeMapping.js";
import Grupo from "../models/Grupo.js";


// await DbConect.conectar();



export async function gerarSenhaHash(senhaPura){
    return bcrypt.hashSync(senhaPura, 8);
}

const senhaPura = "AISDAIEF#t4";
const senhaHash = await gerarSenhaHash(senhaPura) //usar essa



async function SeedUsuario(){

    await Usuario.deleteMany();
    const usuarios = [];
    const gruposNome = []
    const fake = await getGlobalFakeMapping()
    const comum = await Grupo.findOne({nome:"usuario"})
    const moderador = await Grupo.findOne({nome:"moderador"})
    const admin = await Grupo.findOne({nome:"admin"})
    gruposNome.push(comum)
    gruposNome.push(moderador)

    for (let i = 0; i < 25; i++) {
        const nome = fake.nome();
        const email = fake.email();
        const telefone = fake.telefone();
        const senha = senhaHash;
        const dataNascimento = fake.dataNascimento();
        const CPF = fake.CPF(); // Geração de CPF fictício
        const notaMedia = fake.notaMediaAvaliacao();
        const ativo = fake.ativo();
        const fotoUsuario = fake.fotoUsuario();
        const grupos = [gruposNome[Math.floor(Math.random() * gruposNome.length)]._id];

        usuarios.push({
            nome,
            email,
            telefone,
            senha: senha,
            dataNascimento,
            CPF,
            notaMedia,
            ativo,
            fotoUsuario,
            grupos
        });
    }
    const dev = {
        nome: "Dev",
        email: "dev@gmail.com",
        telefone: "69 98191-4471",
        senha:  await bcrypt.hash('Dev@1234', 8),
        dataNascimento: fake.dataNascimento(),
        CPF: "12345612345", // Geração de CPF fictício
        notaMedia: 0,
        ativo: true,
        fotoUsuario:'https://pt.quizur.com/_image?href=https://img.quizur.com/f/img63365b54eee492.52029189.png?lastEdited=1664506795&w=600&h=600&f=webp',
        grupos: [moderador._id]
        
    }
    const dev2 = {
        nome: "Dev2",
        email: "dev2@gmail.com",
        telefone: "69 98191-0000",
        senha:  await bcrypt.hash('Dev@1234', 8),
        dataNascimento: fake.dataNascimento(),
        CPF: "12345612347", // Geração de CPF fictício
        notaMedia: 0,
        ativo: true,
        fotoUsuario:'https://pt.quizur.com/_image?href=https://img.quizur.com/f/img63365b54eee492.52029189.png?lastEdited=1664506795&w=600&h=600&f=webp',
        grupos: [moderador._id]
    }
    const user = {
        nome: "Usuario Padrão",
        email: "usuario@gmail.com",
        telefone: "69 93121-2271",
        senha:  await bcrypt.hash('Usuario@1234', 8),
        dataNascimento: fake.dataNascimento(),
        CPF: "12345612346", // Geração de CPF fictício
        notaMedia: 0,
        ativo: true,
        fotoUsuario:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmtv-wGPAGVnAMkWDSteg4qGIRHhtLCYgoDQ&s',
        grupos: [comum._id]
        
    }
    const Dono = {
        nome: "Dono",
        email: "dono@gmail.com",
        telefone: "69 98191-0100",
        senha:  await bcrypt.hash('Dono@1234', 8),
        dataNascimento: fake.dataNascimento(),
        CPF: "12345612317", // Geração de CPF fictício
        notaMedia: 0,
        ativo: true,
        fotoUsuario:'https://pt.quizur.com/_image?href=https://img.quizur.com/f/img63365b54eee492.52029189.png?lastEdited=1664506795&w=600&h=600&f=webp',
        grupos: [admin._id]
    }
    usuarios.push({...dev})
    usuarios.push({...user})
    usuarios.push({...dev2})
    usuarios.push({...Dono})
    // Inserir no banco
    await Usuario.collection.insertMany(usuarios);
    // console.log(`${usuarios.length} usuários inseridos com sucesso!`);

    // Fechar conexão
    return await Usuario.find()

}

export default SeedUsuario
