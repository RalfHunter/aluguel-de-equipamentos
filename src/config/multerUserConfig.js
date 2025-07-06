import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const diretorio = 'uploads/usuarios';

if (!fs.existsSync(diretorio)) {
  fs.mkdirSync(diretorio, { recursive: true });
}

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

const uploadUsuario = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB para fotos de usuário
  },
  fileFilter: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const permitidas = ['.jpg', '.jpeg', '.png'];

    if (!permitidas.includes(extensao)) {
      return cb(new Error("Extensão de imagem inválida. Apenas JPG, JPEG e PNG são permitidos."), false);
    }

    cb(null, true);
  }
});

export default uploadUsuario;
