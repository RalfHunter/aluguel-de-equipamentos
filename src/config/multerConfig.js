import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Caminho onde as imagens dos equipamentos serão salvas
const diretorio = 'uploads/equipamentos';

// Garante que o diretório exista
if (!fs.existsSync(diretorio)) {
  fs.mkdirSync(diretorio, { recursive: true });
}

// Configuração do armazenamento dos arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, diretorio);
  },
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const nomeUnico = `${uuidv4()}${extensao}`;
    cb(null, nomeUnico);
  }
});

// Configuração final do multer
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const permitidas = ['.jpg', '.jpeg', '.png'];

    if (!permitidas.includes(extensao)) {
      return cb(new Error("Extensão de imagem inválida."), false);
    }

    cb(null, true);
  }
});

export default upload;
