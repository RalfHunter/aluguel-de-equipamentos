import mongoose from "mongoose";
import Reserva from "../models/Reserva.js";
import DbConnect from "../config/DbConnect.js";
import getGlobalFakeMapping from "./globalFakeMapping.js";

await DbConnect.conectar();

async function SeedReserva(usuarios, equipamentos) {
  try {
    await Reserva.deleteMany();
    console.log("Coleção de reservas limpa.");

    const globalFakeMapping = await getGlobalFakeMapping();
    const reservas = [];

    if (usuarios.length === 0) {
      throw new Error("Nenhum usuário encontrado. Rode o seed de usuários primeiro.");
    }

    if (equipamentos.length === 0) {
      throw new Error("Nenhum equipamento encontrado. Rode o seed de equipamentos primeiro.");
    }

    for (let i = 0; i < 10; i++) {
      const usuario = usuarios[i % usuarios.length]; // Seleciona usuário ciclicamente
      const equipamento = equipamentos[i % equipamentos.length]; // Seleciona equipamento ciclicamente

      const reserva = {
        dataInicial: globalFakeMapping.dataInicial(),
        dataFinal: globalFakeMapping.dataFinal(),
        dataFinalAtrasada: globalFakeMapping.dataFinalAtrasada(),
        quantidadeEquipamento: globalFakeMapping.quantidadeEquipamento(),
        valorEquipamento: globalFakeMapping.valorEquipamento(),
        enderecoEquipamento: globalFakeMapping.enderecoEquipamento(),
        statusReserva: globalFakeMapping.statusReserva(),
        equipamentos: equipamento._id, 
        usuarios: usuario._id 
      };

      reservas.push(reserva);
    }


    const resultados = await Reserva.collection.insertMany(reservas, { ordered: false, rawResult: true });


    const reservasCriadas = await Reserva.find();
    console.log(`Reservas encontradas após inserção: ${reservasCriadas.length}`);

    return reservasCriadas;
  } catch (error) {
    console.error("Erro ao criar reservas:", error);
    throw error;
  }
}

export default SeedReserva;