import Equipamento from "../models/Equipamento.js";
import getGlobalFakeMapping from "./globalFakeMapping.js";
import { categoriasValidasArray } from "../utils/validators/schemas/zod/EquipamentoSchema.js";

async function SeedEquipamentos(usuarios) {
  await Equipamento.deleteMany();

  const fake = await getGlobalFakeMapping();

  const equipamentos = [];

  for (let i = 0; i < usuarios.length; i++) {
    const status = fake.equiStatus();

    equipamentos.push({
      equiNome: fake.equiNome(),
      equiDescricao: fake.equiDescricao(),
      equiValorDiaria: fake.equiValorDiaria(),
      equiQuantidadeDisponivel: fake.equiQuantidadeDisponivel(),
      equiCategoria: categoriasValidasArray[Math.floor(Math.random() * categoriasValidasArray.length)],

      equiStatus: status,
      equiUsuario: usuarios[i]._id,
      equiFotos: fake.equiFotos(),
      equiNotaMediaAvaliacao: 0,
      equiAvaliacoes: [],
    });
  }

  const result = await Equipamento.insertMany(equipamentos);
  console.log(`${result.length} Equipamentos inseridos com sucesso!`);
  return result;
}

export default SeedEquipamentos;
